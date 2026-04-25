// "use server";

// import { JwtPayload } from "jsonwebtoken";
// import jwt from "jsonwebtoken";
// import { cookies } from "next/headers";
// import { setCookie } from "./cookieUtils";


// // 🔐 Secret key used to verify access tokens
// const JWT_ACCESS_SECRET_TOKEN = process.env.JWT_ACCESS_SECRET;

// /**
//  * ⏳ Calculates how many seconds are left before a JWT expires.
//  * - If token is invalid → returns 0
//  * - If token has no exp field → returns 0
//  * - Otherwise → returns remaining seconds
//  */
// const getTokenRemainingTime = (token: string): number => {
//     if (!token) return 0;

//     try {
//         // ✔ Verify token if secret exists, otherwise decode only
//         const tokenPayload = JWT_ACCESS_SECRET_TOKEN
//             ? (jwt.verify(token, JWT_ACCESS_SECRET_TOKEN) as JwtPayload)
//             : (jwt.decode(token) as JwtPayload);

//         // ❌ If token has no expiration field, treat as expired
//         if (!tokenPayload || !tokenPayload.exp) {
//             return 0;
//         }

//         // ⏱ Calculate remaining time (exp is in seconds)
//         const remainingTime =
//             tokenPayload.exp - Math.floor(Date.now() / 1000);

//         // ✔ Never return negative values
//         return remainingTime > 0 ? remainingTime : 0;

//     } catch (error) {
//         console.error("Error parsing token:", error);
//         return 0;
//     }
// };


// /**
//  * 🍪 Sets a token inside Next.js cookies with correct expiration.
//  * - name → cookie name (e.g., "accessToken")
//  * - token → JWT token string
//  * - maxAgeInSeconds → (ignored, because we calculate real remaining time)
//  */

// export const setTokenInCookies = async (
//     name: string,
//     token: string,
//     fallbackMaxAgeInSeconds = 60 * 60 * 24 // Default to 1 days if no token or fallback provided
// ) => {
//     // ⏳ Calculate actual remaining time from token payload
//     const maxAgeInSecond = getTokenRemainingTime(token);

//     // 🍪 Save cookie using your custom cookie utility
//     await setCookie(name, token, maxAgeInSecond || fallbackMaxAgeInSeconds);
// }




"use server"

import jwt, { JwtPayload } from "jsonwebtoken";
import { purgeCookieEverywhere, setCookie } from "./cookieUtils";


const getTokenSecondsRemaining =  (token: string): number => {
    if(!token) return 0;
    try {
        const tokenPayload= jwt.decode(token) as JwtPayload;

        if (tokenPayload && !tokenPayload.exp){
            return 0;
        }

        const remainingSeconds = tokenPayload.exp as number - Math.floor(Date.now() / 1000)

        return remainingSeconds > 0 ? remainingSeconds : 0;

    } catch (error) {
        console.error("Error decoding token:", error);
        return 0;
    }
} 

export const setTokenInCookies = async (
    name : string,
    token : string,
    fallbackMaxAgeInSeconds = 60 * 60 * 24 // 1 days
) => {
    // 🧹 Always evict any orphan duplicates of this cookie that were written
    // previously with different attributes (path / secure / httpOnly).
    // Without this sweep, the new write only shadows matching variants and
    // the browser keeps the stale ones forever — which is how two different
    // users' tokens can co-exist in `Application → Cookies`.
    await purgeCookieEverywhere(name);

    // If the caller didn't actually have a token (e.g. the backend's email/
    // password login response omits the BetterAuth `token` field), we MUST
    // bail out *after* the purge so we don't write a literal "undefined"
    // string back into the cookie. Skipping the purge would leave the
    // previous user's session token in place — which is exactly the
    // "logged in as expert but acts like client" bug.
    if (!token || typeof token !== "string") {
        return;
    }

    let maxAgeInSeconds;

    if (name !== "better-auth.session_token"){
        maxAgeInSeconds = getTokenSecondsRemaining(token);
    }

    await setCookie(name, token, maxAgeInSeconds || fallbackMaxAgeInSeconds);
}


export async function isTokenExpiringSoon(token: string, thresholdInSeconds = 300) : Promise<boolean> {
    const remainingSeconds = getTokenSecondsRemaining(token);
    return remainingSeconds > 0 && remainingSeconds <= thresholdInSeconds;
}

export async function isTokenExpired(token: string) : Promise<boolean> {
    const remainingSeconds = getTokenSecondsRemaining(token);
    return remainingSeconds === 0;
}