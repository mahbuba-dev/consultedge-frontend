// "use server";

// import { httpClient } from "@/src/lib/axious/httpClient";
// import { ILOginResponse } from "@/src/types/auth.types";
// import { loginZodSchema } from "@/src/zod/auth.validation";
// import { ApiErrorResponse } from "@/src/types/api.types";
// import { setTokenInCookies } from "@/src/lib/tokenUtils";
// import { redirect } from "next/navigation";

// /**
//  * 🔐 loginAction()
//  * -----------------------------------------
//  * Handles user login using:
//  * - Zod validation
//  * - API request to backend
//  * - Secure cookie storage
//  * - Redirect on success
//  *
//  * @param payload - Login form data (email + password)
//  * @returns ILOginResponse | ApiErrorResponse
//  */


// export const loginAction = async (
//   payload: ILOginResponse
// ): Promise<ILOginResponse | ApiErrorResponse> => {
  
//   // ✅ Validate input using Zod
//   const parsedPayload = loginZodSchema.safeParse(payload);

//   if (!parsedPayload.success) {
//     const firstError =
//       parsedPayload.error.issues[0].message || "Invalid input";

//     return {
//       success: false,
//       message: firstError,
//     };
//   }

//   try {
//     // 🌐 Send login request to backend
//     const response = await httpClient.post<ILOginResponse>(
//       "/auth/login",
//       parsedPayload.data
//     );

//     // 🎟 Extract tokens from backend response
//     const { token, accessToken, refreshToken } = response.data;

//     // 🍪 Save tokens in secure cookies
//     await setTokenInCookies("accessToken", accessToken, 7 * 24 * 60 * 60); // 7 days
//     await setTokenInCookies("refreshToken", refreshToken, 30 * 24 * 60 * 60); // 30 days
//     await setTokenInCookies("better-auth.session_token", token, 7 * 24 * 60 * 60);

//     // 🚀 Redirect user to dashboard after successful login
//     redirect("/dashboard");
    
//   } catch (error: any) {
//    return {
//       success: false,
//       message: `Login failed: ${
//         error instanceof Error ? error.message : "Unknown error"
//       }`,
//     };
//   }
// };




/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getDefaultDashboardRoute, isValidRedirectForRole, UserRole } from "@/src/lib/authUtilis";
import { getFriendlyAuthErrorMessage } from "@/src/lib/authErrorMessages";

import { setTokenInCookies } from "@/src/lib/tokenUtils";
import { ApiErrorResponse } from "@/src/types/api.types";
import { ILOginResponse } from "@/src/types/auth.types";
import { ILoginPayload, loginZodSchema } from "@/src/zod/auth.validation";
import { redirect } from "next/navigation";
import { httpClient } from "@/src/lib/axious/httpClient";

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

        const { accessToken, refreshToken, token, user} = response.data;
        const {role, emailVerified, needPasswordChange, email} = user;
        await setTokenInCookies("accessToken", accessToken, 7 * 24 * 60 * 60); // 7 days
        await setTokenInCookies("refreshToken", refreshToken, 30 * 24 * 60 * 60); // 30 days
        await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60); // 1 day in seconds

        if(!emailVerified){
            redirect("/verify-email");
        }else // in the catch block
            
        if(needPasswordChange){
            //TODO : refactoring
            redirect(`/change-password?email=${email}`);
        }else{
            // redirect(redirectPath || "/dashboard");
            const targetPath = redirectPath && isValidRedirectForRole(redirectPath, role as UserRole) ? redirectPath : getDefaultDashboardRoute(role as UserRole);

            
            redirect(targetPath);
        }
        
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