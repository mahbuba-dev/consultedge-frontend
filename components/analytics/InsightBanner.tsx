import React from "react";
import { cn } from "@/src/lib/utils";

interface InsightBannerProps {
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function InsightBanner({ message, icon, className }: InsightBannerProps) {
  return (
    <div className={cn("flex items-center gap-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 p-4 text-white shadow-md", className)}>
      {icon && <span className="text-2xl">{icon}</span>}
      <span className="font-semibold text-base">{message}</span>
    </div>
  );
}
