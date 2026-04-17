"use client";

import { useState } from "react";
import ConsultationsList from "./ConsultationsList";
import ConsultationTabs from "../Tabs/ConsultationTabs";
import { IConsultation } from "@/src/types/booking.types";

type ConsultationsMainProps = {
  consultations: IConsultation[];
};

export default function ConsultationsMain({ consultations }: ConsultationsMainProps) {
  const [activeTab, setActiveTab] = useState("upcoming");

  const upcoming = consultations.filter(
    c =>
      ["CONFIRMED", "PENDING"].includes(c.status) &&
      new Date(c.date) > new Date()
  );

  const completed = consultations.filter(
    c => c.status === "COMPLETED"
  );

  const missed = consultations.filter(
    c =>
      ["CONFIRMED", "PENDING"].includes(c.status) &&
      new Date(c.date) < new Date() &&
      c.status !== "COMPLETED"
  );

  return (
    <div className="space-y-6">
      <ConsultationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        upcomingCount={upcoming.length}
        completedCount={completed.length}
        missedCount={missed.length}
      />

      {activeTab === "upcoming" && <ConsultationsList consultations={upcoming} />}
      {activeTab === "completed" && <ConsultationsList consultations={completed} />}
      {activeTab === "missed" && <ConsultationsList consultations={missed} />}
    </div>
  );
}
