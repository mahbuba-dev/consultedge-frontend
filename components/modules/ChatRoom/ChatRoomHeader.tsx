// import { ShieldCheck, Wifi, WifiOff } from "lucide-react";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { getParticipantDisplayName } from "@/src/services/chatRoom.service";
// import type { ChatRoom } from "@/src/types/chat.types";
// import CallControls from "./CallControls";
// import PresenceBadge from "./PresenceBadge";

// interface ChatRoomHeaderProps {
//   room: ChatRoom;
//   currentUserId?: string;
//   connectionState?: "connecting" | "connected" | "reconnecting" | "disconnected";
//   isFallbackPolling?: boolean;
//   isOnline?: boolean;
//   lastSeen?: string | null;
//   readOnly?: boolean;
//   isInCall?: boolean;
//   onStartCall: () => void;
//   onEndCall: () => void;
// }

// export default function ChatRoomHeader({
//   room,
//   currentUserId,
//   connectionState = "disconnected",
//   isFallbackPolling = false,
//   isOnline = false,
//   lastSeen,
//   readOnly = false,
//   isInCall = false,
//   onStartCall,
//   onEndCall,
// }: ChatRoomHeaderProps) {
//   const otherParticipants = room.participants.filter(
//     (participant) => (participant.userId ?? participant.id) !== currentUserId,
//   );

//   const primaryParticipant = otherParticipants[0] ?? room.participants[0];
//   const otherParticipantsLabel = otherParticipants
//     .map((participant) => getParticipantDisplayName(participant))
//     .join(", ");
//   const isDirectConversation = room.participants.length <= 2 && otherParticipants.length === 1;
//   const title = isDirectConversation
//     ? otherParticipantsLabel || room.name || "Conversation"
//     : room.name || otherParticipantsLabel || "Conversation";

//   const connectionCopy =
//     connectionState === "connected"
//       ? "Live"
//       : connectionState === "reconnecting"
//         ? "Reconnecting"
//         : isFallbackPolling
//           ? "Offline (polling)"
//           : "Connecting";

//   return (
//     <div className="flex flex-col gap-4 border-b p-4 md:flex-row md:items-center md:justify-between md:px-6">
//       <div className="flex items-center gap-3">
//         <Avatar className="size-11 border bg-background">
//           {primaryParticipant?.avatarUrl || primaryParticipant?.profilePhoto ? (
//             <AvatarImage
//               src={primaryParticipant.avatarUrl || primaryParticipant.profilePhoto || undefined}
//               alt={getParticipantDisplayName(primaryParticipant)}
//             />
//           ) : null}
//           <AvatarFallback>
//             {getParticipantDisplayName(primaryParticipant).slice(0, 2).toUpperCase()}
//           </AvatarFallback>
//         </Avatar>

//         <div className="space-y-1">
//           <div className="flex flex-wrap items-center gap-2">
//             <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
//             <Badge variant="outline" className="gap-1">
//               {connectionState === "connected" ? (
//                 <Wifi className="size-3.5" />
//               ) : (
//                 <WifiOff className="size-3.5" />
//               )}
//               {connectionCopy}
//             </Badge>
//             {readOnly ? (
//               <Badge variant="secondary" className="gap-1">
//                 <ShieldCheck className="size-3.5" />
//                 Read only
//               </Badge>
//             ) : null}
//           </div>

//           <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
//             {primaryParticipant?.title ? <span>{primaryParticipant.title}</span> : null}
//             <PresenceBadge isOnline={isOnline} lastSeen={lastSeen} />
//           </div>
//         </div>
//       </div>

//       <CallControls
//         canStartCall={!readOnly}
//         isInCall={isInCall}
//         onStartCall={onStartCall}
//         onEndCall={onEndCall}
//       />
//     </div>
//   );
// }

import { ShieldCheck, Wifi, WifiOff } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getOtherParticipants, getParticipantDisplayName } from "@/src/services/chatRoom.service";
import type { ChatRoom, ChatParticipant } from "@/src/types/chat.types";
import CallControls from "./CallControls";
import PresenceBadge from "./PresenceBadge";

interface ChatRoomHeaderProps {
  room: ChatRoom;
  currentUserId?: string;
  currentUserRole?: ChatParticipant["role"];
  connectionState?: "connecting" | "connected" | "reconnecting" | "disconnected";
  isFallbackPolling?: boolean;
  isOnline?: boolean;
  lastSeen?: string | null;
  readOnly?: boolean;
  isInCall?: boolean;
  onStartCall: () => void;
  onEndCall: () => void;
}

export default function ChatRoomHeader({
  room,
  currentUserId,
  currentUserRole,
  connectionState = "disconnected",
  isFallbackPolling = false,
  isOnline = false,
  lastSeen,
  readOnly = false,
  isInCall = false,
  onStartCall,
  onEndCall,
}: ChatRoomHeaderProps) {
  const otherParticipants = getOtherParticipants({
    participants: room.participants,
    currentUserId,
    currentUserRole,
  });

  const primaryParticipant =
    otherParticipants[0] ?? room.participants[0];

  const otherParticipantsLabel = otherParticipants
    .map((p) => getParticipantDisplayName(p))
    .join(", ");

  const isDirectConversation =
    room.participants.length <= 2 && otherParticipants.length === 1;

  const title =
    (isDirectConversation
      ? otherParticipantsLabel
      : room.name || otherParticipantsLabel) || "Conversation";

  // Connection status copy
  const connectionCopy = isFallbackPolling
    ? "Offline (polling)"
    : connectionState === "connected"
      ? "Live"
      : connectionState === "reconnecting"
        ? "Reconnecting"
        : "Connecting";

  const avatarSrc =
    primaryParticipant?.avatarUrl ||
    primaryParticipant?.profilePhoto ||
    undefined;

  return (
    <div className="flex flex-col gap-4 border-b p-4 md:flex-row md:items-center md:justify-between md:px-6">
      <div className="flex items-center gap-3">
        <Avatar className="size-11 border bg-background">
          {avatarSrc ? (
            <AvatarImage
              src={avatarSrc}
              alt={getParticipantDisplayName(primaryParticipant)}
            />
          ) : null}
          <AvatarFallback>
            {getParticipantDisplayName(primaryParticipant)
              .slice(0, 1)
              .toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h2>

            <Badge variant="outline" className="gap-1">
              {connectionState === "connected" ? (
                <Wifi className="size-3.5" />
              ) : (
                <WifiOff className="size-3.5" />
              )}
              {connectionCopy}
            </Badge>

            {readOnly && (
              <Badge variant="secondary" className="gap-1">
                <ShieldCheck className="size-3.5" />
                Read only
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {primaryParticipant?.title && (
              <span>{primaryParticipant.title}</span>
            )}
            <PresenceBadge isOnline={isOnline} lastSeen={lastSeen} />
          </div>
        </div>
      </div>

      <CallControls
        canStartCall={!readOnly}
        isInCall={isInCall}
        onStartCall={onStartCall}
        onEndCall={onEndCall}
      />
    </div>
  );
}
