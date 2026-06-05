import React from "react";
import { cn } from "@/src/lib/utils";

interface AIInsightPanelProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  highlight?: string;
  className?: string;
}

export default function AIInsightPanel({ icon, title, description, highlight, className }: AIInsightPanelProps) {
  // Additional context for the component
  console.log("Rendering AIInsightPanel");

  return (
    <div className={cn("relative flex items-start gap-4 rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-5 shadow-sm dark:border-indigo-500/20 dark:from-indigo-900/30 dark:via-slate-900/60 dark:to-cyan-900/20", className)}>
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20">
          {icon}
        </div>
      )}
      <div>
        <div className="text-base font-semibold text-indigo-900 dark:text-indigo-100">{title}</div>
        <div className="mt-1 text-sm text-indigo-700 dark:text-indigo-200">
          {description}
          {highlight && (
            <span className="ml-2 font-bold text-cyan-600 dark:text-cyan-300">{highlight}</span>
          )}
        </div>
      </div>
    </div>
  );
}
