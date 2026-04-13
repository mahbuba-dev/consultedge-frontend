type ConnectionState = "connecting" | "connected" | "reconnecting" | "disconnected";

type WsEnvelope =
  | { type: "connected"; payload?: unknown }
  | { type: "event"; event?: string; roomId?: string; payload?: unknown }
  | { type: "error"; message?: string; payload?: unknown }
  | { type: "pong" };

type EventHandler = (payload: any) => void;
type StateHandler = (state: ConnectionState) => void;

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 20000;
const HEARTBEAT_INTERVAL_MS = 25000;
const PONG_TIMEOUT_MS = 12000;
const MAX_MISSED_PONGS = 2;

const parseJsonSafely = (value: string): WsEnvelope | null => {
  try {
    return JSON.parse(value) as WsEnvelope;
  } catch {
    return null;
  }
};

const normalizeBaseOrigin = () => {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (configured) {
    return configured.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:5000";
};

const readAccessTokenFallback = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const fromStorage =
    window.localStorage.getItem("accessToken") ||
    window.localStorage.getItem("token") ||
    window.sessionStorage.getItem("accessToken") ||
    window.sessionStorage.getItem("token");

  if (fromStorage) {
    return fromStorage;
  }

  const cookieMatch = document.cookie.match(/(?:^|;\s*)accessToken=([^;]+)/);
  return cookieMatch?.[1] ? decodeURIComponent(cookieMatch[1]) : null;
};

class ChatWebSocketClient {
  private socket: WebSocket | null = null;
  private state: ConnectionState = "disconnected";
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private pongTimer: ReturnType<typeof setTimeout> | null = null;
  private missedPongs = 0;
  private manuallyClosed = false;
  private fallbackToken: string | null = null;
  private subscribedRooms = new Set<string>();
  private eventHandlers = new Map<string, Set<EventHandler>>();
  private stateHandlers = new Set<StateHandler>();

  getConnectionState() {
    return this.state;
  }

  setFallbackToken(token?: string | null) {
    this.fallbackToken = token || null;
  }

  connect() {
    if (typeof window === "undefined") {
      return;
    }

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.manuallyClosed = false;
    this.setState(this.reconnectAttempt > 0 ? "reconnecting" : "connecting");

    const url = this.buildSocketUrl();
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.reconnectAttempt = 0;
      this.missedPongs = 0;
      this.setState("connected");
      this.startHeartbeat();

      this.subscribedRooms.forEach((roomId) => {
        this.sendJson({ type: "subscribe", roomId });
      });
    };

    this.socket.onmessage = (event) => {
      if (typeof event.data !== "string") {
        return;
      }

      const parsed = parseJsonSafely(event.data);
      if (!parsed) {
        return;
      }

      if (parsed.type === "pong") {
        this.handlePong();
        return;
      }

      if (parsed.type === "connected") {
        this.emitEvent("connected", parsed.payload ?? null);
        return;
      }

      if (parsed.type === "error") {
        this.emitEvent("chat_error", parsed.payload ?? { message: parsed.message || "Realtime connection error" });
        return;
      }

      if (parsed.type === "event" && parsed.event) {
        const payload =
          parsed.payload && typeof parsed.payload === "object"
            ? {
                ...(parsed.payload as Record<string, unknown>),
                ...(parsed.roomId ? { roomId: (parsed.payload as any)?.roomId ?? parsed.roomId } : {}),
              }
            : parsed.roomId
              ? { roomId: parsed.roomId, payload: parsed.payload }
              : parsed.payload;

        this.emitEvent(parsed.event, payload);
      }
    };

    this.socket.onclose = () => {
      this.clearHeartbeat();

      if (this.manuallyClosed) {
        this.setState("disconnected");
        return;
      }

      this.scheduleReconnect();
    };

    this.socket.onerror = () => {
      this.emitEvent("chat_error", { message: "Realtime transport encountered an error." });
    };
  }

  disconnect() {
    this.manuallyClosed = true;
    this.clearReconnectTimer();
    this.clearHeartbeat();
    this.socket?.close();
    this.socket = null;
    this.setState("disconnected");
  }

  subscribeRoom(roomId: string) {
    if (!roomId) {
      return;
    }

    this.subscribedRooms.add(roomId);
    this.sendJson({ type: "subscribe", roomId });
  }

  unsubscribeRoom(roomId: string) {
    if (!roomId) {
      return;
    }

    this.subscribedRooms.delete(roomId);
    this.sendJson({ type: "unsubscribe", roomId });
  }

  emit(event: string, payload?: unknown) {
    this.sendJson({ type: "event", event, payload });
  }

  on(event: string, handler: EventHandler) {
    const handlers = this.eventHandlers.get(event) ?? new Set<EventHandler>();
    handlers.add(handler);
    this.eventHandlers.set(event, handlers);
  }

  off(event: string, handler: EventHandler) {
    const handlers = this.eventHandlers.get(event);
    if (!handlers) {
      return;
    }

    handlers.delete(handler);

    if (handlers.size === 0) {
      this.eventHandlers.delete(event);
    }
  }

  onStateChange(handler: StateHandler) {
    this.stateHandlers.add(handler);
  }

  offStateChange(handler: StateHandler) {
    this.stateHandlers.delete(handler);
  }

  private emitEvent(event: string, payload: any) {
    const handlers = this.eventHandlers.get(event);
    if (!handlers?.size) {
      return;
    }

    handlers.forEach((handler) => handler(payload));
  }

  private setState(next: ConnectionState) {
    if (this.state === next) {
      return;
    }

    this.state = next;
    this.stateHandlers.forEach((handler) => handler(next));
  }

  private buildSocketUrl() {
    const baseOrigin = normalizeBaseOrigin();
    const parsed = new URL(baseOrigin);

    const prefersSecure = process.env.NODE_ENV === "production" || parsed.protocol === "https:";
    parsed.protocol = prefersSecure ? "wss:" : "ws:";
    parsed.pathname = "/ws/chat";
    parsed.search = "";

    const token = this.fallbackToken || readAccessTokenFallback();
    if (token) {
      parsed.searchParams.set("token", token);
    }

    return parsed.toString();
  }

  private sendJson(payload: unknown) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    this.socket.send(JSON.stringify(payload));
  }

  private startHeartbeat() {
    this.clearHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      this.sendJson({ type: "ping" });
      this.armPongTimeout();
    }, HEARTBEAT_INTERVAL_MS);
  }

  private armPongTimeout() {
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
    }

    this.pongTimer = setTimeout(() => {
      this.missedPongs += 1;

      if (this.missedPongs >= MAX_MISSED_PONGS) {
        this.socket?.close();
      }
    }, PONG_TIMEOUT_MS);
  }

  private handlePong() {
    this.missedPongs = 0;

    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
  }

  private scheduleReconnect() {
    this.clearReconnectTimer();
    this.setState("reconnecting");

    const delay = Math.min(
      RECONNECT_BASE_DELAY_MS * 2 ** this.reconnectAttempt,
      RECONNECT_MAX_DELAY_MS,
    );

    this.reconnectAttempt += 1;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }
}

let socketInstance: ChatWebSocketClient | null = null;

export const getChatSocketClient = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (!socketInstance) {
    socketInstance = new ChatWebSocketClient();
  }

  return socketInstance;
};

export const disconnectChatSocketClient = () => {
  socketInstance?.disconnect();
  socketInstance = null;
};

export type ChatSocketConnectionState = ConnectionState;
