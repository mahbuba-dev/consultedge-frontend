"use client";

import Link from "next/link";
import {
  ArrowRight,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Sparkles,
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
import { logoutAction } from "@/src/app/(commonLayout)/(authRouteGroup)/logOut/_action";

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

const NavbarClient = ({
  navItems,
  isLoggedIn,
  dashboardHref,
  role,
  userLabel,
}: NavbarClientProps) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-background/80 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 via-fuchsia-600 to-sky-500 text-white shadow-lg shadow-violet-500/25">
            <Sparkles className="size-5" />
          </div>

          <div>
            <p className="text-base font-semibold tracking-tight text-foreground md:text-lg">
              ConsultEdge
            </p>
            <p className="text-xs text-muted-foreground">
              Premium consultation network
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-200/80 bg-white/80 px-2 py-1 shadow-sm lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-violet-50 hover:text-violet-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {isLoggedIn ? (
            <>
              {role ? (
                <Badge variant="secondary" className="bg-violet-100 text-violet-700">
                  {role}
                </Badge>
              ) : null}

              {userLabel ? (
                <span className="max-w-36 truncate text-sm text-muted-foreground">
                  {userLabel}
                </span>
              ) : null}

              <Link href={dashboardHref}>
                <Button variant="outline" className="rounded-full">
                  <LayoutDashboard className="mr-2 size-4" />
                  Dashboard
                </Button>
              </Link>

              <form action={logoutAction}>
                <Button
                  type="submit"
                  className="rounded-full bg-linear-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600"
                >
                  <LogOut className="mr-2 size-4" />
                  Logout
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="rounded-full">
                  <LogIn className="mr-2 size-4" />
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full bg-linear-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600">
                  Get Started
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[88vw] border-slate-200/70 bg-background/95 sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>ConsultEdge</SheetTitle>
                <SheetDescription>
                  Navigate the platform and manage your account.
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-2 px-4 pb-4">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded-xl border border-border/60 px-4 py-3 text-sm font-medium text-foreground transition hover:bg-violet-50 hover:text-violet-700"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>

              <div className="mt-auto space-y-3 border-t p-4">
                {isLoggedIn ? (
                  <>
                    {role ? (
                      <Badge variant="secondary" className="bg-violet-100 text-violet-700">
                        Signed in as {role}
                      </Badge>
                    ) : null}

                    <SheetClose asChild>
                      <Link href={dashboardHref} className="block">
                        <Button
                          variant="outline"
                          className="w-full justify-center rounded-full"
                        >
                          <LayoutDashboard className="mr-2 size-4" />
                          Dashboard
                        </Button>
                      </Link>
                    </SheetClose>

                    <form action={logoutAction}>
                      <Button
                        type="submit"
                        className="w-full rounded-full bg-linear-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600"
                      >
                        <LogOut className="mr-2 size-4" />
                        Logout
                      </Button>
                    </form>
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Link href="/login" className="block">
                        <Button variant="outline" className="w-full rounded-full">
                          <LogIn className="mr-2 size-4" />
                          Log in
                        </Button>
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link href="/register" className="block">
                        <Button className="w-full rounded-full bg-linear-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600">
                          Get Started
                          <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </Link>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default NavbarClient;
