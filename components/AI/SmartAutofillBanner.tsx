"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getAutofillProfile,
  type AutofillProfile,
} from "@/src/lib/autofillStore";

interface SmartAutofillBannerProps {
  /** Which fields this form supports — banner only shows when at least one is filled in storage. */
  fields: Array<keyof AutofillProfile>;
  /** Called when user accepts. Receives the saved profile filtered to requested fields. */
  onApply: (values: Partial<AutofillProfile>) => void;
  /** Optional copy override. */
  label?: string;
  className?: string;
}

const dismissKey = (fields: Array<keyof AutofillProfile>) =>
  `consultedge:autofill-dismissed:${fields.slice().sort().join(",")}`;

export default function SmartAutofillBanner({
  fields,
  onApply,
  label,
  className,
}: SmartAutofillBannerProps) {
  const [profile, setProfile] = useState<AutofillProfile>({});
  const [dismissed, setDismissed] = useState(true); // assume dismissed until hydrated
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    setProfile(getAutofillProfile());
    try {
      setDismissed(window.sessionStorage.getItem(dismissKey(fields)) === "1");
    } catch {
      setDismissed(false);
    }
    const handler = () => setProfile(getAutofillProfile());
    window.addEventListener("consultedge:autofill-updated", handler);
    return () => window.removeEventListener("consultedge:autofill-updated", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const available = useMemo(
    () =>
      fields.filter(
        (f) => typeof profile[f] === "string" && (profile[f] as string).trim() !== "",
      ),
    [fields, profile],
  );

  if (applied || dismissed || available.length === 0) return null;

  const handleApply = () => {
    const payload: Partial<AutofillProfile> = {};
    for (const f of available) payload[f] = profile[f];
    onApply(payload);
    setApplied(true);
  };

  const handleDismiss = () => {
    try {
      window.sessionStorage.setItem(dismissKey(fields), "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div
      className={
        "flex items-center gap-3 rounded-2xl border border-cyan-200/70 bg-linear-to-r from-cyan-50 via-white to-blue-50 px-3 py-2 text-sm shadow-sm dark:border-cyan-500/20 dark:from-cyan-500/5 dark:via-slate-950 dark:to-blue-500/5 " +
        (className ?? "")
      }
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-cyan-500 text-white shadow">
        <Sparkles className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-cyan-900 dark:text-cyan-100">
          {label ?? `Use saved details for ${available.join(", ")}?`}
        </p>
        <p className="text-[11px] text-cyan-800/80 dark:text-cyan-200/70">
          We remembered them from your last form. Saved on this device only.
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        onClick={handleApply}
        className="h-7 rounded-full bg-linear-to-r from-blue-600 to-cyan-500 px-3 text-[11px] text-white hover:from-blue-700 hover:to-cyan-600"
      >
        Use saved
      </Button>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="rounded-full p-1 text-muted-foreground hover:bg-white/60 hover:text-foreground dark:hover:bg-white/5"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
