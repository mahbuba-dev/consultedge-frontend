// "use server";

// import { cookies } from "next/headers";

// import { setTokenInCookies } from "@/src/lib/tokenUtils";

// import { httpClient } from "../lib/axious/httpClient";
// import {
//   IUpdateProfilePayload,
//   IUpdateProfileResponse,
//   IUserProfile,
// } from "../types/auth.types";

// const normalizeApiBaseUrl = (rawValue?: string) => {
//   const value = rawValue?.trim().replace(/\/+$/, "");

//   if (!value) {
//     return undefined;
//   }

//   return value.endsWith("/api/v1") ? value : `${value}/api/v1`;
// };

// const BASE_API_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

// if (!BASE_API_URL) {
//   throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
// }

// export async function getNewTokensWithRefreshToken(refreshToken: string): Promise<boolean> {
//   try {
//     const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Cookie: `refreshToken=${refreshToken}`,
//       },
//     });

//     if (!res.ok) {
//       return false;
//     }

//     const { data } = await res.json();
//     const { accessToken, refreshToken: newRefreshToken, token } = data;

//     if (accessToken) {
//       await setTokenInCookies("accessToken", accessToken);
//     }

//     if (newRefreshToken) {
//       await setTokenInCookies("refreshToken", newRefreshToken);
//     }

//     if (token) {
//       await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60);
//     }

//     return true;
//   } catch (error) {
//     console.error("Error refreshing token:", error);
//     return false;
//   }
// }

// export async function getUserInfo() {
//   try {
//     const getAuthState = async () => {
//       const cookieStore = await cookies();

//       return {
//         accessToken: cookieStore.get("accessToken")?.value,
//         refreshToken: cookieStore.get("refreshToken")?.value,
//         sessionToken: cookieStore.get("better-auth.session_token")?.value,
//       };
//     };

//     let { accessToken, refreshToken, sessionToken } = await getAuthState();

//     if (!accessToken && !refreshToken && !sessionToken) {
//       return null;
//     }

//     const buildCookieHeader = (tokens: {
//       accessToken?: string;
//       refreshToken?: string;
//       sessionToken?: string;
//     }) =>
//       [
//         tokens.accessToken ? `accessToken=${tokens.accessToken}` : null,
//         tokens.refreshToken ? `refreshToken=${tokens.refreshToken}` : null,
//         tokens.sessionToken ? `better-auth.session_token=${tokens.sessionToken}` : null,
//       ]
//         .filter(Boolean)
//         .join("; ");

//     const fetchUserInfo = async (cookieHeader: string, token?: string) => {
//       return fetch(`${BASE_API_URL}/auth/me`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           ...(cookieHeader ? { Cookie: cookieHeader } : {}),
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         cache: "no-store",
//       });
//     };

//     let res = await fetchUserInfo(
//       buildCookieHeader({ accessToken, refreshToken, sessionToken }),
//       accessToken,
//     );

//     if (res.status === 401 && refreshToken) {
//       const refreshed = await getNewTokensWithRefreshToken(refreshToken);

//       if (refreshed) {
//         ({ accessToken, refreshToken, sessionToken } = await getAuthState());

//         res = await fetchUserInfo(
//           buildCookieHeader({ accessToken, refreshToken, sessionToken }),
//           accessToken,
//         );
//       }
//     }

//     if (!res.ok) {
//       if (res.status !== 401) {
//         console.error("Failed to fetch user info:", res.status, res.statusText);
//       }

//       return null;
//     }

//     const { data } = await res.json();
//     return data;
//   } catch (error) {
//     console.error("Error fetching user info:", error);
//     return null;
//   }
// }

// export async function resetPasswordService(payload: {
//   email: string;
//   otp: string;
//   password: string;
// }) {
//   const res = await fetch(`${BASE_API_URL}/auth/reset-password`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       email: payload.email,
//       otp: payload.otp,
//       newPassword: payload.password,
//       password: payload.password,
//     }),
//   });

//   return res.json();
// }

// export async function forgotPasswordService(payload: { email: string }) {
//   const body = JSON.stringify({ email: payload.email });

//   const requestOtp = async (endpoint: string) => {
//     const response = await fetch(`${BASE_API_URL}${endpoint}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body,
//     });

//     const data = await response.json().catch(() => ({}));

