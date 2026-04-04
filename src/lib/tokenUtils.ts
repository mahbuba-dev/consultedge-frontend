"use server";

import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { setCookie } from "./cookieUtils";


// 🔐 Secret key used to verify access tokens
const JWT_ACCESS_SECRET_TOKEN = process.env.JWT_ACCESS_SECRET;

/**
 * ⏳ Calculates how many seconds are left before a JWT expires.
 * - If token is invalid → returns 0
 * - If token has no exp field → returns 0
 * - Otherwise → returns remaining seconds
 */
const getTokenRemainingTime = (token: string): number => {
    if (!token) return 0;

    try {
        // ✔ Verify token if secret exists, otherwise decode only
        const tokenPayload = JWT_ACCESS_SECRET_TOKEN
            ? (jwt.verify(token, JWT_ACCESS_SECRET_TOKEN) as JwtPayload)
            : (jwt.decode(token) as JwtPayload);

        // ❌ If token has no expiration field, treat as expired
        if (!tokenPayload || !tokenPayload.exp) {
            return 0;
        }

        // ⏱ Calculate remaining time (exp is in seconds)
        const remainingTime =
            tokenPayload.exp - Math.floor(Date.now() / 1000);

        // ✔ Never return negative values
        return remainingTime > 0 ? remainingTime : 0;

    } catch (error) {
        console.error("Error parsing token:", error);
        return 0;
    }
};


/**
 * 🍪 Sets a token inside Next.js cookies with correct expiration.
 * - name → cookie name (e.g., "accessToken")
 * - token → JWT token string
 * - maxAgeInSeconds → (ignored, because we calculate real remaining time)
 */

export const setTokenInCookies = async (
    name: string,
    token: string,
    fallbackMaxAgeInSeconds = 60 * 60 * 24 // Default to 1 days if no token or fallback provided
) => {
    // ⏳ Calculate actual remaining time from token payload
    const maxAgeInSecond = getTokenRemainingTime(token);

    // 🍪 Save cookie using your custom cookie utility
    await setCookie(name, token, maxAgeInSecond || fallbackMaxAgeInSeconds);
}