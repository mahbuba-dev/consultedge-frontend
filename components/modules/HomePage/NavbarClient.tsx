"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Sparkles,
  Sun,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import LogoutButton from "@/components/modules/auth/LogoutButton";
import AISearchBar from "@/components/AI/AISearchBar";

interface NavItem {
  label: string;
  href: string;
}

interface NavbarClientProps {
  navItems: NavItem[];
  isLoggedIn: boolean;
  dashboardHref: string;
  role?: string | null;
  userLabel?: string | null;
}

const getInitials = (value?: string | null) =>
  value
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CE";

const NavbarClient = ({
  navItems,
  isLoggedIn,
  dashboardHref,
  role,
  userLabel,
}: NavbarClientProps) => {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }

    return pathname?.startsWith(href);
  };

  const isDarkMode = mounted && resolvedTheme === "dark";
  const themeLabel = isDarkMode ? "Light mode" : "Dark mode";

  const handleThemeToggle = (e?: React.MouseEvent<HTMLButtonElement>) => {
    const button = e?.currentTarget;
    if (button) {
      // remove any prior burst, then trigger a fresh one
      const prev = button.querySelector(".theme-burst");
      if (prev) prev.remove();
      const burst = document.createElement("span");
      burst.className = "theme-burst";
      button.appendChild(burst);
      window.setTimeout(() => burst.remove(), 950);
    }
    setTheme(isDarkMode ? "light" : "dark");
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/45 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/35"
    >
      <div className="mx-auto w-full max-w-360 px-4 py-3 md:px-6">
        <div className="relative flex items-center justify-between gap-3 rounded-[1.35rem] border border-white/60 bg-white/80 px-3 py-2.5 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.45)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70 overflow-hidden">
          <div className="navbar-gradient-motion" aria-hidden="true" />
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 via-cyan-600 to-sky-500 text-white shadow-lg shadow-blue-500/25 transition-transform duration-200 ease-out group-hover:scale-102 group-hover:drop-shadow-[0_2px_12px_rgba(59,130,246,0.25)]">
              <Sparkles className="size-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-base font-semibold tracking-tight text-foreground md:text-lg">
                  ConsultEdge
                </p>
                <Badge className="hidden border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200 md:inline-flex">
                  Premium
                </Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                Trusted expert consultation network
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-white/75 px-2 py-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/60 lg:flex">
            {navItems.map((item) => {
              const isActive = isActiveRoute(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-full px-3 py-2 text-sm font-medium transition-all
                    ${isActive
                      ? "bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-sm"
                      : "text-muted-foreground hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-800 dark:hover:text-blue-200"}
                  group
                  `}
                >
                  <span className="relative z-10">{item.label}</span>
                  <span
                    className="pointer-events-none absolute left-4 right-4 -bottom-1 h-0.5 w-[calc(100%-2rem)] origin-left scale-x-0 bg-linear-to-r from-blue-500 to-cyan-400 opacity-80 transition-transform duration-250 ease-out group-hover:scale-x-100"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2.5 lg:flex">
            <div className="hidden w-64 xl:block">
              <AISearchBar />
            </div>
            <TooltipProvider delayDuration={300}>
              {/* Theme toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleThemeToggle}
                    className="relative size-9 rounded-full border border-slate-200/80 bg-white/80 text-slate-600 backdrop-blur transition-transform duration-300 hover:scale-110 hover:bg-blue-50 hover:text-blue-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
                  >
                    {isDarkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {themeLabel}
                </TooltipContent>
              </Tooltip>

              {isLoggedIn ? (
                <>
                  {/* Avatar chip with name tooltip */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex size-9 cursor-default items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-cyan-500 text-xs font-bold text-white shadow-sm ring-2 ring-blue-200/60 dark:ring-blue-500/20">
                        {getInitials(userLabel)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <span className="font-semibold">{userLabel ?? "ConsultEdge user"}</span>
                      {role ? (
                        <span className="ml-1.5 font-normal uppercase tracking-wide text-muted-foreground">
                          · {role}
                        </span>
                      ) : null}
                    </TooltipContent>
                  </Tooltip>

                  {/* Dashboard */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                          variant="ghost"
                          size="icon"
                          className="size-9 rounded-full border border-slate-200/80 bg-white/80 text-slate-600 backdrop-blur hover:bg-blue-50 hover:text-blue-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
                        >
                        <Link href={dashboardHref}>
                          <LayoutDashboard className="size-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Dashboard
                    </TooltipContent>
                  </Tooltip>

                  {/* Logout */}
                  <LogoutButton className="inline-flex h-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 px-3 text-xs font-medium text-slate-600 backdrop-blur transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-red-950/40 dark:hover:text-red-400">
                    <LogOut className="mr-1.5 size-3.5" />
                    Log out
                  </LogoutButton>
                </>
              ) : (
                <>
                  {/* Log in */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                          variant="ghost"
                          size="icon"
                          className="size-9 rounded-full border border-slate-200/80 bg-white/80 text-slate-600 backdrop-blur hover:bg-blue-50 hover:text-blue-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
                        >
                        <Link href="/login">
                          <LogIn className="size-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Log in
                    </TooltipContent>
                  </Tooltip>

                  {/* Get started */}
                  <Button
                    asChild
                    size="sm"
                    className="rounded-full bg-linear-to-r from-blue-600 to-cyan-500 px-4 text-xs font-semibold text-white hover:from-blue-700 hover:to-cyan-600"
                  >
                    <Link href="/register" className="text-white">
                      Get Started
                      <ArrowRight className="ml-1.5 size-3.5" />
                    </Link>
                  </Button>
                </>
              )}
            </TooltipProvider>
          </div>

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full border-slate-300 bg-white dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100">
                  <Menu className="size-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="flex w-[88vw] flex-col border-slate-200/70 bg-background/95 sm:max-w-sm dark:border-white/10 dark:bg-slate-950/95">
                <SheetHeader className="px-4 pb-2">
                  <div className="rounded-2xl border border-slate-200/70 bg-linear-to-br from-blue-50 via-white to-cyan-50 p-4 text-left dark:border-white/10 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 via-cyan-600 to-sky-500 text-white shadow-lg shadow-blue-500/20">
                        <Sparkles className="size-5" />
                      </div>
                      <div>
                        <SheetTitle>ConsultEdge</SheetTitle>
                        <SheetDescription>
                          Premium expert consultation network.
                        </SheetDescription>
                      </div>
                    </div>

                    {isLoggedIn ? (
                      <div className="rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950/70">
                        <p className="font-medium text-foreground">{userLabel ?? "ConsultEdge user"}</p>
                        {role ? <p className="text-xs uppercase tracking-wide text-muted-foreground">{role}</p> : null}
                      </div>
                    ) : null}
                  </div>
                </SheetHeader>

                <div className="px-4 pb-3">
                  <AISearchBar variant="mobile" />
                </div>

                <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
                  {navItems.map((item) => {
                    const isActive = isActiveRoute(item.href);

                    return (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                            isActive
                              ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200"
                              : "border-border/60 text-foreground hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-800 dark:hover:text-blue-200"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>

                <div className="mt-auto space-y-3 border-t p-4 dark:border-white/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleThemeToggle}
                    className="relative w-full justify-center rounded-full dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100"
                  >
                    {isDarkMode ? <Sun className="mr-2 size-4" /> : <Moon className="mr-2 size-4" />}
                    {themeLabel}
                  </Button>

                  {isLoggedIn ? (
                    <>
                      <SheetClose asChild>
                        <Button asChild variant="outline" className="w-full justify-center rounded-full dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100">
                          <Link href={dashboardHref}>
                            <LayoutDashboard className="mr-2 size-4" />
                            Dashboard
                          </Link>
                        </Button>
                      </SheetClose>

                      <LogoutButton className="inline-flex h-10 w-full items-center justify-center rounded-full bg-linear-to-r from-blue-600 to-cyan-500 text-sm font-medium text-white transition-colors hover:from-blue-700 hover:to-cyan-600 disabled:opacity-60">
                        <LogOut className="mr-2 size-4" />
                        Logout
                      </LogoutButton>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Button asChild variant="outline" className="w-full rounded-full dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100">
                          <Link href="/login">
                            <LogIn className="mr-2 size-4" />
                            Log in
                          </Link>
                        </Button>
                      </SheetClose>

                      <SheetClose asChild>
                        <Button asChild className="w-full rounded-full bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                          <Link href="/register">
                            Get Started
                            <ArrowRight className="ml-2 size-4" />
                          </Link>
                        </Button>
                      </SheetClose>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavbarClient;
