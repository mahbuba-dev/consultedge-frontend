import type * as AblyTypes from "ably";

type AblyModule = typeof import("ably");

let ablyModulePromise: Promise<AblyModule> | null = null;

const loadAbly = (): Promise<AblyModule> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Ably can only be loaded in the browser."));
  }

  if (!ablyModulePromise) {
    ablyModulePromise = import("ably");
  }

  return ablyModulePromise;
};

type ConnectionState = "connecting" | "connected" | "reconnecting" | "disconnected";

type EventHandler = (payload: any) => void;
type StateHandler = (state: ConnectionState) => void;

const normalizeApiBaseUrl = () => {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!raw) {
    if (typeof window !== "undefined") {
      return `${window.location.origin.replace(/\/+$/, "")}/api/v1`;
    }
    return "http://localhost:5000/api/v1";
  }

  const trimmed = raw.replace(/\/+$/, "");
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
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

const mapAblyState = (state: string): ConnectionState => {
  switch (state) {
    case "connected":
      return "connected";
    case "connecting":
    case "initialized":
      return "connecting";
    case "disconnected":
    case "suspended":
      return "reconnecting";
    case "closing":
    case "closed":
    case "failed":
    default:
      return "disconnected";
  }
};

const safeDetach = (channel: AblyTypes.RealtimeChannel) => {
  // channel.detach() throws synchronously OR rejects asynchronously when the
  // channel is in `failed` / `suspended` state. Only call it for states where
  // detaching is meaningful, and absorb both outcomes.
  const state = (channel as unknown as { state?: string }).state;
  if (state !== "attached" && state !== "attaching") {
    return;
  }

  try {
    const result = channel.detach() as unknown as Promise<unknown> | undefined;
    if (result && typeof (result as Promise<unknown>).then === "function") {
      (result as Promise<unknown>).then(
        () => undefined,
        () => undefined,
      );
    }
  } catch {
    /* noop */
  }
};

const safeUnsubscribe = (channel: AblyTypes.RealtimeChannel) => {
  try {
    channel.unsubscribe();
  } catch {
    /* noop */
  }
};

const roomChannelName = (roomId: string) => `private-room-${roomId}`;
const userChannelName = (userId: string) => `private-user-${userId}`;

// Benign Ably errors that can surface as unhandled promise rejections when a
// channel transitions to "failed" due to backend capability issues or when
// multiple attach/detach requests race. Swallow them so Next.js dev doesn't
// treat them as fatal runtime errors.
const ABLY_IGNORABLE_MESSAGE_PATTERNS = [
  /Detach request superseded by a subsequent attach request/i,
  /Channel denied access based on given capability/i,
  /Channel operation failed as channel state is failed/i,
  /Unable to detach; channel state =/i,
];

let unhandledRejectionGuardInstalled = false;

const installAblyUnhandledRejectionGuard = () => {
  if (unhandledRejectionGuardInstalled || typeof window === "undefined") {
    return;
  }

  unhandledRejectionGuardInstalled = true;

  window.addEventListener("unhandledrejection", (event) => {
    const reason: unknown = (event as PromiseRejectionEvent).reason;
    const message =
      (reason as { message?: unknown })?.message ??
      (typeof reason === "string" ? reason : "");

    const text = typeof message === "string" ? message : String(message ?? "");

    if (ABLY_IGNORABLE_MESSAGE_PATTERNS.some((pattern) => pattern.test(text))) {
      event.preventDefault();
      if (process.env.NODE_ENV !== "production") {
        console.debug("[realtime] suppressed benign Ably rejection:", text);
      }
    }
  });
};

class ChatRealtimeClient {
  private realtime: AblyTypes.Realtime | null = null;
  private state: ConnectionState = "disconnected";
  private manuallyClosed = false;
  private fallbackToken: string | null = null;
  private userId: string | null = null;
  private tokenFailureCount = 0;
  private lastErrorMessage: string | null = null;
  private userChannel: AblyTypes.RealtimeChannel | null = null;
  private trackedRoomIds = new Set<string>();
  private roomChannels = new Map<string, AblyTypes.RealtimeChannel>();
  private eventHandlers = new Map<string, Set<EventHandler>>();
  private stateHandlers = new Set<StateHandler>();

