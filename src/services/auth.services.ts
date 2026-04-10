"use server";

import { setTokenInCookies } from "@/src/lib/tokenUtils";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if(!BASE_API_URL){
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

export async function getNewTokensWithRefreshToken(refreshToken  : string) : Promise<boolean> {
    try {
        const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
            method: "POST",
            headers:{
                "Content-Type": "application/json",
                Cookie : `refreshToken=${refreshToken}`
            }
        });

        if(!res.ok){
            return false;
        }

        const {data} = await res.json();

        const { accessToken, refreshToken: newRefreshToken, token } = data;

        if(accessToken){
            await setTokenInCookies("accessToken", accessToken);
        }

        if(newRefreshToken){
            await setTokenInCookies("refreshToken", newRefreshToken);
        }

        if(token){
            await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60); // 1 day in seconds
        }

        return true;
    } catch (error) {
        console.error("Error refreshing token:", error);
        return false;
    }
}



export async function getUserInfo() {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get("refreshToken")?.value;

        const buildCookieHeader = async () => {
            const currentCookieStore = await cookies();
            return currentCookieStore
                .getAll()
                .filter((cookie) => Boolean(cookie.value))
                .map((cookie) => `${cookie.name}=${cookie.value}`)
                .join("; ");
        };

        const fetchUserInfo = async (cookieHeader: string) => {
            return fetch(`${BASE_API_URL}/auth/me`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: cookieHeader,
                },
                cache: "no-store",
            });
        };

        const cookieHeader = await buildCookieHeader();

        if (!cookieHeader) {
            return null;
        }

        let res = await fetchUserInfo(cookieHeader);

        if (res.status === 401 && refreshToken) {
            const refreshed = await getNewTokensWithRefreshToken(refreshToken);

            if (refreshed) {
                const updatedCookieHeader = await buildCookieHeader();

                if (updatedCookieHeader) {
                    res = await fetchUserInfo(updatedCookieHeader);
                }
            }
        }

        if (!res.ok) {
            if (res.status !== 401) {
                console.error("Failed to fetch user info:", res.status, res.statusText);
            }
            return null;
        }

        const { data } = await res.json();
        return data;
    } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
    }
}




export async function resetPasswordService(payload: {
  email: string;
  otp: string;
  password: string;
}) {
  const res = await fetch(`${BASE_API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      otp: payload.otp,
      newPassword: payload.password,
    }),
  });

  return res.json();
}




export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function changePasswordService(payload: ChangePasswordPayload) {
  try {
    const response = await httpClient.post<{ message?: string; success?: boolean }>(
      "/auth/change-password",
      payload
    );

    return {
      ...response,
      success: response?.success ?? true,
      message: response?.message || "Password changed successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to change password",
    };
  }
}





import type { ApiResponse } from "@/src/types/api.types";

import { httpClient } from "../lib/axious/httpClient";
import { IUpdateProfilePayload, IUpdateProfileResponse, IUserProfile } from "../types/auth.types";

export const getMe = async (): Promise<IUserProfile> => {
  const response = await httpClient.get<IUserProfile>("/auth/me");
  return response.data;
};



export const updateProfile = async (payload: IUpdateProfilePayload) => {
  const response = await httpClient.put<IUpdateProfileResponse>(
    "/auth/update-profile",
    payload
  );
  return response.data;
};
