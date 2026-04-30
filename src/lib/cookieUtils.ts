"use server";

import { cookies } from "next/headers";

/**
 * 🍪 setCookie()
 * -------------------------
 * Saves a cookie on the server using Next.js `cookies()` API.
 *
 * @param name - Cookie name (e.g., "accessToken")
 * @param value - Cookie value (JWT or any string)
 * @param maxAgeInSeconds - Cookie lifetime in seconds
 */

export const setCookie = async (
  name: string,
  value: string,
  maxAgeInSeconds: number
) => {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  // The access token needs to be readable from the browser so that client-side
  // requests can attach it as a Bearer token to the cross-origin backend.
  // The refresh token stays httpOnly — it is only used server-side.
  const isBrowserReadable = name === "accessToken";

  try {
    cookieStore.set(name, value, {
      httpOnly: !isBrowserReadable, // 🔒 Still httpOnly for refresh token / session
      secure: isProduction, // 🔐 HTTPS only in production
      sameSite: "lax", // ✅ works better for OAuth redirects
      path: "/", // 🌍 Cookie available across the entire site
      maxAge: maxAgeInSeconds, // ⏳ Expiration time
    });
  } catch {
    // Server Components cannot mutate cookies. Refresh-token rotation may be
    // attempted from a Server Component render (e.g. Navbar) — in that case
    // we silently skip persisting the new token. A subsequent Server Action
    // / Route Handler / middleware pass will write the rotated token.
  }
};

/**
 * 🧹 purgeCookieEverywhere()
 * -------------------------
 * Issues multiple expiring `Set-Cookie` headers for the same cookie name
 * across every plausible (path, secure, httpOnly) combo. This is the only
 * reliable way to evict orphan duplicates that were written previously with
 * different attributes (e.g. `httpOnly: true` vs `httpOnly: false`, or a
 * non-root path inherited from a middleware write). Without this sweep,
 * `cookieStore.set(name, value, { path: "/" })` only shadows the cookies
 * whose attributes already match — leaving stale duplicates around.
 *
 * Safe to call before every legitimate write and during logout.
 */
export const purgeCookieEverywhere = async (name: string) => {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  const paths = ["/", "/api", "/api/v1", "/auth", "/dashboard"];
  const httpOnlyVariants = [true, false];
  const secureVariants = isProduction ? [true, false] : [false];

  for (const path of paths) {
    for (const httpOnly of httpOnlyVariants) {
      for (const secure of secureVariants) {
        try {
          cookieStore.set(name, "", {
            httpOnly,
            secure,
            sameSite: "lax",
            path,
            maxAge: 0,
            expires: new Date(0),
          });
        } catch {
          /* ignore individual variant failures */
        }
      }
    }
  }
};



/**
 * 🍪 getCookie()
 * -------------------------
 * Reads a cookie value by name.
 *
 * @param name - Cookie name
 * @returns string | undefined
 */

export const getCookie = async (name: string) => {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
};


/**
 * 🍪 deleteCookie()
 * -------------------------
 * Removes a cookie from the browser.
 *
 * @param name - Cookie name
 */

export const deleteCookie = async (name: string) => {
  const cookieStore = await cookies();
  cookieStore.delete(name);
};