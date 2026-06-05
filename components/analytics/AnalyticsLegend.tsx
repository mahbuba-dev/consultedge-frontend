import React from "react";

interface AnalyticsLegendItem {
  label: string;
  color: string;
}

interface AnalyticsLegendProps {
  items: AnalyticsLegendItem[];
  className?: string;
}

export const AnalyticsLegend = ({ items, className }: AnalyticsLegendProps) => (
  <div className={`flex flex-wrap gap-3 items-center ${className || ""}`.trim()}>
    {items.map((item) => (
      <span key={item.label} className="flex items-center gap-1 text-xs">
        <span className="inline-block w-3 h-3 rounded-full" style={{ background: item.color }} />
        {item.label}
      </span>
    ))}
  </div>
);
export default AnalyticsLegend;
