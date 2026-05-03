"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useChatRooms } from "@/src/hooks/useChatRooms";
import { usePresence } from "@/src/hooks/usePresence";
import { useRoomMessages } from "@/src/hooks/useRoomMessages";
import { useTyping } from "@/src/hooks/useTyping";
import { useWebRTCCall } from "@/src/hooks/useWebRTCCall";
import { useChatSocketContext } from "@/src/providers/ChatSocketProvider";
import {
  getCurrentUserReactionEmoji,
  getOtherParticipants,
  getParticipantDisplayName,
} from "@/src/services/chatRoom.service";
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
  const attemptedRoomTargetRef = useRef<string | null>(null);
  const roomTargetId = participantId ?? expertId;

  const {
    connectionState,
    isFallbackPolling,
    setActiveRoomId,
    subscribeRoom,
    unsubscribeRoom,
    markRoomAsRead,
    emit,
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
    if (!selectedRoom) {
      return null;
    }

    return (
      getOtherParticipants({
        participants: selectedRoom.participants,
        currentUserId: currentUser?.userId,
        currentUserRole: currentUser?.role,
      })[0] ?? null
    );
  }, [currentUser?.role, currentUser?.userId, selectedRoom]);

  const otherParticipantPresence = getPresence(otherParticipant?.userId ?? otherParticipant?.id);
  const activeRoomId = selectedRoom?.id;
  const isReadOnly = readOnly;

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
    applyOptimisticReaction,
    sendMessage,
    toggleReaction,
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

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (!activeRoomId || !messageId || !emoji || !currentUser?.userId) {
      return;
    }

    const targetMessage = messages.find((message) => message.id === messageId);
    const currentReactionEmoji = targetMessage
      ? getCurrentUserReactionEmoji(targetMessage, currentUser.userId)
      : null;

    const rollback = applyOptimisticReaction({ messageId, emoji });

    if (connectionState === "connected") {
      if (currentReactionEmoji && currentReactionEmoji !== emoji) {
        emit("toggle_reaction", {
          roomId: activeRoomId,
          messageId,
          emoji: currentReactionEmoji,
        });
      }

      emit("toggle_reaction", {
        roomId: activeRoomId,
        messageId,
        emoji,
      });
      return;
    }

    try {
      if (currentReactionEmoji && currentReactionEmoji !== emoji) {
        await toggleReaction({ messageId, emoji: currentReactionEmoji });
      }

      await toggleReaction({ messageId, emoji });
    } catch (error: any) {
      rollback();

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update reaction right now.";

      toast.error(message);
    }
  };

  const incomingCallerName =
    incomingCall?.callerName || getParticipantDisplayName(otherParticipant) || "ConsultEdge user";

  const hasActiveRoom = Boolean(selectedRoom);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className={`min-w-0 ${hasActiveRoom ? "hidden xl:block" : "block"}`}>
          <ChatSidebar
            rooms={visibleRooms}
            currentUserId={currentUser?.userId}
            currentUserRole={currentUser?.role}
            selectedRoomId={selectedRoom?.id}
            isLoading={isRoomsLoading || isCreatingRoom}
            isRefreshing={isRoomsLoading}
            title={title}
            description={description}
            role={currentUser?.role ?? null}
            onRefresh={() => void refetchRooms()}
            onSelectRoom={handleSelectRoom}
          />
        </div>

        <div
          className={`min-h-[70vh] min-w-0 flex-col overflow-hidden rounded-2xl border bg-background shadow-sm xl:flex ${
            hasActiveRoom ? "flex" : "hidden xl:flex"
          }`}
        >
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
              <div className="flex items-center justify-between border-b px-4 py-2 xl:hidden">
                <button
                  type="button"
                  onClick={() => router.push(basePath)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-700 backdrop-blur transition hover:border-blue-300 hover:text-blue-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300"
                >
                  <ArrowLeft className="size-3.5" />
                  Back to chats
                </button>
              </div>

              <ChatRoomHeader
                room={selectedRoom}
                currentUserId={currentUser?.userId}
                currentUserRole={currentUser?.role}
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
                    onToggleReaction={handleToggleReaction}
                  />
                )}
              </div>

              <div className="space-y-3 border-t p-4 md:px-6">
                <TypingIndicator
                  names={typingUsers.map((entry) => entry.name || "Someone")}
                />
                {isReadOnly ? (
                  <div className="rounded-2xl border border-dashed bg-muted/40 px-4 py-3 text-center text-xs text-muted-foreground">
                    Admin view is read-only. You can monitor this conversation but cannot send messages.
                  </div>
                ) : (
                  <MessageComposer
                    disabled={isReadOnly}
                    isSending={isSending}
                    isUploading={isUploading}
                    onSendMessage={handleSendMessage}
                    onUploadAttachment={handleUploadAttachment}
                    onTyping={triggerTyping}
                  />
                )}
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