  getConnectionState() {
    return this.state;
  }

  setFallbackToken(token?: string | null) {
    this.fallbackToken = token || null;
  }

  setUserId(userId?: string | null) {
    this.userId = userId || null;
  }

  connect() {
    if (typeof window === "undefined") {
      return;
    }

    installAblyUnhandledRejectionGuard();

    if (this.realtime) {
      return;
    }

    this.manuallyClosed = false;
    this.setState("connecting");

    loadAbly()
      .then((AblyModule) => {
        if (this.manuallyClosed) {
          return;
        }

        this.realtime = new AblyModule.Realtime({
          authCallback: (_tokenParams, callback) => {
            this.fetchTokenRequest()
              .then((tokenRequest) => {
                this.tokenFailureCount = 0;
                callback(null, tokenRequest);
              })
              .catch((error) => {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Failed to fetch realtime token.";

                this.tokenFailureCount += 1;
                callback(message, null);

                if (this.tokenFailureCount === 1) {
                  this.emitEvent("chat_error", { message });
                }

                // Backend isn't ready (ABLY_API_KEY missing / endpoint failing).
                // Stop the reconnection loop instead of spamming the user.
                if (this.tokenFailureCount >= 2) {
                  this.shutdownQuietly();
                }
              });
          },
          autoConnect: true,
          echoMessages: false,
        });

        this.bindConnectionEvents();
      })
      .catch((error) => {
        this.setState("disconnected");
        this.emitEvent("chat_error", {
          message:
            error instanceof Error ? error.message : "Unable to initialize realtime client.",
        });
      });
  }

  private bindConnectionEvents() {
    if (!this.realtime) {
      return;
    }

    this.realtime.connection.on((change: AblyTypes.ConnectionStateChange) => {
      const mapped = mapAblyState(change.current);
      this.setState(mapped);

      if (change.reason && mapped !== "connected") {
        const message = change.reason.message || "Realtime connection error.";

        // Only surface a given error message once per session to avoid toast spam
        // on repeated reconnect attempts (e.g., token endpoint returning 500).
        if (this.lastErrorMessage !== message) {
          this.lastErrorMessage = message;
          this.emitEvent("chat_error", {
            message,
            status: change.reason.statusCode,
            code: change.reason.code,
          });
        }
      }

      if (mapped === "connected") {
        this.lastErrorMessage = null;
        this.attachUserChannel();
        for (const roomId of this.trackedRoomIds) {
          this.attachRoomChannel(roomId);
        }
        this.emitEvent("connected", { userId: this.userId });
      }
    });
  }

  private shutdownQuietly() {
    this.manuallyClosed = true;

    if (this.realtime) {
      try {
        this.realtime.close();
      } catch {
        /* noop */
      }
      this.realtime = null;
    }

    this.setState("disconnected");
  }

  disconnect() {
    // Break out of the function early if the module is still loading.

    this.manuallyClosed = true;

    this.roomChannels.forEach((channel) => {
      safeUnsubscribe(channel);
      safeDetach(channel);
    });
    this.roomChannels.clear();
    this.trackedRoomIds.clear();

    if (this.userChannel) {
      safeUnsubscribe(this.userChannel);
      safeDetach(this.userChannel);
      this.userChannel = null;
    }

    if (this.realtime) {
      try {
        this.realtime.close();
      } catch {
        /* noop */
      }
      this.realtime = null;
    }

    this.setState("disconnected");
  }

  subscribeRoom(roomId: string) {
    if (!roomId) {
      return;
    }

    if (!this.roomChannels.has(roomId)) {
      this.trackedRoomIds.add(roomId);
    }

    this.attachRoomChannel(roomId);
  }

  unsubscribeRoom(roomId: string) {
    if (!roomId) {
      return;
    }

    const channel = this.roomChannels.get(roomId);
    if (channel) {
      safeUnsubscribe(channel);
      safeDetach(channel);
    }
    this.roomChannels.delete(roomId);
    this.trackedRoomIds.delete(roomId);
  }

  // Publishing is handled by the backend via Ably REST (publishToRoom /
  // publishToUser). The frontend only subscribes to channels, so emit() is a
  // no-op. Features like typing indicators and WebRTC signaling must be sent
  // through a backend HTTP endpoint rather than directly to Ably.
  emit(_event: string, _payload?: unknown) {
    return;
  }

