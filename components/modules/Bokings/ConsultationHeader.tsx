"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { RefreshCw, Sparkles } from "lucide-react";

type ConsultationHeaderProps = {
  isFetching: boolean;
  refetch: () => void;
  stats: {
    total: number;
    active: number;
    unpaid: number;
  };
};

export default function ConsultationHeader({
  isFetching,
  refetch,
  stats,
}: ConsultationHeaderProps) {
  return (
    <div className="space-y-6">

      {/* HEADER CARD */}
      <Card className="relative overflow-hidden border-blue-200/60 bg-linear-to-r from-blue-50 via-white to-cyan-50 shadow-sm dark:border-white/10 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.18),transparent_55%)] dark:block"
        />
        <CardHeader className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <Badge className="mb-1 border border-blue-200/60 bg-blue-100 text-blue-700 shadow-sm dark:border-cyan-400/30 dark:bg-cyan-500/15 dark:text-cyan-200">
              <Sparkles className="mr-1 size-3.5" />
              Client Dashboard
            </Badge>

            <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
              My Consultations
            </CardTitle>

            <CardDescription className="text-sm text-muted-foreground">
              Track upcoming sessions, payment status, and expert details from one place.
            </CardDescription>
          </div>

          <Button
            variant="outline"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="border-blue-200/60 hover:bg-blue-50 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <RefreshCw className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
      </Card>

      {/* STATS GRID */}
      <div className="grid gap-4 md:grid-cols-3">

        <Card className="border-blue-200/60 bg-linear-to-br from-blue-50 to-white shadow-sm dark:border-blue-500/20 dark:bg-linear-to-br dark:from-blue-500/10 dark:to-slate-900/80">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total consultations</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="border-sky-200/60 bg-linear-to-br from-sky-50 to-white shadow-sm dark:border-cyan-500/20 dark:bg-linear-to-br dark:from-cyan-500/10 dark:to-slate-900/80">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Active sessions</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{stats.active}</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200/60 bg-linear-to-br from-amber-50 to-white shadow-sm dark:border-amber-500/20 dark:bg-linear-to-br dark:from-amber-500/10 dark:to-slate-900/80">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Awaiting payment</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{stats.unpaid}</p>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
