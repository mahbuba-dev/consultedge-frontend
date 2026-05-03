"use client";

interface RecDebugPanelProps {
  mode: "cold-start" | "personalized";
  activityCount: number;
}

export default function RecDebugPanel({ mode, activityCount }: RecDebugPanelProps) {
  if (process.env.NODE_ENV === "production") return null;

  const modeLabel = mode === "personalized" ? "Personalized journey" : "New visitor journey";

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/60 bg-fuchsia-50 px-2.5 py-1 text-[10px] font-semibold text-fuchsia-700 dark:border-fuchsia-400/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-200">
      debug view
      <span className="font-bold">{modeLabel}</span>
      <span className="font-bold">signals captured: {activityCount}</span>
    </span>
  );
}
