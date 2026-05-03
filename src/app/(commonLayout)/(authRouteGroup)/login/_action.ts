
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

// ---------------------------------------------------------------------------
// Demo Login
// ---------------------------------------------------------------------------
// Calls the backend's dedicated demo-login endpoints which auto-seed the
// underlying account on first call. This avoids relying on hand-managed env
// credentials matching what's actually present in the database.
// ---------------------------------------------------------------------------

type DemoRole = "client" | "expert" | "admin";

const DEMO_ENDPOINTS: Record<DemoRole, string> = {
    client: "/auth/demo-login",
    expert: "/auth/demo-login/expert",
    admin: "/auth/demo-login/admin",
};

const DEMO_LABELS: Record<DemoRole, string> = {
    client: "client",
    expert: "expert",
    admin: "admin",
};

const runDemoLogin = async (
    role: DemoRole,
    redirectPath?: string,
): Promise<ILOginResponse | ApiErrorResponse> => {
    try {
        const response = await httpClient.post<ILOginResponse>(
            DEMO_ENDPOINTS[role],
            {},
            { expectedStatuses: [400, 401, 403, 404, 429, 500] },
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

        const status = error?.response?.status ?? error?.status;
        if (status === 401 || status === 403 || status === 404) {
            return {
                success: false,
                message: `The ${DEMO_LABELS[role]} demo account isn't available on this deployment yet. Please try the regular login or contact the site owner.`,
            };
        }

        return {
            success: false,
            message: getFriendlyAuthErrorMessage(error, "login"),
        };
    }

    return undefined as unknown as ILOginResponse;
};

export const demoLoginAction = async (
    redirectPath?: string,
): Promise<ILOginResponse | ApiErrorResponse> => runDemoLogin("client", redirectPath);

export const expertDemoLoginAction = async (
    redirectPath?: string,
): Promise<ILOginResponse | ApiErrorResponse> => runDemoLogin("expert", redirectPath);

export const adminDemoLoginAction = async (
    redirectPath?: string,
): Promise<ILOginResponse | ApiErrorResponse> => runDemoLogin("admin", redirectPath);