"use client";

import { useTransition } from "react";

import { logoutAction } from "@/src/app/(commonLayout)/(authRouteGroup)/logOut/_action";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
  /\/+$/,
  "",
);

type LogoutButtonProps = {
  className?: string;
  children: React.ReactNode;
};

/**
 * Client-side logout entry point.
 *
 * Why this exists: when a user signs in with Google, BetterAuth stores its
 * session cookie on the **backend domain** (e.g. `*.onrender.com`). The
 * server-side `logoutAction` only sees cookies on the frontend (Vercel)
 * domain, so it cannot evict that backend-domain session. The next login
 * then ends up "haunted" by the previous user's identity (e.g. an EXPERT
 * login appears as a CLIENT to the API because the stale session cookie
 * outranks the new Bearer token).
 *
 * The browser, however, can hit the backend `/auth/logout` directly with
 * `credentials: "include"`. The backend's `Set-Cookie: …; Max-Age=0`
 * response then clears the BetterAuth cookie on its own domain. Only after
 * that do we run the frontend server action to purge Vercel-domain cookies
 * and redirect.
 */
export default function LogoutButton({
  className,
  children,
}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = async () => {
    if (BACKEND_BASE_URL) {
      try {
        await fetch(`${BACKEND_BASE_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });
      } catch {
        /* network error — still proceed with frontend cleanup */
      }
    }

    startTransition(() => {
      // Server action purges frontend cookies and redirects to /login.
      void logoutAction();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={className}
    >
      {children}
    </button>
  );
}
