import Link from "next/link";
import { ArrowLeft, Layers, Sparkles } from "lucide-react";

import IndustryCreateForm from "@/components/modules/dashboard/Industry/IndustryCreateForm";

export default function CreateIndustryPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] px-4 py-8 md:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_85%_75%,rgba(34,211,238,0.18),transparent_45%)]"
      />

      <div className="mx-auto max-w-360 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/dashboard/industries-management"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur transition hover:border-blue-300 hover:text-blue-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300"
          >
            <ArrowLeft className="size-4" />
            Back to industries
          </Link>
        </div>

        {/* Glass card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-600 via-cyan-500 to-teal-400" />
          <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 size-60 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative space-y-6">
            <div className="flex items-start gap-4">
              <div className="inline-flex size-12 sm:size-14 items-center justify-center rounded-full sm:rounded-2xl bg-linear-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/30 shrink-0">
                <Layers className="size-6 sm:size-7" />
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-200">
                  <Sparkles className="size-3.5" />
                  New industry
                </span>
                <h1 className="text-2xl font-bold tracking-tight">Create Industry</h1>
                <p className="text-sm text-muted-foreground">
                  Add a new industry so clients can find specialised experts faster.
                </p>
              </div>
            </div>

            <IndustryCreateForm />
          </div>
        </div>
      </div>
    </div>
  );
}