//     if (!response.ok) {
//       const error: any = new Error(data?.message || "Failed to send reset OTP");
//       error.response = { data, status: response.status };
//       throw error;
//     }

//     return data;
//   };

//   try {
//     return await requestOtp("/auth/forget-password");
//   } catch (error: any) {
//     if (error?.response?.status === 404) {
//       return requestOtp("/auth/forgot-password");
//     }

//     throw error;
//   }
// }




// export interface ChangePasswordPayload {
//   currentPassword: string;
//   newPassword: string;
// }

// export async function changePasswordService(payload: ChangePasswordPayload) {
//   try {
//     const cookieStore = await cookies();
//     const accessToken = cookieStore.get("accessToken")?.value;
//     const refreshToken = cookieStore.get("refreshToken")?.value;
//     const sessionToken =
//       cookieStore.get("better-auth.session_token")?.value ||
//       cookieStore.get("__Secure-better-auth.session_token")?.value;

//     const cookieHeader = [
//       accessToken ? `accessToken=${accessToken}` : null,
//       refreshToken ? `refreshToken=${refreshToken}` : null,
//       sessionToken ? `better-auth.session_token=${sessionToken}` : null,
//       sessionToken ? `__Secure-better-auth.session_token=${sessionToken}` : null,
//     ]
//       .filter(Boolean)
//       .join("; ");

//     const response = await fetch(`${BASE_API_URL}/auth/change-password`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         ...(cookieHeader ? { Cookie: cookieHeader } : {}),
//       },
//       body: JSON.stringify({
//         currentPassword: payload.currentPassword,
//         oldPassword: payload.currentPassword,
//         newPassword: payload.newPassword,
//         password: payload.newPassword,
//       }),
//       cache: "no-store",
//     });

//     const result = await response.json().catch(() => ({}));
//     const issuccess = response.ok && result?.success === true;

//     const responseData = result?.data;
//     const nextAccessToken = responseData?.accessToken;
//     const nextRefreshToken = responseData?.refreshToken;
//     const nextSessionToken = responseData?.token;

//     if (issuccess) {
//       if (nextAccessToken) {
//         await setTokenInCookies("accessToken", nextAccessToken, 7 * 24 * 60 * 60);
//       }

//       if (nextRefreshToken) {
//         await setTokenInCookies("refreshToken", nextRefreshToken, 30 * 24 * 60 * 60);
//       }

//       if (nextSessionToken) {
//         await setTokenInCookies("better-auth.session_token", nextSessionToken, 24 * 60 * 60);
//       }
//     }

//     return {
//       ...result,
//       success: issuccess,
//       message: result?.message || (issuccess ? "Password changed successfully" : "Failed to change password"),
//     };
//   } catch (error: any) {
//     return {
//       success: false,
//       message:
//         error?.response?.data?.message ||
//         error?.message ||
//         "Failed to change password",
//     };
//   }
// }





// export const getMe = async (): Promise<IUserProfile> => {
//   const response = await httpClient.get<IUserProfile>("/auth/me");
//   return response.data;
// };



// export const updateProfile = async (payload: IUpdateProfilePayload) => {
//   const response = await httpClient.put<IUpdateProfileResponse>(
//     "/auth/update-profile",
//     payload
//   );
//   return response.data;
// };














"use server";

import { cookies } from "next/headers";
import { httpClient } from "@/src/lib/axious/httpClient";

import {
  IUpdateProfilePayload,
  IUpdateProfileResponse,
  IUserProfile,
} from "@/src/types/auth.types";
import { setTokenInCookies } from "@/src/lib/tokenUtils";
import { refreshTokensServerAction } from "../lib/refreshToken";

// ---------------------------------------------
// Base API URL
// ---------------------------------------------
const normalizeApiBaseUrl = (rawValue?: string) => {
  const value = rawValue?.trim().replace(/\/+$/, "");
  if (!value) return undefined;
  return value.endsWith("/api/v1") ? value : `${value}/api/v1`;
};

const BASE_API_URL =
  normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL) ??
  "http://localhost:5000/api/v1";

if (!process.env.NEXT_PUBLIC_API_BASE_URL && typeof window === "undefined") {
  console.warn(
    "[auth.services] NEXT_PUBLIC_API_BASE_URL is not set. Using fallback:",
    BASE_API_URL,
  );
}



