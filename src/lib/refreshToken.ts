"use server";

import { setTokenInCookies } from "@/src/lib/tokenUtils";
import { cookies } from "next/headers";

const normalizeApiBaseUrl = (rawValue?: string) => {
  const value = rawValue?.trim().replace(/\/+$/, "");
  if (!value) return undefined;
  return value.endsWith("/api/v1") ? value : `${value}/api/v1`;
};

const BASE_API_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

export async function refreshTokensServerAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) return null;

  const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `refreshToken=${refreshToken}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const { data } = await res.json();
  const { accessToken, refreshToken: newRefreshToken, token } = data;

  if (accessToken) {
    await setTokenInCookies("accessToken", accessToken);
  }

  if (newRefreshToken) {
    await setTokenInCookies("refreshToken", newRefreshToken);
  }

  if (token) {
    await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60);
  }

  return {
    accessToken,
    refreshToken: newRefreshToken,
    sessionToken: token,
  };
}
