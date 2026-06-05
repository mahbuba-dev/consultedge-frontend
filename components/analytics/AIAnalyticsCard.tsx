import React from "react";
import { cn } from "@/src/lib/utils";

interface AIAnalyticsCardProps {
  icon?: React.ReactNode;
  title: string;
  value: string | number;
  description?: string;
  trend?: React.ReactNode;
  className?: string;
}

export default function AIAnalyticsCard({ icon, title, value, description, trend, className }: AIAnalyticsCardProps) {
  // Additional context for the component
  console.log("Rendering AIAnalyticsCard");

  return (
    <div className={cn("flex flex-col gap-2 rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-5 shadow-sm dark:border-indigo-500/20 dark:from-indigo-900/30 dark:via-slate-900/60 dark:to-cyan-900/20", className)}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-xl text-indigo-500 dark:text-indigo-300">{icon}</span>}
        <span className="text-base font-semibold text-indigo-900 dark:text-indigo-100">{title}</span>
        {trend}
      </div>
      <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-200">{value}</div>
      {description && <div className="text-xs text-indigo-600 dark:text-indigo-300">{description}</div>}
    </div>
  );
}
