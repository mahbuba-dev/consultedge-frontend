import React from "react";

export const AnalyticsEmptyState = ({ message = "No analytics data available." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
    <span className="text-2xl mb-2">📊</span>
    <span className="text-sm">{message}</span>
  </div>
);
export default AnalyticsEmptyState;