export async function getNewTokensWithRefreshToken(refreshToken: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (!res.ok) {
      return false;
    }

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

    return true;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return false;
  }
}








// ---------------------------------------------
// getUserInfo (server-side, with refresh support)
// ---------------------------------------------
export async function getUserInfo() {
  try {
    const cookieStore = await cookies();

    let accessToken = cookieStore.get("accessToken")?.value;
    let refreshToken = cookieStore.get("refreshToken")?.value;
    let sessionToken =
      cookieStore.get("better-auth.session_token")?.value ||
      cookieStore.get("__Secure-better-auth.session_token")?.value;

    if (!accessToken && !refreshToken && !sessionToken) {
      return null;
    }

    const buildCookieHeader = () =>
      [
        accessToken ? `accessToken=${accessToken}` : null,
        refreshToken ? `refreshToken=${refreshToken}` : null,
        sessionToken ? `better-auth.session_token=${sessionToken}` : null,
      ]
        .filter(Boolean)
        .join("; ");

    const fetchUser = async () => {
      return fetch(`${BASE_API_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: buildCookieHeader(),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        cache: "no-store",
      });
    };

    let res = await fetchUser();

    if (res.status === 401 && refreshToken) {
      const refreshed = await refreshTokensServerAction();

      if (refreshed) {
        accessToken = refreshed.accessToken;
        refreshToken = refreshed.refreshToken;
        sessionToken = refreshed.sessionToken;

        res = await fetchUser();
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
    console.error("getUserInfo failed:", error);
    return null;
  }
}

// ---------------------------------------------
// Reset Password
// ---------------------------------------------
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
      password: payload.password,
    }),
  });

  return res.json();
}

// ---------------------------------------------
// Forgot Password / Request OTP
// ---------------------------------------------
export async function forgotPasswordService(payload: { email: string }) {
  const body = JSON.stringify({ email: payload.email });

  const requestOtp = async (endpoint: string) => {
    const response = await fetch(`${BASE_API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error: any = new Error(data?.message || "Failed to send reset OTP");
      error.response = { data, status: response.status };
      throw error;
    }

    return data;
  };

  try {
    return await requestOtp("/auth/forget-password");
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return requestOtp("/auth/forgot-password");
    }
    throw error;
  }
}

// ---------------------------------------------
// Change Password
// ---------------------------------------------
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function changePasswordService(payload: ChangePasswordPayload) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;
    const sessionToken =
      cookieStore.get("better-auth.session_token")?.value ||
      cookieStore.get("__Secure-better-auth.session_token")?.value;

    const cookieHeader = [
      accessToken ? `accessToken=${accessToken}` : null,
      refreshToken ? `refreshToken=${refreshToken}` : null,
      sessionToken ? `better-auth.session_token=${sessionToken}` : null,
      sessionToken ? `__Secure-better-auth.session_token=${sessionToken}` : null,
    ]
      .filter(Boolean)
      .join("; ");

    const response = await fetch(`${BASE_API_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({
        currentPassword: payload.currentPassword,
        oldPassword: payload.currentPassword,
        newPassword: payload.newPassword,
        password: payload.newPassword,
      }),
      cache: "no-store",
    });

    const result = await response.json().catch(() => ({}));
    const isSuccess = response.ok && result?.success === true;

    const responseData = result?.data;
    const nextAccessToken = responseData?.accessToken;
    const nextRefreshToken = responseData?.refreshToken;
    const nextSessionToken = responseData?.token;

    if (isSuccess) {
      if (nextAccessToken) {
        await setTokenInCookies("accessToken", nextAccessToken, 7 * 24 * 60 * 60);
      }

      if (nextRefreshToken) {
        await setTokenInCookies("refreshToken", nextRefreshToken, 30 * 24 * 60 * 60);
      }

      if (nextSessionToken) {
        await setTokenInCookies("better-auth.session_token", nextSessionToken, 24 * 60 * 60);
      }
    }

    return {
      ...result,
      success: isSuccess,
      message:
        result?.message ||
        (isSuccess ? "Password changed successfully" : "Failed to change password"),
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

// ---------------------------------------------
// Client-facing helpers using httpClient
// ---------------------------------------------
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
