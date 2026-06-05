import React from "react";

interface TrendBadgeProps {
  value: number;
  positive?: boolean;
  className?: string;
}

export const TrendBadge = ({ value, positive, className }: TrendBadgeProps) => {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const color = value > 0 ? "bg-green-100 text-green-700" : value < 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700";
  const arrow = value > 0 ? "▲" : value < 0 ? "▼" : "";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${color} ${className || ""}`.trim()}>
      {arrow} {sign}{Math.abs(value)}%
    </span>
  );
};
export default TrendBadge;
