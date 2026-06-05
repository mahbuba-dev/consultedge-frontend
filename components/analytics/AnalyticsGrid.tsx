import React from "react";

interface AnalyticsGridProps {
  children: React.ReactNode;
  className?: string;
}

export const AnalyticsGrid = ({ children, className }: AnalyticsGridProps) => (
  <div
    className={`grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className || ""}`.trim()}
    role="list"
  >
    {children}
  </div>
);
export default AnalyticsGrid;
