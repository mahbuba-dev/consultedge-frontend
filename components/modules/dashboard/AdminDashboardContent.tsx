"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

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
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-linear-to-r from-slate-950 via-violet-900 to-indigo-700 text-white shadow-xl">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
              <Sparkles className="mr-1 size-3.5" />
              Platform Command Center
            </Badge>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold md:text-3xl">
                Oversee ConsultEdge performance in real time
              </h1>
              <p className="max-w-2xl text-sm text-white/80 md:text-base">
                Track users, consultations, industries, and revenue from one modern
                operational workspace.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/dashboard/industries-management">
              <Button className="bg-white text-slate-900 hover:bg-white/90">
                Manage industries
              </Button>
            </Link>
            <Link href="/admin/dashboard/expert-management">
              <Button
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Review experts
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatsCard
          title="Experts"
          value={data.expertCount || 0}
          iconName="UserCog"
          description="Registered experts"
          className="bg-linear-to-br from-violet-50 to-white"
        />
        <StatsCard
          title="Clients"
          value={data.clientCount || 0}
          iconName="Users"
          description="Active client accounts"
          className="bg-linear-to-br from-sky-50 to-white"
        />
        <StatsCard
          title="Consultations"
          value={data.consultationCount || 0}
          iconName="CalendarDays"
          description="Booked platform sessions"
          className="bg-linear-to-br from-fuchsia-50 to-white"
        />
        <StatsCard
          title="Revenue"
          value={formatCurrency(data.totalRevenue || 0)}
          iconName="DollarSign"
          description="Paid consultation earnings"
          className="bg-linear-to-br from-emerald-50 to-white"
        />
        <StatsCard
          title="Industries"
          value={data.industryCount || 0}
          iconName="Layers"
          description="Specialized categories"
          className="bg-linear-to-br from-amber-50 to-white"
        />
        <StatsCard
          title="Users"
          value={data.userCount || 0}
          iconName="User"
          description="Total platform members"
          className="bg-linear-to-br from-rose-50 to-white"
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

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Platform Highlights</CardTitle>
            <CardDescription>
              Important operational indicators for admin decision-making.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-xl bg-muted/40 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-700">
                <TrendingUp className="size-4" />
                Revenue efficiency
              </div>
              <p className="text-sm text-muted-foreground">
                Average paid value per consultation is {formatCurrency(averageRevenuePerConsultation)}.
              </p>
            </div>

            <div className="rounded-xl border bg-linear-to-br from-indigo-50 to-sky-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-700">
                <ShieldCheck className="size-4" />
                Operational summary
              </div>
              <p className="text-sm text-muted-foreground">
                {data.paymentCount || 0} payments processed across {data.industryCount || 0} industries.
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
                  No consultation status data available yet.
                </p>
              )}
            </div>

            <Link href="/admin/dashboard/client-management" className="inline-flex w-full">
              <Button variant="outline" className="w-full justify-between">
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