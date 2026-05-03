
// import Link from "next/link";
// import { useState, useRef } from "react";
// import {
//   CalendarDays,
//   CheckCircle2,
//   Clock3,
//   MessageCircleMore,
//   UserRound,
// } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { cn } from "@/src/lib/utils";
// import type { IConsultation } from "@/src/types/booking.types";

// import JoinSessionModal from "../Session/JoinSessionModal";
// import EndSessionModal from "../Session/EndSessionModel";

// import CallPanel from "../ChatRoom/CallPanel";

// type ExpertConsultationCardProps = {
//   consultation: IConsultation;
// };

// const formatDateTime = (value?: string) => {
//   if (!value) return "Date pending";
//   return new Date(value).toLocaleString();
// };

// const getStatusBadge = (status?: string) => {
//   switch (status) {
//     case "CONFIRMED":
//       return (
//         <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">
//           Confirmed
//         </Badge>
//       );
//     case "COMPLETED":
//       return (
//         <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
//           Completed
//         </Badge>
//       );
//     case "CANCELLED":
//       return <Badge variant="destructive">Cancelled</Badge>;
//     default:
//       return <Badge variant="secondary">Pending</Badge>;
//   }
// };

// const getPaymentBadge = (status?: string) => {
//   switch (status) {
//     case "PAID":
//       return (
//         <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
//           Paid
//         </Badge>
//       );
//     case "FAILED":
//       return <Badge variant="destructive">Failed</Badge>;
//     case "REFUNDED":
//       return <Badge variant="outline">Refunded</Badge>;
//     default:
//       return <Badge variant="secondary">Unpaid</Badge>;
//   }
// };

// export default function ExpertConsultationCard({
//   consultation,
// }: ExpertConsultationCardProps) {
//   const clientName = consultation.client?.fullName || "Client";

//   const clientInitials = clientName
//     .split(" ")
//     .map((p) => p[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

//   // Session state
//   const [joinOpen, setJoinOpen] = useState(false);
//   const [callOpen, setCallOpen] = useState(false);
//   const [endOpen, setEndOpen] = useState(false);
  
//   const [loading, setLoading] = useState(false);

//   // Video refs (ready for real WebRTC later)
//   const localVideoRef = useRef<HTMLVideoElement | null>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

//   const isCompleted = consultation.status === "COMPLETED";
//   const isConfirmed = consultation.status === "CONFIRMED";

//   const handleJoin = () => {
//     setLoading(true);
//     setTimeout(() => {
//       setLoading(false);
//       setJoinOpen(false);
//       setCallOpen(true);
//     }, 1200);
//   };

//   const handleEnd = () => {
//     setCallOpen(false);
//     setEndOpen(true);
//   };

//   const handleConfirmEnd = () => {
//     setEndOpen(false);
    
//   };

//   const handleSubmitReview = (rating: number, comment: string) => {
//     setLoading(true);
//     setTimeout(() => {
//       setLoading(false);
     
//     }, 1200);
//   };

//   return (
//     <>
//       <Card className="overflow-hidden border-border/60 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
//         {/* HEADER */}
//         <CardHeader className="gap-4 bg-linear-to-r from-blue-500/15 via-cyan-500/10 to-white">
//           <div className="flex flex-wrap items-start justify-between gap-3">
//             <div className="flex items-start gap-3">
//               <Avatar className="size-12 ring-2 ring-white/80">
//                 <AvatarImage
//                   src={consultation.client?.profilePhoto || undefined}
//                   alt={clientName}
//                 />
//                 <AvatarFallback>{clientInitials}</AvatarFallback>
//               </Avatar>

//               <div>
//                 <CardTitle className="text-lg">{clientName}</CardTitle>
//                 <p className="text-sm text-muted-foreground">
//                   {consultation.client?.email || "Client consultation"}
//                 </p>

//                 <div className="mt-2 flex flex-wrap gap-2">
//                   {getStatusBadge(consultation.status)}
//                   {getPaymentBadge(consultation.paymentStatus)}
//                 </div>
//               </div>
//             </div>

