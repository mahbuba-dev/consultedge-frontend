
"use server";

import { getDefaultDashboardRoute, isValidRedirectForRole, UserRole } from "@/src/lib/authUtilis";
import { getFriendlyAuthErrorMessage } from "@/src/lib/authErrorMessages";

import { setTokenInCookies } from "@/src/lib/tokenUtils";
import { ApiErrorResponse } from "@/src/types/api.types";
import { ILOginResponse } from "@/src/types/auth.types";
import { ILoginPayload, loginZodSchema } from "@/src/zod/auth.validation";
import { redirect } from "next/navigation";
import { httpClient } from "@/src/lib/axious/httpClient";

const finalizeLogin = async (
    response: { data: ILOginResponse },
    redirectPath?: string,
) => {
    const { accessToken, refreshToken, token, user } = response.data;
    const { role, emailVerified, needPasswordChange, email } = user;

    await setTokenInCookies("accessToken", accessToken, 7 * 24 * 60 * 60); // 7 days
    await setTokenInCookies("refreshToken", refreshToken, 30 * 24 * 60 * 60); // 30 days
    await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60); // 1 day in seconds

    if (!emailVerified) {
        redirect("/verify-email");
    }

    if (needPasswordChange) {
        redirect(`/change-password?email=${email}`);
    }

    const targetPath =
        redirectPath && isValidRedirectForRole(redirectPath, role as UserRole)
            ? redirectPath
            : getDefaultDashboardRoute(role as UserRole);

    redirect(targetPath);
};

export const loginAction = async (payload : ILoginPayload, redirectPath ?: string ) : Promise<ILOginResponse | ApiErrorResponse> =>{
    const parsedPayload = loginZodSchema.safeParse(payload);

    if(!parsedPayload.success){
        const firstError = parsedPayload.error.issues[0].message || "Invalid input";
        return {
            success: false,
            message: firstError,
        }
    }
    try {

        const response = await httpClient.post<ILOginResponse>(
            "/auth/login",
            parsedPayload.data,
            { expectedStatuses: [400, 401, 403, 429] },
        );

        await finalizeLogin(response, redirectPath);
        
    } catch (error : any) {
        if(error && typeof error === "object" && "digest" in error && typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT")){
            throw error;
        }

        if (error && error.response && error.response.data.message === "Email not verified") {
            redirect(`/verify-email?email=${payload.email}`);
        }
        return {
            success: false,
            message: getFriendlyAuthErrorMessage(error, "login"),
        }
    }
}

export const demoLoginAction = async (
    redirectPath?: string,
): Promise<ILOginResponse | ApiErrorResponse> => {
    try {
        const response = await httpClient.post<ILOginResponse>(
            "/auth/demo-login",
            {},
            { expectedStatuses: [400, 401, 403, 429] },
        );

        await finalizeLogin(response, redirectPath);
    } catch (error: any) {
        if (
            error &&
            typeof error === "object" &&
            "digest" in error &&
            typeof error.digest === "string" &&
            error.digest.startsWith("NEXT_REDIRECT")
        ) {
            throw error;
        }

        return {
            success: false,
            message: getFriendlyAuthErrorMessage(error, "login"),
        };
    }
};