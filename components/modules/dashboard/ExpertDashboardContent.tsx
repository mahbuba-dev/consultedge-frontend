"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MessageSquareQuote, Sparkles, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMe } from "@/src/services/auth.services";
import { getDashboardData } from "@/src/services/dashboard.services";
import { getTestimonialsForExpertContext } from "@/src/services/testimonial.services";
import type { ApiResponse } from "@/src/types/api.types";
import type { IUserProfile } from "@/src/types/auth.types";
import type { IExpertDashboardStats } from "@/src/types/expert.dashboard";
import type { ITestimonial } from "@/src/types/testimonial.types";
import ConsultationsPieChart from "../shared/ConsultationsPieCharts";
import RecentConsultationsTable from "../shared/RecentConsultationsTable";
import StatsCard from "../shared/StatsCard";
import TestimonialCard from "../shared/TestimonialCard";

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

const ExpertDashboardContent = () => {
  const { data: expertDashboardResponse, isLoading, isError } = useQuery({
    queryKey: ["expert-dashboard-data"],
    queryFn: () => getDashboardData<IExpertDashboardStats>(),
    refetchOnWindowFocus: false,
    retry: false,
  });

  const data = (
    expertDashboardResponse as ApiResponse<IExpertDashboardStats> | undefined
  )?.data;

  const { data: profile } = useQuery<IUserProfile>({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
  });

  const expertId = profile?.expert?.id;
  const userId = profile?.id;

  const { data: testimonials = [] } = useQuery<ITestimonial[]>({
    queryKey: ["expert-testimonials", expertId, userId],
    queryFn: () => getTestimonialsForExpertContext([expertId, userId]),
    enabled: Boolean(expertId || userId),
    staleTime: 60 * 1000,
  });

  const statusItems = data?.consultationStatusDistribution || [];
  const completedCount =
    statusItems.find((item) => item.status === "COMPLETED")?.count || 0;
  const pendingCount =
    statusItems.find((item) => item.status === "PENDING")?.count || 0;
  const completionRate = data?.consultationCount
    ? Math.round((completedCount / data.consultationCount) * 100)
    : 0;
  const averageRevenuePerConsultation = data?.consultationCount
    ? Math.round((data.totalRevenue || 0) / data.consultationCount)
    : 0;

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <div className="h-40 animate-pulse rounded-2xl bg-muted/60" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl bg-muted/60"
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
          <CardTitle>Unable to load expert dashboard</CardTitle>
          <CardDescription>
            We could not fetch your dashboard stats right now.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/my-profile">
            <Button variant="outline">Go to profile</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-linear-to-r from-blue-600 via-indigo-600 to-sky-500 text-white shadow-xl">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
              <Sparkles className="mr-1 size-3.5" />
              Expert Workspace
            </Badge>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold md:text-3xl">
                Welcome to your expert dashboard
              </h1>
              <p className="max-w-2xl text-sm text-white/80 md:text-base">
                Track consultations, revenue, reviews, and client growth from one
                polished workspace.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/my-profile">
              <Button className="bg-white text-slate-900 hover:bg-white/90 px-5">
                View Profile
              </Button>
            </Link>

            <Link href="/change-password">
              <Button
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Update Security
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
          description="All sessions booked with you"
          className="bg-linear-to-br from-blue-50 to-white"
        />

        <StatsCard
          title="Unique Clients"
          value={data.clientCount || 0}
          iconName="Users"
          description="Clients you have worked with"
          className="bg-linear-to-br from-sky-50 to-white"
        />

        <StatsCard
          title="Total Revenue"
          value={formatCurrency(data.totalRevenue || 0)}
          iconName="DollarSign"
          description="Paid earnings from consultations"
          className="bg-linear-to-br from-emerald-50 to-white"
        />

        <StatsCard
          title="Reviews Received"
          value={data.reviewCount || 0}
          iconName="Star"
          description="Testimonials from your clients"
          className="bg-linear-to-br from-amber-50 to-white"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ConsultationsPieChart
            data={statusItems}
            title="Consultation Status Overview"
            description="A live breakdown of your pending, ongoing, completed, and cancelled sessions."
          />
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Performance Snapshot</CardTitle>
            <CardDescription>
              Quick insights to help you stay on top of your consulting workflow.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Completion rate</p>
              <div className="mt-1 text-3xl font-bold">{completionRate}%</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {completedCount} completed • {pendingCount} pending
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

            <div className="rounded-xl border bg-linear-to-br from-indigo-50 to-sky-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-700">
                <TrendingUp className="size-4" />
                Revenue efficiency
              </div>
              <p className="text-sm text-muted-foreground">
                You are earning about {formatCurrency(averageRevenuePerConsultation)}
                per consultation on average.
              </p>
            </div>

            <Link href="/my-profile" className="inline-flex w-full">
              <Button variant="outline" className="w-full justify-between">
                Manage profile details
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <RecentConsultationsTable
          data={statusItems}
          title="Recent Consultation Snapshot"
          description="A structured table of the latest consultation activity derived from your dashboard data."
        />

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Client Reviews</CardTitle>
            <CardDescription>
              Feedback shared by clients after completed consultations.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {testimonials.length > 0 ? (
              testimonials
                .slice(0, 3)
                .map((testimonial) => (
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    compact
                  />
                ))
            ) : (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                  <MessageSquareQuote className="size-4 text-blue-600" />
                  No reviews yet
                </div>
                Reviews from completed consultations will appear here automatically.
              </div>
            )}

            <Link href="/expert/dashboard/my-reviews" className="inline-flex w-full">
              <Button variant="outline" className="w-full justify-between">
                Open reviews page
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpertDashboardContent;