//             <div className="rounded-full border bg-white/80 px-3 py-1 text-xs font-medium backdrop-blur">
//               {typeof consultation.payment?.amount === "number"
//                 ? new Intl.NumberFormat("en-US", {
//                     style: "currency",
//                     currency: "USD",
//                   }).format(consultation.payment.amount)
//                 : "Amount pending"}
//             </div>
//           </div>
//         </CardHeader>

//         {/* CONTENT */}
//         <CardContent className="space-y-4 p-5">
//           <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
//             <div className="rounded-2xl border bg-blue-50/70 p-3">
//               <div className="mb-1 flex items-center gap-2 text-blue-700">
//                 <CalendarDays className="size-4" />
//                 <span className="text-xs font-semibold uppercase">
//                   Session date
//                 </span>
//               </div>
//               <p className="text-sm font-semibold">
//                 {formatDateTime(consultation.date)}
//               </p>
//             </div>

//             <div className="rounded-2xl border bg-cyan-50/70 p-3">
//               <div className="mb-1 flex items-center gap-2 text-cyan-700">
//                 <Clock3 className="size-4" />
//                 <span className="text-xs font-semibold uppercase">
//                   Video call ID
//                 </span>
//               </div>
//               <p className="text-sm font-semibold break-all">
//                 {consultation.videoCallId ||
//                   "Generated after confirmation"}
//               </p>
//             </div>

//             <div className="rounded-2xl border bg-emerald-50/70 p-3">
//               <div className="mb-1 flex items-center gap-2 text-emerald-700">
//                 <CheckCircle2 className="size-4" />
//                 <span className="text-xs font-semibold uppercase">
//                   Created
//                 </span>
//               </div>
//               <p className="text-sm font-semibold">
//                 {formatDateTime(consultation.createdAt)}
//               </p>
//             </div>
//           </div>

//           <div className="rounded-2xl border bg-muted/20 p-3 text-sm">
//             <div className="grid gap-2 sm:grid-cols-2">
//               <p>
//                 <span className="font-medium">Consultation ID:</span>{" "}
//                 {consultation.id}
//               </p>
//               <p>
//                 <span className="font-medium">Transaction ID:</span>{" "}
//                 {consultation.payment?.transactionId ||
//                   "Pending gateway response"}
//               </p>
//             </div>
//           </div>

//           <div className="flex flex-wrap gap-3">
//             <Button asChild variant="outline">
//               <Link
//                 href={`/expert/dashboard/messages${consultation.clientId ? `?participantId=${consultation.clientId}` : ""}`}
//               >
//                 <MessageCircleMore className="mr-2 size-4" />
//                 Message client
//               </Link>
//             </Button>

//             <Button
//               variant="ghost"
//               className={cn("pointer-events-none opacity-80")}
//             >
//               <UserRound className="mr-2 size-4" />
//               Client details ready
//             </Button>

//             {isConfirmed && !isCompleted && (
//               <Button
//                 disabled={loading}
//                 className="bg-blue-600 text-white hover:bg-blue-700"
//                 onClick={() => setJoinOpen(true)}
//               >
//                 Join Session
//               </Button>
//             )}

        
//           </div>
//         </CardContent>
//       </Card>

//       {/* MODALS */}
//       <JoinSessionModal
//         open={joinOpen}
//         scheduledStart={consultation.date || new Date()}
//         onJoin={handleJoin}
//         onClose={() => setJoinOpen(false)}
//         loading={loading}
//       />

//       <CallPanel
//         open={callOpen}
//         callState={callOpen ? "active" : "idle"}
//         localVideoRef={localVideoRef}
//         remoteVideoRef={remoteVideoRef}
//         remoteName={clientName}
//         onEndCall={handleEnd} isCaller={false}      />

//       <EndSessionModal
//         open={endOpen}
//         onConfirm={handleConfirmEnd}
//         onCancel={() => setEndOpen(false)}
//         loading={loading}
//       />

     
//     </>
//   );
// }


"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageCircleMore,
  AlertTriangle,
  Video,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IConsultation } from "@/src/types/booking.types";

type Props = {
  consultation: IConsultation;
  onJoin?: (id: string) => void;
};

const formatDateTime = (value?: string) => {
  if (!value) return "Date pending";
  return new Date(value).toLocaleString();
};

