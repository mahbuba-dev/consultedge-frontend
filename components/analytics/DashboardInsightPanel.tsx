import React from "react";
import { cn } from "@/src/lib/utils";

interface DashboardInsightPanelProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  highlight?: string;
  className?: string;
}

export default function DashboardInsightPanel({
  icon,
  title,
  description,
  highlight,
  className,
}: DashboardInsightPanelProps) {
  // Additional context for the component
  console.log("Rendering DashboardInsightPanel");

  return (
    <div className={cn("relative flex items-start gap-4 rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5 shadow-sm dark:border-blue-500/20 dark:from-blue-900/30 dark:via-slate-900/60 dark:to-cyan-900/20", className)}>
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20">
          {icon}
        </div>
      )}
      <div>
        <div className="text-base font-semibold text-blue-900 dark:text-blue-100">{title}</div>
        <div className="mt-1 text-sm text-blue-700 dark:text-blue-200">
          {description}
          {highlight && (
            <span className="ml-2 font-bold text-cyan-600 dark:text-cyan-300">{highlight}</span>
          )}
        </div>
      </div>
    </div>
  );
}
