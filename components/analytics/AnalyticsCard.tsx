import React from "react";
import { cn } from "@/src/lib/utils";

interface AnalyticsCardProps {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  trend?: React.ReactNode;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export const AnalyticsCard = ({
  title,
  value,
  icon,
  trend,
  description,
  className,
  children,
}: AnalyticsCardProps) => (
  <div
    className={cn(
      "rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-2 min-w-45 min-h-30 relative",
      className
    )}
    tabIndex={0}
    aria-label={title}
  >
    <div className="flex items-center gap-2 mb-1">
      {icon && <span className="text-xl">{icon}</span>}
      <span className="font-semibold text-sm text-muted-foreground">{title}</span>
      {trend && <span className="ml-auto">{trend}</span>}
    </div>
    <div className="text-2xl font-bold text-foreground">{value}</div>
    {description && <div className="text-xs text-muted-foreground mt-1">{description}</div>}
    {children}
  </div>
);
export default AnalyticsCard;