  on(event: string, handler: EventHandler) {
    const handlers = this.eventHandlers.get(event) ?? new Set<EventHandler>();
    handlers.add(handler);
    this.eventHandlers.set(event, handlers);
  }

  off(event: string, handler: EventHandler) {
    const handlers = this.eventHandlers.get(event);
    if (!handlers) return;
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

  private async fetchTokenRequest() {
    const baseUrl = normalizeApiBaseUrl();
    const token = this.fallbackToken || readAccessTokenFallback();

    const response = await fetch(`${baseUrl}/realtime/token`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Realtime token request failed (${response.status})`);
    }

    const body = await response.json();
    const tokenRequest = body?.data ?? body?.tokenRequest ?? body;

    if (!tokenRequest || typeof tokenRequest !== "object") {
      throw new Error("Invalid realtime token response.");
    }

    return tokenRequest as AblyTypes.TokenRequest;
  }

  private attachRoomChannel(roomId: string): AblyTypes.RealtimeChannel | null {
    if (!this.realtime) {
      return null;
    }

    const existing = this.roomChannels.get(roomId);
    if (existing) {
      return existing;
    }

    const name = roomChannelName(roomId);
    const channel = this.realtime.channels.get(name);

    // Track the channel immediately so concurrent subscribeRoom calls don't
    // create duplicate attach attempts, which trigger Ably's "Detach request
    // superseded by a subsequent attach request" internal rejections.
    this.roomChannels.set(roomId, channel);
    this.trackedRoomIds.add(roomId);

    channel.on("failed", (stateChange) => {
      const message = stateChange?.reason?.message || `Channel ${name} failed.`;
      if (this.lastErrorMessage !== message) {
        this.lastErrorMessage = message;
        this.emitEvent("chat_error", {
          message,
          status: stateChange?.reason?.statusCode,
          code: stateChange?.reason?.code,
        });
      }
    });

    // Don't call channel.attach() explicitly. channel.subscribe() implicitly
    // attaches, which means we only trigger one attach request per channel and
    // avoid the "superseded" rejection. Use subscribeAll (no event name) so
    // a single subscription handles every event delivered on this channel.
    try {
      const sub = channel.subscribe((message) => {
        const eventName = message.name;
        if (!eventName) {
          return;
        }
        const data = (message.data ?? {}) as Record<string, unknown>;
        const enriched =
          data && typeof data === "object"
            ? { ...data, roomId: (data as any).roomId ?? roomId }
            : { roomId, payload: data };
        this.emitEvent(eventName, enriched);
      }) as unknown as Promise<unknown> | undefined;
      if (sub && typeof (sub as any).then === "function") {
        (sub as Promise<unknown>).then(
          () => undefined,
          () => undefined,
        );
      }
    } catch {
      /* noop */
    }

    return channel;
  }

  private attachUserChannel() {
    if (!this.realtime || !this.userId) {
      return;
    }

    if (this.userChannel) {
      return;
    }

    const channel = this.realtime.channels.get(userChannelName(this.userId));
    this.userChannel = channel;

    try {
      const sub = channel.subscribe((message) => {
        const eventName = message.name;
        if (!eventName) {
          return;
        }
        this.emitEvent(eventName, message.data ?? {});
      }) as unknown as Promise<unknown> | undefined;
      if (sub && typeof (sub as any).then === "function") {
        (sub as Promise<unknown>).then(
          () => undefined,
          () => undefined,
        );
      }
    } catch {
      /* noop */
    }
  }

  private emitEvent(event: string, payload: any) {
    const handlers = this.eventHandlers.get(event);
    if (!handlers?.size) return;
    handlers.forEach((handler) => handler(payload));
  }

  private setState(next: ConnectionState) {
    if (this.state === next) return;
    this.state = next;
    this.stateHandlers.forEach((handler) => handler(next));
  }
}

let instance: ChatRealtimeClient | null = null;

export const getChatSocketClient = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (!instance) {
    instance = new ChatRealtimeClient();
  }

  return instance;
};

export const disconnectChatSocketClient = () => {
  instance?.disconnect();
  instance = null;
};

export type ChatSocketConnectionState = ConnectionState;
