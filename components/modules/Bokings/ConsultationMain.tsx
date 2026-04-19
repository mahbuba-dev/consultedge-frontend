"use client";

import { useState, useMemo } from "react";
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

  // Use server consultations if provided, else fallback to fetched
  const allBookings = consultations.length > 0 ? consultations : extracted;

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
      new Date(c.date) > new Date()
  );

  const completed = allBookings.filter((c) => c.status === "COMPLETED");

  const missed = allBookings.filter(
    (c) =>
      ["CONFIRMED", "PENDING"].includes(c.status) &&
      new Date(c.date) < new Date()
  );

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
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        upcomingCount={upcoming.length}
        completedCount={completed.length}
        missedCount={missed.length}
      />

      {/* Filtered lists */}
      {activeTab === "upcoming" && (
        <ConsultationsList
          consultations={upcoming}
          highlightedConsultationId={consultationId}
          redirectStatus={status}
          redirectPaymentId={paymentId}
          redirectTransactionId={transactionId}
          redirectAmount={amount}
        />
      )}

      {activeTab === "completed" && (
        <ConsultationsList consultations={completed} />
      )}

      {activeTab === "missed" && (
        <ConsultationsList consultations={missed} />
      )}
    </div>
  );
}
