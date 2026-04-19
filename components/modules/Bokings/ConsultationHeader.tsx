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
      <Card className="border-blue-200/60 bg-linear-to-r from-blue-50 via-white to-cyan-50 shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <Badge className="mb-1 bg-blue-100 text-blue-700 border border-blue-200/60 shadow-sm">
              <Sparkles className="mr-1 size-3.5" />
              Client Dashboard
            </Badge>

            <CardTitle className="text-2xl font-semibold tracking-tight">
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
            className="border-blue-200/60 hover:bg-blue-50"
          >
            <RefreshCw className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
      </Card>

      {/* STATS GRID */}
      <div className="grid gap-4 md:grid-cols-3">

        <Card className="border-blue-200/60 bg-linear-to-r from-blue-50 via-white to-cyan-50 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total consultations</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="border-sky-200/60 bg-linear-to-r from-sky-50 via-white to-cyan-50 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Active sessions</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{stats.active}</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200/60 bg-linear-to-r from-amber-50 via-white to-cyan-50 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Awaiting payment</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{stats.unpaid}</p>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
