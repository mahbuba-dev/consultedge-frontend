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
        const accessToken = cookieStore.get("accessToken")?.value;
        const sessionToken = cookieStore.get("better-auth.session_token")?.value

        if (!accessToken) {
            return null;
        }

        const res = await fetch(`${BASE_API_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`
            }
        });

        if (!res.ok) {
            console.error("Failed to fetch user info:", res.status, res.statusText);
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
  // get session token from cookie or localStorage
  const sessionToken = localStorage.getItem("betterAuthSessionToken"); // অথবা cookie থেকে handle করো

  if (!sessionToken) {
    throw new Error("Session token missing. Please login again.");
  }

  const response = await fetch(`${BASE_API_URL}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`, // send token to backend
    },
    body: JSON.stringify(payload),
  });

  console.log('Final response:', response);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.message || "Failed to change password");
  }

  return response.json(); // backend থেকে accessToken, refreshToken, message return হবে
}