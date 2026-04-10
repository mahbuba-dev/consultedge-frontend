"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarClock, Compass, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ConsultationsPieChart from "../shared/ConsultationsPieCharts";
import RecentConsultationsTable from "../shared/RecentConsultationsTable";
import StatsCard from "../shared/StatsCard";
import { getDashboardData } from "@/src/services/dashboard.services";
import type { ApiResponse } from "@/src/types/api.types";
import type { IClientDashboardStats } from "@/src/types/client.dashboard";

const formatStatusLabel = (status: string) =>
  status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const ClientDashboardContent = () => {
  const { data: clientDashboardResponse, isLoading, isError } = useQuery({
    queryKey: ["client-dashboard-data"],
    queryFn: () => getDashboardData<IClientDashboardStats>(),
    refetchOnWindowFocus: "always",
  });

  const data = (
    clientDashboardResponse as ApiResponse<IClientDashboardStats> | undefined
  )?.data;

  const statusItems = data?.consultationStatusDistribution || [];
  const completedCount =
    statusItems.find((item) => item.status === "COMPLETED")?.count || 0;
  const pendingCount =
    statusItems.find((item) => item.status === "PENDING")?.count || 0;
  const activeCount =
    statusItems.find((item) => item.status === "ONGOING")?.count || 0;

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <div className="h-40 animate-pulse rounded-2xl bg-muted/60" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl bg-muted/60"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Unable to load client dashboard</CardTitle>
          <CardDescription>
            Please refresh the page to retrieve your dashboard stats.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-linear-to-r from-cyan-500 via-sky-500 to-indigo-600 text-white shadow-xl">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
              <Sparkles className="mr-1 size-3.5" />
              Client Hub
            </Badge>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold md:text-3xl">
                Manage your consultations with clarity
              </h1>
              <p className="max-w-2xl text-sm text-white/80 md:text-base">
                Follow your bookings, track consultation progress, and discover
                the right experts for your next session.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/experts">
              <Button className="bg-white text-slate-900 hover:bg-white/90">
                Find Experts
              </Button>
            </Link>
            <Link href="/my-profile">
              <Button
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                My Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Consultations"
          value={data.consultationCount || 0}
          iconName="CalendarDays"
          description="All consultations linked to your account"
          className="bg-linear-to-br from-cyan-50 to-white"
        />
        <StatsCard
          title="Completed"
          value={completedCount}
          iconName="CheckCircle2"
          description="Sessions successfully finished"
          className="bg-linear-to-br from-emerald-50 to-white"
        />
        <StatsCard
          title="Pending"
          value={pendingCount}
          iconName="CalendarClock"
          description="Upcoming or awaiting confirmation"
          className="bg-linear-to-br from-amber-50 to-white"
        />
        <StatsCard
          title="Ongoing"
          value={activeCount}
          iconName="Activity"
          description="Live consultation progress"
          className="bg-linear-to-br from-violet-50 to-white"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ConsultationsPieChart
            data={statusItems}
            title="Your Consultation Journey"
            description="See how your consultations are distributed across each stage."
          />
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Smart next steps</CardTitle>
            <CardDescription>
              Keep your client workflow moving with these quick actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-muted/40 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-700">
                <Compass className="size-4" />
                Recommended focus
              </div>
              <p className="text-sm text-muted-foreground">
                {pendingCount > 0
                  ? `You have ${pendingCount} pending consultation${pendingCount > 1 ? "s" : ""}. Review them first.`
                  : "You are all caught up. Explore new experts for your next session."}
              </p>
            </div>

            <div className="space-y-3">
              {statusItems.length > 0 ? (
                statusItems.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <span className="text-sm font-medium">
                      {formatStatusLabel(item.status)}
                    </span>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No consultation data available yet.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Link href="/experts" className="inline-flex w-full">
                <Button className="w-full justify-between bg-sky-600 hover:bg-sky-700">
                  Browse experts
                  <ArrowRight className="size-4" />
                </Button>
              </Link>

              <Link href="/my-profile" className="inline-flex w-full">
                <Button variant="outline" className="w-full justify-between">
                  Update profile
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <RecentConsultationsTable
        data={statusItems}
        title="Recent Consultation Snapshot"
        description="Your latest consultation activity, grouped by live status from the dashboard endpoint."
      />
    </div>
  );
};

export default ClientDashboardContent;
