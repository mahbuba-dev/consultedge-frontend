"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  DollarSign,
  Layers,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
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
import { getDashboardData } from "@/src/services/dashboard.services";
import type { IAdminDashboardStats } from "@/src/types/admin.dashboard";
import type { ApiResponse } from "@/src/types/api.types";
import ConsultationsBarChart from "../shared/ConsultationsBarChart";
import ConsultationsPieChart from "../shared/ConsultationsPieCharts";
import RecentConsultationsTable from "../shared/RecentConsultationsTable";
import StatsCard from "../shared/StatsCard";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatStatusLabel = (status: string) =>
  status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const AdminDashboardContent = () => {
  const { data: adminDashboardResponse, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard-data"],
    queryFn: () => getDashboardData<IAdminDashboardStats>(),
    refetchOnWindowFocus: false,
    retry: false,
  });

  const data = (adminDashboardResponse as ApiResponse<IAdminDashboardStats> | undefined)?.data;
  const statusItems = data?.consultationStatusDistribution || [];
  const averageRevenuePerConsultation = data?.consultationCount
    ? Math.round((data.totalRevenue || 0) / data.consultationCount)
    : 0;

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <div className="h-40 animate-pulse rounded-2xl bg-muted/60" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-xl bg-muted/60" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Unable to load admin dashboard</CardTitle>
          <CardDescription>
            The platform stats could not be fetched right now.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <Card className="relative overflow-hidden border-white/10 bg-linear-to-br from-slate-950 via-blue-900 to-indigo-700 text-white shadow-2xl shadow-indigo-500/30">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 size-72 rounded-full bg-indigo-400/25 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 size-72 rounded-full bg-blue-400/30 blur-3xl" />
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
              <ShieldCheck className="mr-1 size-3.5" />
              Platform Command Center
            </Badge>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold leading-tight md:text-4xl">
                Oversee ConsultEdge in{" "}
                <span className="bg-linear-to-r from-cyan-200 to-white bg-clip-text text-transparent">
                  real time.
                </span>
              </h1>
              <p className="max-w-xl text-sm text-white/85 md:text-base">
                Track users, consultations, industries, and revenue from one
                modern operational workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/admin/dashboard/industries-management">
                <Button className="bg-white text-slate-900 shadow-md hover:bg-white/90">
                  <Layers className="mr-2 size-4" />
                  Manage industries
                </Button>
              </Link>
              <Link href="/admin/dashboard/expert-management">
                <Button
                  variant="outline"
                  className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
                >
                  Review experts
                  <ArrowUpRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Mini stats ribbon */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Users", value: data.userCount || 0 },
              { label: "Sessions", value: data.consultationCount || 0 },
              { label: "Revenue", value: formatCurrency(data.totalRevenue || 0) },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/25 bg-white/10 p-4 backdrop-blur-md"
              >
                <p className="text-xs uppercase tracking-wider text-white/70">
                  {s.label}
                </p>
                <p className="mt-1 text-xl font-bold lg:text-2xl">{s.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            title: "Experts",
            desc: "Verify & manage",
            href: "/admin/dashboard/expert-management",
            icon: UserCog,
            gradient: "from-blue-500 to-cyan-500",
          },
          {
            title: "Clients",
            desc: "User accounts",
            href: "/admin/dashboard/client-management",
            icon: Users,
            gradient: "from-cyan-500 to-teal-500",
          },
          {
            title: "Industries",
            desc: "Categories",
            href: "/admin/dashboard/industries-management",
            icon: Layers,
            gradient: "from-indigo-500 to-blue-500",
          },
          {
            title: "Payments",
            desc: "Revenue & payouts",
            href: "/admin/dashboard/payment-management",
            icon: DollarSign,
            gradient: "from-emerald-500 to-teal-500",
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatsCard
          title="Experts"
          value={data.expertCount || 0}
          iconName="UserCog"
          description="Registered experts"
          className="bg-linear-to-br from-blue-50 to-white dark:from-blue-950/40 dark:to-slate-900"
        />
        <StatsCard
          title="Clients"
          value={data.clientCount || 0}
          iconName="Users"
          description="Active client accounts"
          className="bg-linear-to-br from-sky-50 to-white dark:from-sky-950/35 dark:to-slate-900"
        />
        <StatsCard
          title="Consultations"
          value={data.consultationCount || 0}
          iconName="CalendarDays"
          description="Booked platform sessions"
          className="bg-linear-to-br from-cyan-50 to-white dark:from-cyan-950/35 dark:to-slate-900"
        />
        <StatsCard
          title="Revenue"
          value={formatCurrency(data.totalRevenue || 0)}
          iconName="DollarSign"
          description="Paid consultation earnings"
          className="bg-linear-to-br from-emerald-50 to-white dark:from-emerald-950/35 dark:to-slate-900"
        />
        <StatsCard
          title="Industries"
          value={data.industryCount || 0}
          iconName="Layers"
          description="Specialized categories"
          className="bg-linear-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-900"
        />
        <StatsCard
          title="Users"
          value={data.userCount || 0}
          iconName="User"
          description="Total platform members"
          className="bg-linear-to-br from-rose-50 to-white dark:from-rose-950/30 dark:to-slate-900"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <ConsultationsBarChart
            data={data.revenueByMonth || []}
            title="Revenue Growth"
            description="Monthly paid revenue trend across the platform."
          />

          <ConsultationsPieChart
            data={statusItems}
            title="Consultation Distribution"
            description="A role-wide view of current consultation statuses."
          />
        </div>

        <Card className="relative overflow-hidden border-slate-200/70 bg-white/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-indigo-600 via-blue-500 to-cyan-400" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-indigo-500" />
              Platform Highlights
            </CardTitle>
            <CardDescription>
              Important operational indicators for admin decision-making.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-xl border border-blue-200/60 bg-linear-to-br from-blue-50 to-cyan-50 p-4 dark:border-blue-500/20 dark:from-blue-500/10 dark:to-cyan-500/10">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
                <TrendingUp className="size-4" />
                Revenue efficiency
              </div>
              <p className="bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-2xl font-bold text-transparent">
                {formatCurrency(averageRevenuePerConsultation)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Average paid value per consultation.
              </p>
            </div>

            <div className="rounded-xl border border-indigo-200/60 bg-linear-to-br from-indigo-50 to-sky-50 p-4 dark:border-indigo-500/20 dark:from-indigo-500/10 dark:to-sky-500/10">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-700 dark:text-sky-300">
                <ShieldCheck className="size-4" />
                Operational summary
              </div>
              <p className="text-sm text-muted-foreground">
                {data.paymentCount || 0} payments processed across {data.industryCount || 0} industries.
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
                  No consultation status data available yet.
                </p>
              )}
            </div>

            <Link href="/admin/dashboard/client-management" className="inline-flex w-full">
              <Button className="w-full justify-between bg-linear-to-r from-indigo-600 to-blue-500 text-white shadow-md shadow-blue-500/25 hover:from-indigo-700 hover:to-blue-600">
                Open user management
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <RecentConsultationsTable
        data={statusItems}
        title="Platform Consultation Snapshot"
        description="A structured live summary of consultation activity across the platform."
      />
    </div>
  );
};

export default AdminDashboardContent;