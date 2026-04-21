"use server";

import { ApiErrorResponse } from "@/src/types/api.types";
import { IRegisterResponse } from "@/src/types/auth.types";
import { getFriendlyAuthErrorMessage } from "@/src/lib/authErrorMessages";

import { redirect } from "next/navigation";
import { httpClient } from "@/src/lib/axious/httpClient";
import { IRegisterPayload, registerZodSchema } from "@/src/zod/auth.validation";

/**
 * 📝 registerAction()
 * -------------------------------------------------
 * Handles:
 * - Zod validation
 * - API request to backend
 * - Redirect to login after successful registration
 */

export const registerAction = async (
  payload: IRegisterPayload,
  redirectPath?: string
): Promise<IRegisterResponse | ApiErrorResponse> => {
  // 1️⃣ Validate input
  const parsed = registerZodSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0].message || "Invalid input";
    return {
      success: false,
      message: firstError,
    };
  }

  try {
    // 2️⃣ Call backend API
    await httpClient.post<IRegisterResponse>(
      "/auth/register",
      parsed.data,
      { expectedStatuses: [400, 403, 409, 429] }
    );

    const safeRedirectPath =
      redirectPath?.startsWith("/") && !redirectPath.startsWith("//")
        ? redirectPath
        : undefined;

    const loginUrl = safeRedirectPath
      ? `/login?redirect=${encodeURIComponent(safeRedirectPath)}`
      : "/login";

    redirect(loginUrl);
  } catch (error: any) {
    // Allow Next.js redirect errors to bubble
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    // Backend says email not verified
    if (
      error?.response?.data?.message === "Email not verified" &&
      payload.email
    ) {
      redirect(`/verify-email?email=${payload.email}`);
    }

    return {
      success: false,
      message: getFriendlyAuthErrorMessage(error, "register"),
    };
  }
};