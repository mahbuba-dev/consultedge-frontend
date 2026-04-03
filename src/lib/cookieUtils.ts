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

  cookieStore.set(name, value, {
    httpOnly: true,      // 🔒 Prevents JS access (secure against XSS)
    secure: true,        // 🔐 Only sent over HTTPS
    sameSite: "strict",  // 🚫 Prevents CSRF attacks
    path: "/",           // 🌍 Cookie available across the entire site
    maxAge: maxAgeInSeconds, // ⏳ Expiration time
  });
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