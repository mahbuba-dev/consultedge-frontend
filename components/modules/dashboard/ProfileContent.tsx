"use client";

import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/src/services/auth.services";
import { IUserProfile } from "@/src/types/auth.types";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  KeyRound,
  Mail,
  Pencil,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const getInitials = (name?: string) =>
  (name || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 1)
    .toUpperCase();

export default function ProfileContent() {
  const { data, isLoading, isError } = useQuery<IUserProfile>({
    queryKey: ["me"],
    queryFn: getMe,
  });

  const user = data;

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 sm:px-6">
        <div className="h-44 animate-pulse rounded-3xl bg-muted/40" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-72 animate-pulse rounded-3xl bg-muted/40 lg:col-span-2" />
          <div className="h-72 animate-pulse rounded-3xl bg-muted/40" />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <p className="text-center text-destructive">
        Failed to load profile information.
      </p>
    );
  }

  const roleLabel = user.role.toLowerCase().replace("_", " ");
  const isExpert = user.role === "EXPERT";
  const isClient = user.role === "CLIENT";
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="relative mx-auto w-full max-w-5xl space-y-6 px-4 sm:px-6">
      {/* Decorative glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 -z-10 h-72 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.18),transparent_55%),radial-gradient(circle_at_75%_30%,rgba(34,211,238,0.18),transparent_55%)]"
      />

      {/* Hero card */}
      <Card className="relative overflow-hidden rounded-3xl border-white/40 bg-white/70 shadow-[0_30px_70px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-600 via-cyan-500 to-teal-400"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-cyan-400/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -bottom-24 size-72 rounded-full bg-blue-500/20 blur-3xl"
        />

        <CardContent className="relative flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="relative">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 via-cyan-500 to-teal-400 text-2xl font-bold text-white shadow-lg shadow-cyan-500/30 ring-4 ring-white/60 dark:ring-white/10">
                {getInitials(user.name)}
              </div>
              <span className="absolute -bottom-1 -right-1 inline-flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-white dark:ring-slate-900">
                <BadgeCheck className="size-3.5" />
              </span>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/70 bg-white/70 px-2.5 py-0.5 text-xs font-medium text-blue-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-cyan-200">
                <Sparkles className="size-3" />
                My profile
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {user.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-4" />
                  {user.email}
                </span>
                <span className="hidden text-muted-foreground/40 sm:inline">·</span>
                <span className="inline-flex items-center gap-1.5 capitalize">
                  <UserRound className="size-4" />
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-full dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10">
              <Link href="/my-profile/update-profile">
                <Pencil className="mr-2 size-4" />
                Edit Profile
              </Link>
            </Button>
            <Button asChild className="rounded-full bg-linear-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600">
              <Link href="/change-password">
                <KeyRound className="mr-2 size-4" />
                Change Password
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Information panel */}
        <Card className="relative overflow-hidden rounded-3xl border-white/40 bg-white/70 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.3)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
          <CardContent className="space-y-8 p-6 sm:p-8">
            <section>
              <header className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">Basic information</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">
                  Personal
                </span>
              </header>

              <div className="grid gap-3 sm:grid-cols-2">
                <ProfileField
                  icon={UserRound}
                  label="Full name"
                  value={user.name}
                />
                <ProfileField
                  icon={Mail}
                  label="Email"
                  value={user.email}
                />
                <ProfileField
                  icon={ShieldCheck}
                  label="Role"
                  value={roleLabel}
                  capitalize
                />
                <ProfileField
                  icon={CalendarDays}
                  label="Account status"
                  value={user.status ?? "Active"}
                  highlight={(user.status ?? "ACTIVE").toUpperCase() === "ACTIVE"}
                />
              </div>
            </section>

            {isExpert && user.expert ? (
              <section>
                <header className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">Expert details</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200">
                    Verified expert
                  </span>
                </header>

                <div className="grid gap-3 sm:grid-cols-2">
                  <ProfileField
                    icon={Building2}
                    label="Industry"
                    value={user.expert?.industry?.name}
                  />
                  <ProfileField
                    icon={Briefcase}
                    label="Title"
                    value={user.expert?.title}
                  />
                  <ProfileField
                    icon={CalendarDays}
                    label="Experience"
                    value={
                      typeof user.expert?.experience === "number"
                        ? `${user.expert.experience} years`
                        : undefined
                    }
                  />
                </div>
              </section>
            ) : null}

            {isClient && user.client ? (
              <section>
                <header className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">Client details</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                    Member
                  </span>
                </header>

                <div className="grid gap-3 sm:grid-cols-2">
                  <ProfileField
                    icon={UserRound}
                    label="Client name"
                    value={user.client?.fullName}
                  />
                </div>
              </section>
            ) : null}
          </CardContent>
        </Card>

        {/* Side action panel */}
        <Card className="relative overflow-hidden rounded-3xl border-white/40 bg-white/70 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.3)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
          <CardContent className="space-y-5 p-6 sm:p-8">
            <div>
              <h2 className="text-base font-semibold text-foreground">Quick actions</h2>
              <p className="text-sm text-muted-foreground">
                Jump straight to the area that matters most for you.
              </p>
            </div>

            <div className="space-y-3">
              {isExpert ? (
                <ActionLink
                  href="/expert/dashboard"
                  title="Expert dashboard"
                  description="Manage availability, sessions, and reviews."
                />
              ) : null}

              {isClient ? (
                <ActionLink
                  href="/dashboard/consultations"
                  title="My consultations"
                  description="See bookings, payments, and session status."
                />
              ) : null}

              {isAdmin ? (
                <ActionLink
                  href="/admin/dashboard"
                  title="Admin panel"
                  description="Oversee users, experts, and platform health."
                />
              ) : null}

              <ActionLink
                href="/my-profile/update-profile"
                title="Update profile"
                description="Refresh your personal details and preferences."
              />

              <ActionLink
                href="/change-password"
                title="Security"
                description="Change your password and protect your account."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface ProfileFieldProps {
  label: string;
  value?: string;
  icon: LucideIcon;
  capitalize?: boolean;
  highlight?: boolean;
}

function ProfileField({ label, value, icon: Icon, capitalize, highlight }: ProfileFieldProps) {
  return (
    <div className="group rounded-2xl border border-white/60 bg-white/60 p-4 backdrop-blur transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5 text-cyan-600 dark:text-cyan-300" />
        {label}
      </div>
      <p
        className={`mt-1.5 wrap-break-word text-sm font-semibold text-foreground ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {highlight && value ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]" />
            {value}
          </span>
        ) : (
          value || "—"
        )}
      </p>
    </div>
  );
}

interface ActionLinkProps {
  href: string;
  title: string;
  description: string;
}

function ActionLink({ href, title, description }: ActionLinkProps) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/60 p-3.5 backdrop-blur transition hover:border-cyan-300 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:border-cyan-400/40 dark:hover:bg-white/10"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-cyan-600 transition-transform group-hover:translate-x-0.5 dark:text-cyan-300" />
    </Link>
  );
}
