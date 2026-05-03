"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import ConsultationsList from "./ConsultationsList";
import ConsultationTabs from "../Tabs/ConsultationTabs";
import ConsultationHeader from "./ConsultationHeader";

import usePaymentRedirectParams from "@/src/hooks/usePaymentRedirectParams";
import { getMyBookings } from "@/src/services/bookings.service";
import { IConsultation } from "@/src/types/booking.types";

type ConsultationsMainProps = {
  consultations: IConsultation[];
};

const getConsultationEndTime = (consultation: IConsultation) => {
  const rawConsultation = consultation as IConsultation & {
    endDateTime?: string | null;
    schedule?: { endDateTime?: string | null } | null;
  };

  const directEndTime =
    consultation.expertSchedule?.schedule?.endDateTime ??
    rawConsultation.schedule?.endDateTime ??
    rawConsultation.endDateTime ??
    null;

  if (directEndTime) {
    return new Date(directEndTime);
  }

  return consultation.date ? new Date(consultation.date) : null;
};

const isMissedConsultation = (consultation: IConsultation) => {
  const endTime = getConsultationEndTime(consultation);

  if (!endTime) {
    return false;
  }

  return endTime < new Date();
};

export default function ConsultationsMain({ consultations }: ConsultationsMainProps) {
  const [activeTab, setActiveTab] = useState("upcoming");

  // Fetch latest bookings (for stats + refresh)
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["consultations"],
    queryFn: () =>
      getMyBookings({
        limit: 50,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
  });

  // Extract consultations from API response
  const extracted = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }, [data]);

  // Prefer live query data once it is available so mutations update instantly.
  const allBookings = extracted.length > 0 || data ? extracted : consultations;

  // Redirect params
  const {
    consultationId,
    paymentId,
    transactionId,
    amount,
    status,
  } = usePaymentRedirectParams();

  // Stats
  const stats = useMemo(
    () => ({
      total: allBookings.length,
      active: allBookings.filter(
        (item) => item.status === "CONFIRMED" || item.status === "PENDING"
      ).length,
      unpaid: allBookings.filter(
        (item) => item.paymentStatus !== "PAID" && item.status !== "CANCELLED"
      ).length,
    }),
    [allBookings]
  );

  // Tab filters
  const upcoming = allBookings.filter(
    (c) =>
      ["CONFIRMED", "PENDING"].includes(c.status) &&
      !isMissedConsultation(c)
  );

  const completed = allBookings.filter((c) => c.status === "COMPLETED");

  const missed = allBookings.filter(
    (c) =>
      ["CONFIRMED", "PENDING"].includes(c.status) &&
      isMissedConsultation(c)
  );

  const resolvedActiveTab =
    activeTab === "missed" && missed.length === 0 && upcoming.length > 0
      ? "upcoming"
      : activeTab;

  return (
    <div className="space-y-6">

      {/* Header + Stats */}
      <ConsultationHeader
        isFetching={isFetching}
        refetch={refetch}
        stats={stats}
      />

      {/* Tabs */}
      <ConsultationTabs
        activeTab={resolvedActiveTab}
        setActiveTab={setActiveTab}
        upcomingCount={upcoming.length}
        completedCount={completed.length}
        missedCount={missed.length}
      />

      {/* Filtered lists */}
      {resolvedActiveTab === "upcoming" && (
        <ConsultationsList
          consultations={upcoming}
          highlightedConsultationId={consultationId}
          redirectStatus={status}
          redirectPaymentId={paymentId}
          redirectTransactionId={transactionId}
          redirectAmount={amount}
          onReviewSubmitted={() => setActiveTab("completed")}
        />
      )}

      {resolvedActiveTab === "completed" && (
        <ConsultationsList
          consultations={completed}
          onReviewSubmitted={() => setActiveTab("completed")}
        />
      )}

      {resolvedActiveTab === "missed" && (
        <ConsultationsList
          consultations={missed}
          onReviewSubmitted={() => setActiveTab("completed")}
        />
      )}
    </div>
  );
}
