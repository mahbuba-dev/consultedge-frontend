"use client";

import { motion } from "framer-motion";

interface TabItem {
  key: "upcoming" | "completed" | "missed";
  label: string;
  count: number;
}

interface Props {
  activeTab: string;
  setActiveTab: (tab: "upcoming" | "completed" | "missed") => void;
  upcomingCount: number;
  completedCount: number;
  missedCount: number;
}

export default function ConsultationTabs({
  activeTab,
  setActiveTab,
  upcomingCount,
  completedCount,
  missedCount,
}: Props) {
  const tabs: TabItem[] = [
    { key: "upcoming", label: "Upcoming", count: upcomingCount },
    { key: "completed", label: "Completed", count: completedCount },
    { key: "missed", label: "Missed", count: missedCount },
  ];

  return (
    <div className="flex gap-3 border-b pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`relative px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
            activeTab === tab.key
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {tab.label}

          {/* Count Badge */}
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
            {tab.count}
          </span>

          {/* Animated underline */}
          {activeTab === tab.key && (
            <motion.div
              layoutId="underline"
              className="absolute bottom-2px left-0 right-0 h-3px bg-blue-600 rounded-full"
            />
          )}
        </button>
      ))}
    </div>
  );
}
