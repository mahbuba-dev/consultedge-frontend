import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

interface AuthShellHighlight {
  icon: LucideIcon;
  title: string;
  desc: string;
}

interface AuthShellProps {
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  description: string;
  highlights: AuthShellHighlight[];
  children: React.ReactNode;
}

export default function AuthShell({
  eyebrow,
  titleLead,
  titleAccent,
  description,
  highlights,
  children,
}: AuthShellProps) {
  return (
    <div className="relative isolate min-h-[80vh] py-8 md:py-12">
      {/* Decorative gradient layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-176 bg-[radial-gradient(circle_at_15%_15%,rgba(37,99,235,0.22),transparent_45%),radial-gradient(circle_at_85%_25%,rgba(34,211,238,0.22),transparent_45%),radial-gradient(circle_at_50%_95%,rgba(16,185,129,0.14),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-8%] top-24 -z-10 h-80 w-80 rounded-full bg-cyan-400/35 blur-3xl dark:bg-cyan-500/25"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-8%] top-72 -z-10 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl dark:bg-blue-500/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_at_center,black_40%,transparent_75%)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]"
      />

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        {/* Left: brand panel (desktop only) */}
        <div className="hidden flex-col gap-8 lg:flex">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium text-blue-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-cyan-200">
              <Sparkles className="size-3.5" />
              {eyebrow}
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {titleLead}
              <span className="block bg-linear-to-r from-blue-600 via-cyan-500 to-teal-400 bg-clip-text text-transparent">
                {titleAccent}
              </span>
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">{description}</p>
          </div>

          <ul className="space-y-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="flex items-start gap-3 rounded-2xl border border-white/60 bg-white/55 p-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl transition hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500/20 to-cyan-500/20 text-cyan-700 ring-1 ring-white/40 dark:text-cyan-300 dark:ring-white/10">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right: glass form card */}
        <div className="relative">
          {/* Glow halo */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-2 -z-10 rounded-[2.25rem] bg-linear-to-br from-blue-500/30 via-cyan-400/25 to-emerald-400/15 opacity-80 blur-2xl"
          />
          {/* Subtle border ring behind card */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-px -z-10 rounded-[1.65rem] bg-linear-to-br from-white/60 via-white/20 to-white/0 dark:from-white/15 dark:via-white/5 dark:to-transparent"
          />
          {children}
        </div>
      </div>
    </div>
  );
}
