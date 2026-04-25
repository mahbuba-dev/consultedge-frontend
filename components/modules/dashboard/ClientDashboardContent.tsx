"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  MessageSquare,
  Search,
  Sparkles,
  UserCircle2,
} from "lucide-react";

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
    refetchOnWindowFocus: false,
    retry: false,
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
    <div className="space-y-8">
      {/* Hero */}
      <Card className="relative overflow-hidden border-white/30 bg-linear-to-br from-blue-600 via-cyan-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/20 dark:border-white/10">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 size-72 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 size-72 rounded-full bg-cyan-300/30 blur-3xl" />
          <div
            className="absolute inset-0 opacity-30 mask-[radial-gradient(ellipse_at_top,black,transparent_70%)]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.18) 1px,transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <CardContent className="relative z-10 grid gap-8 p-6 md:p-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="space-y-4">
            <Badge className="border-white/30 bg-white/15 text-white backdrop-blur hover:bg-white/15">
              <Sparkles className="mr-1 size-3.5" />
              Welcome back
            </Badge>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold leading-tight md:text-4xl">
                Your consultation hub,{" "}
                <span className="bg-linear-to-r from-cyan-100 to-white bg-clip-text text-transparent">
                  reimagined.
                </span>
              </h1>
              <p className="max-w-xl text-sm text-white/85 md:text-base">
                Track sessions, message experts, and discover the next step —
                all from one polished workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/experts">
                <Button className="bg-white text-slate-900 shadow-md hover:bg-white/90">
                  <Search className="mr-2 size-4" />
                  Find experts
                </Button>
              </Link>
              <Link href="/dashboard/consultations">
                <Button
                  variant="outline"
                  className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
                >
                  My consultations
                  <ArrowUpRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Mini stats ribbon */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: data.consultationCount || 0 },
              { label: "Done", value: completedCount },
              { label: "Live", value: activeCount },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/25 bg-white/10 p-4 backdrop-blur-md"
              >
                <p className="text-xs uppercase tracking-wider text-white/70">
                  {s.label}
                </p>
                <p className="mt-1 text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            title: "Browse experts",
            desc: "Discover specialists",
            href: "/experts",
            icon: Search,
            gradient: "from-blue-500 to-cyan-500",
          },
          {
            title: "Industries",
            desc: "Explore by field",
            href: "/industries",
            icon: Compass,
            gradient: "from-cyan-500 to-teal-500",
          },
          {
            title: "Messages",
            desc: "Chat with experts",
            href: "/dashboard/chat",
            icon: MessageSquare,
            gradient: "from-indigo-500 to-blue-500",
          },
          {
            title: "My profile",
            desc: "Update details",
            href: "/my-profile",
            icon: UserCircle2,
            gradient: "from-fuchsia-500 to-pink-500",
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60"
            >
              <div
                className={`mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-linear-to-br ${action.gradient} text-white shadow-md`}
              >
                <Icon className="size-5" />
              </div>
              <p className="font-semibold text-foreground">{action.title}</p>
              <p className="text-xs text-muted-foreground">{action.desc}</p>
              <ArrowUpRight className="absolute right-4 top-4 size-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Consultations"
          value={data.consultationCount || 0}
          iconName="CalendarDays"
          description="All consultations linked to your account"
          className="bg-linear-to-br from-blue-50 to-white dark:from-blue-950/40 dark:to-slate-900"
        />
        <StatsCard
          title="Completed"
          value={completedCount}
          iconName="CheckCircle2"
          description="Sessions successfully finished"
          className="bg-linear-to-br from-emerald-50 to-white dark:from-emerald-950/35 dark:to-slate-900"
        />
        <StatsCard
          title="Pending"
          value={pendingCount}
          iconName="CalendarClock"
          description="Upcoming or awaiting confirmation"
          className="bg-linear-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-900"
        />
        <StatsCard
          title="Ongoing"
          value={activeCount}
          iconName="Activity"
          description="Live consultation progress"
          className="bg-linear-to-br from-indigo-50 to-white dark:from-indigo-950/35 dark:to-slate-900"
        />
      </div>

      {/* Pie chart + smart next steps */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ConsultationsPieChart
            data={statusItems}
            title="Your Consultation Journey"
            description="See how your consultations are distributed across each stage."
          />
        </div>

        <Card className="relative overflow-hidden border-slate-200/70 bg-white/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-600 via-cyan-500 to-teal-400" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-cyan-500" />
              Smart next steps
            </CardTitle>
            <CardDescription>
              Keep your workflow moving with these quick actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-blue-200/60 bg-blue-50/70 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
                <Compass className="size-4" />
                Recommended focus
              </div>
              <p className="text-sm text-muted-foreground">
                {pendingCount > 0
                  ? `You have ${pendingCount} pending consultation${pendingCount > 1 ? "s" : ""}. Review them first.`
                  : "You are all caught up. Explore new experts for your next session."}
              </p>
            </div>

            <div className="space-y-2">
              {statusItems.length > 0 ? (
                statusItems.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/5"
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

            <div className="space-y-2 pt-1">
              <Link href="/experts" className="inline-flex w-full">
                <Button className="w-full justify-between bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25 hover:from-blue-700 hover:to-cyan-600">
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
