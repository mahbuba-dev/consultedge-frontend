"use client";

interface RecDebugPanelProps {
  mode: "cold-start" | "personalized";
  activityCount: number;
}

export default function RecDebugPanel({ mode, activityCount }: RecDebugPanelProps) {
  if (process.env.NODE_ENV === "production") return null;

  const isPersonalized = mode === "personalized";

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3 py-1.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-500/10 dark:text-emerald-300">
      <span
        className={`size-1.5 rounded-full ${isPersonalized ? "bg-emerald-500" : "bg-slate-400"}`}
        aria-hidden="true"
      />
      {isPersonalized
        ? `Tailored to your interests · ${activityCount} signal${activityCount !== 1 ? "s" : ""} captured`
        : "Discovering your preferences"}
    </span>
  );
}
