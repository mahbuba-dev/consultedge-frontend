"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useChatRooms } from "@/src/hooks/useChatRooms";
import { usePresence } from "@/src/hooks/usePresence";
import { useRoomMessages } from "@/src/hooks/useRoomMessages";
import { useTyping } from "@/src/hooks/useTyping";
import { useWebRTCCall } from "@/src/hooks/useWebRTCCall";
import { useChatSocketContext } from "@/src/providers/ChatSocketProvider";
import { getParticipantDisplayName } from "@/src/services/chatRoom.service";
import CallPanel from "./CallPanel";
import ChatEmptyState from "./ChatEmptyState";
import ChatRoomHeader from "./ChatRoomHeader";
import ChatSidebar from "./ChatSidebar";
import IncomingCallBanner from "./IncomingCallBanner";
import MessageComposer from "./MessageComposer";
import MessageList from "./MessageList";
import TypingIndicator from "./TypingIndicator";

interface ChatWorkspaceProps {
  basePath: string;
  dashboardHref: string;
  selectedRoomId?: string;
  expertId?: string;
  participantId?: string;
  title?: string;
  description?: string;
  readOnly?: boolean;
}

export default function ChatWorkspace({
  basePath,
  dashboardHref,
  selectedRoomId,
  expertId,
  participantId,
  title = "Messages",
  description = "Keep every consultation conversation in one place.",
  readOnly = false,
}: ChatWorkspaceProps) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const attemptedRoomTargetRef = useRef<string | null>(null);
  const roomTargetId = participantId ?? expertId;

  const {
    connectionState,
    isFallbackPolling,
    setActiveRoomId,
    subscribeRoom,
    unsubscribeRoom,
    markRoomAsRead,
  } = useChatSocketContext();
  const { currentUser, getPresence } = usePresence();
  const {
    rooms,
    isLoading: isRoomsLoading,
    error: roomsError,
    refetch: refetchRooms,
    ensureRoom,
    isCreatingRoom,
  } = useChatRooms();

  const visibleRooms = useMemo(() => {
    if (!currentUser?.role) {
      return rooms;
    }

    if (currentUser.role === "EXPERT") {
      return rooms.filter(
        (room) =>
          room.participants.length === 0 ||
          room.participants.some((participant) => participant.role === "CLIENT"),
      );
    }

    if (currentUser.role === "CLIENT") {
      return rooms.filter(
        (room) =>
          room.participants.length === 0 ||
          room.participants.some((participant) => participant.role === "EXPERT"),
      );
    }

    return rooms;
  }, [currentUser?.role, rooms]);

  const selectedRoom = useMemo(
    () => visibleRooms.find((room) => room.id === selectedRoomId) ?? null,
    [selectedRoomId, visibleRooms],
  );

  useEffect(() => {
    if (!roomTargetId || selectedRoomId || attemptedRoomTargetRef.current === roomTargetId) {
      return;
    }

    attemptedRoomTargetRef.current = roomTargetId;

    ensureRoom(roomTargetId)
      .then((room) => {
        if (room?.id) {
          void refetchRooms();
          router.replace(`${basePath}/${room.id}`);
          return;
        }

        attemptedRoomTargetRef.current = null;
        toast.error("We could not open this conversation yet.");
      })
      .catch((error) => {
        attemptedRoomTargetRef.current = null;
        toast.error(error instanceof Error ? error.message : "Unable to open the chat room.");
      });
  }, [basePath, ensureRoom, roomTargetId, refetchRooms, router, selectedRoomId]);

  useEffect(() => {
    if (selectedRoomId || roomTargetId || !visibleRooms.length) {
      return;
    }

    router.replace(`${basePath}/${visibleRooms[0].id}`);
  }, [basePath, roomTargetId, router, selectedRoomId, visibleRooms]);

  useEffect(() => {
    if (!selectedRoomId || isRoomsLoading || roomsError || selectedRoom) {
      return;
    }

    if (visibleRooms.length > 0) {
      toast.error("That conversation is unavailable. Opening your latest room instead.");
      router.replace(`${basePath}/${visibleRooms[0].id}`);
      return;
    }

    toast.error("That conversation is no longer available.");
    router.replace(basePath);
  }, [basePath, isRoomsLoading, roomsError, router, selectedRoom, selectedRoomId, visibleRooms]);

  const otherParticipant = useMemo(() => {
    return selectedRoom?.participants.find(
      (participant) => (participant.userId ?? participant.id) !== currentUser?.userId,
    );
  }, [currentUser?.userId, selectedRoom]);

  const otherParticipantPresence = getPresence(otherParticipant?.userId ?? otherParticipant?.id);
  const activeRoomId = selectedRoom?.id;
  const isReadOnly = readOnly || currentUser?.role === "ADMIN";

  useEffect(() => {
    if (!activeRoomId) {
      setActiveRoomId(null);
      return;
    }

    setActiveRoomId(activeRoomId);
    subscribeRoom(activeRoomId);
    markRoomAsRead(activeRoomId);

    return () => {
      unsubscribeRoom(activeRoomId);
      setActiveRoomId((current) => (current === activeRoomId ? null : current));
    };
  }, [
    activeRoomId,
    markRoomAsRead,
    setActiveRoomId,
    subscribeRoom,
    unsubscribeRoom,
  ]);

  const {
    messages,
    isLoading: isMessagesLoading,
    error: messagesError,
    refetch: refetchMessages,
    sendMessage,
    uploadAttachment,
    isSending,
    isUploading,
  } = useRoomMessages(activeRoomId);

  const { typingUsers, triggerTyping } = useTyping(activeRoomId);
  const {
    callState,
    isInCall,
    incomingCall,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    declineCall,
    endCall,
  } = useWebRTCCall(activeRoomId);

  const handleSelectRoom = (roomId: string) => {
    router.push(`${basePath}/${roomId}`);
  };

  const handleSendMessage = async (text: string) => {
    try {
      await sendMessage({ text });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Message sending failed.");
    }
  };

  const handleUploadAttachment = async (file: File) => {
    try {
      await uploadAttachment(file);
      toast.success(`${file.name} uploaded successfully.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Attachment upload failed.");
    }
  };

  const incomingCallerName =
    incomingCall?.callerName || getParticipantDisplayName(otherParticipant) || "ConsultEdge user";

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <ChatSidebar
            rooms={[]}
            currentUserId={undefined}
            selectedRoomId={undefined}
            isLoading
            isRefreshing={false}
            title={title}
            description={description}
            role={null}
            onRefresh={() => undefined}
            onSelectRoom={() => undefined}
          />

          <div className="flex min-h-[70vh] flex-col rounded-2xl border bg-background shadow-sm">
            <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
              Loading conversation...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <ChatSidebar
          rooms={visibleRooms}
          currentUserId={currentUser?.userId}
          selectedRoomId={selectedRoom?.id}
          isLoading={isRoomsLoading || isCreatingRoom}
          isRefreshing={isRoomsLoading}
          title={title}
          description={description}
          role={currentUser?.role ?? null}
          onRefresh={() => void refetchRooms()}
          onSelectRoom={handleSelectRoom}
        />

        <div className="flex min-h-[70vh] flex-col rounded-2xl border bg-background shadow-sm">
          {roomsError && !rooms.length ? (
            <div className="flex h-full items-center justify-center p-4">
              <Card className="max-w-xl border-destructive/20 bg-destructive/5">
                <CardContent className="space-y-4 p-6 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <AlertCircle className="size-6" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Chat service is currently unavailable</h2>
                    <p className="text-sm text-muted-foreground">
                      The messaging API may still be starting up, or this account does not have an active room yet.
                    </p>
                  </div>
                  <Button type="button" onClick={() => void refetchRooms()}>
                    Try again
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : !selectedRoom ? (
            visibleRooms.length > 0 ? (
              <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
                Opening your latest conversation...
              </div>
            ) : (
              <ChatEmptyState
                expertId={roomTargetId}
                isLoading={Boolean(roomTargetId && isCreatingRoom)}
                dashboardHref={dashboardHref}
                role={currentUser?.role ?? null}
              />
            )
          ) : (
            <>
              <ChatRoomHeader
                room={selectedRoom}
                currentUserId={currentUser?.userId}
                connectionState={connectionState}
                isFallbackPolling={isFallbackPolling}
                isOnline={otherParticipantPresence?.isOnline ?? otherParticipant?.isOnline ?? false}
                lastSeen={otherParticipantPresence?.lastSeen ?? otherParticipant?.lastSeen ?? null}
                readOnly={isReadOnly}
                isInCall={isInCall}
                onStartCall={() => void startCall()}
                onEndCall={() => void endCall()}
              />

              <div className="space-y-3 border-b px-4 py-3 md:px-6">
                <IncomingCallBanner
                  isVisible={callState === "incoming" && incomingCall?.roomId === activeRoomId}
                  callerName={incomingCallerName}
                  onAccept={() => void acceptCall()}
                  onDecline={() => void declineCall()}
                />
              </div>

              <div className="min-h-0 flex-1">
                {messagesError ? (
                  <div className="flex h-full items-center justify-center p-4">
                    <Card className="max-w-lg">
                      <CardContent className="space-y-4 p-6 text-center">
                        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                          <AlertCircle className="size-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Unable to load messages</h3>
                          <p className="text-sm text-muted-foreground">
                            Refresh the room to sync the latest conversation history.
                          </p>
                        </div>
                        <Button type="button" variant="outline" onClick={() => void refetchMessages()}>
                          Refresh room
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <MessageList
                    messages={messages}
                    currentUserId={currentUser?.userId}
                    isLoading={isMessagesLoading}
                    roomId={activeRoomId}
                  />
                )}
              </div>

              <div className="space-y-3 border-t p-4 md:px-6">
                <TypingIndicator
                  names={typingUsers.map((entry) => entry.name || "Someone")}
                />
                <MessageComposer
                  disabled={isReadOnly}
                  isSending={isSending}
                  isUploading={isUploading}
                  onSendMessage={handleSendMessage}
                  onUploadAttachment={handleUploadAttachment}
                  onTyping={triggerTyping}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <CallPanel
        open={isInCall}
        callState={callState}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        remoteName={incomingCallerName}
        onEndCall={() => void endCall()} isCaller={false}      />
    </div>
  );
}