export default function ConsultationCard({ consultation, onJoin }: Props) {
  const state = useMemo(() => {
    if (consultation.status === "CANCELLED") return "CANCELLED";
    if (consultation.status === "COMPLETED") return "COMPLETED";
    if (consultation.status === "ONGOING") return "ONGOING";
    if (consultation.paymentStatus !== "PAID") return "UNPAID";
    const startTime = consultation.date ? new Date(consultation.date) : null;
    if (!startTime) return "PENDING";
    const now = new Date();
    const joinStart = new Date(startTime.getTime() - 15 * 60 * 1000);
    const joinEnd = new Date(startTime.getTime() + 30 * 60 * 1000);
    if (now < joinStart) return "UPCOMING";
    if (now >= joinStart && now <= joinEnd) return "JOINABLE";
    if (now > joinEnd) return "MISSED";
    return "PENDING";
  }, [consultation.status, consultation.paymentStatus, consultation.date]);

  const clientName = consultation.client?.fullName || "Client";

  const clientInitials = clientName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 1)
    .toUpperCase();

  // =========================
  // BADGES
  // =========================
  const getStatusBadge = () => {
    switch (state) {
      case "JOINABLE":
        return <Badge className="bg-blue-100 text-blue-700">Joinable</Badge>;
      case "UPCOMING":
        return <Badge className="bg-sky-100 text-sky-700">Upcoming</Badge>;
      case "ONGOING":
        return <Badge className="bg-emerald-100 text-emerald-700">Ongoing</Badge>;
      case "MISSED":
        return <Badge variant="destructive">Missed</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getActionButton = () => {
    if (state === "CANCELLED") return null;

    if (state === "MISSED") {
      return (
        <Button disabled variant="secondary">
          <AlertTriangle className="mr-2 size-4" />
          Session Missed
        </Button>
      );
    }

    if (state === "COMPLETED") {
      return (
        <Button variant="secondary">
          <CheckCircle2 className="mr-2 size-4" />
          Review Session
        </Button>
      );
    }

    if (state === "UPCOMING") {
      return (
        <Button disabled variant="secondary">
          <Clock3 className="mr-2 size-4" />
          Join available soon
        </Button>
      );
    }

    if (state === "JOINABLE" || state === "ONGOING") {
      return (
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => onJoin?.(consultation.id)}
        >
          <Video className="mr-2 size-4" />
          Join Session
        </Button>
      );
    }

    return null;
  };

  return (
    <Card className="overflow-hidden border shadow-sm">
      {/* HEADER */}
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={consultation.client?.profilePhoto || ""} />
              <AvatarFallback>{clientInitials}</AvatarFallback>
            </Avatar>

            <div>
              <CardTitle className="text-lg">{clientName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {consultation.client?.email}
              </p>

              <div className="mt-2 flex gap-2">
                {getStatusBadge()}
                <Badge variant="outline">
                  {consultation.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="space-y-4 p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border p-3">
            <div className="flex items-center gap-2 text-blue-600">
              <CalendarDays className="size-4" />
              <span className="text-xs font-medium">Session Date</span>
            </div>
            <p className="mt-1 text-sm font-semibold">
              {formatDateTime(consultation.date)}
            </p>
          </div>

          <div className="rounded-xl border p-3">
            <div className="flex items-center gap-2 text-cyan-600">
              <Clock3 className="size-4" />
              <span className="text-xs font-medium">State</span>
            </div>
            <p className="mt-1 text-sm font-semibold">{state}</p>
          </div>
        </div>

        <div className="rounded-xl border p-3 text-sm">
          <p>
            <span className="font-medium">Consultation ID:</span>{" "}
            {consultation.id}
          </p>
          <p>
            <span className="font-medium">Transaction:</span>{" "}
            {consultation.payment?.transactionId || "Pending"}
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link
              href={`/expert/dashboard/messages${consultation.clientId ? `?participantId=${consultation.clientId}` : ""}`}
            >
              <MessageCircleMore className="mr-2 size-4" />
              Message
            </Link>
          </Button>

          <Button asChild variant="ghost">
            <Link href={`/dashboard/consultations/${consultation.id}`}>
              View Details
            </Link>
          </Button>

          {getActionButton()}
        </div>
      </CardContent>
    </Card>
  );
}