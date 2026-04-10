import { NextRequest, NextResponse } from "next/server";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoute,
  isValidRedirectForRole,
  UserRole,
} from "./lib/authUtilis";
import { jwtUtils } from "./lib/jwtUtilis";
import {
  getNewTokensWithRefreshToken,
  getUserInfo,
} from "./services/auth.services";
import { isTokenExpiringSoon } from "./lib/tokenUtils";

/**
 * Refresh access token proactively using refresh token
 */
async function refreshTokenMiddleware(refreshToken: string): Promise<boolean> {
  try {
    const refresh = await getNewTokensWithRefreshToken(refreshToken);
    return !!refresh;
  } catch (error) {
    console.error("Error refreshing token in middleware:", error);
    return false;
  }
}

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const pathWithQuery = `${pathname}${request.nextUrl.search}`;

    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;
    const sessionToken = request.cookies.get("better-auth.session_token")?.value;

    const decodedAccessToken =
      accessToken &&
      jwtUtils.verifyToken(
        accessToken,
        process.env.JWT_ACCESS_SECRET as string
      ).data;

    const isValidAccessToken =
      accessToken &&
      jwtUtils.verifyToken(
        accessToken,
        process.env.JWT_ACCESS_SECRET as string
      ).success;

    let userRole: UserRole | null = null;
    if (decodedAccessToken) {
      userRole = decodedAccessToken.role as UserRole;
    }

    const routerOwner = getRouteOwner(pathname);
    const isAuth = isAuthRoute(pathname);
    const requestedRedirect = request.nextUrl.searchParams.get("redirect");
    const safeRedirectPath =
      requestedRedirect?.startsWith("/") && !requestedRedirect.startsWith("//")
        ? requestedRedirect
        : undefined;

    const getPostLoginRedirectPath = (role: UserRole | null) => {
      if (
        role &&
        safeRedirectPath &&
        isValidRedirectForRole(safeRedirectPath, role)
      ) {
        return safeRedirectPath;
      }

      return role ? getDefaultDashboardRoute(role) : "/";
    };

    // ---------------------------------------------------------
    // 1) PROACTIVE TOKEN REFRESH
    // ---------------------------------------------------------
    if (
      isValidAccessToken &&
      refreshToken &&
      (await isTokenExpiringSoon(accessToken))
    ) {
      const requestHeaders = new Headers(request.headers);
      const response = NextResponse.next({ request: { headers: requestHeaders } });

      try {
        const refreshed = await refreshTokenMiddleware(refreshToken);
        if (refreshed) requestHeaders.set("x-token-refreshed", "1");

        return NextResponse.next({
          request: { headers: requestHeaders },
          headers: response.headers,
        });
      } catch (error) {
        console.error("Error refreshing token:", error);
      }

      return response;
    }

    // ---------------------------------------------------------
    // 2) LOGGED-IN USERS SHOULD NOT ACCESS AUTH PAGES
    // except verify-email and reset-password
    // ---------------------------------------------------------
    if (
      isAuth &&
      pathname !== "/verify-email" &&
      pathname !== "/reset-password" &&
      (accessToken || sessionToken)
    ) {
      const userInfo = await getUserInfo();
      const resolvedRole = (userInfo?.role as UserRole) || userRole;

      if (userInfo || (isValidAccessToken && resolvedRole)) {
        return NextResponse.redirect(
          new URL(getPostLoginRedirectPath(resolvedRole ?? null), request.url)
        );
      }
    }

    // ---------------------------------------------------------
    // 3) RESET PASSWORD PAGE LOGIC (Forgot Password + Admin)
    // ---------------------------------------------------------
    if (pathname === "/reset-password") {
      const email = request.nextUrl.searchParams.get("email");

      // Case 1: Logged-in ADMIN with needPasswordChange → allow reset-password
      if (accessToken && email) {
        const userInfo = await getUserInfo();
        const resolvedRole = (userInfo?.role as UserRole) || userRole;

        if (userInfo?.needPasswordChange) {
          return NextResponse.next();
        }

        if (userInfo || (isValidAccessToken && resolvedRole)) {
          return NextResponse.redirect(
            new URL(getPostLoginRedirectPath(resolvedRole ?? null), request.url)
          );
        }

        return NextResponse.next();
      }

      // Case 2: Forgot-password flow → allow reset-password
      if (email) {
        return NextResponse.next();
      }

      // Case 3: No email → redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathWithQuery);
      return NextResponse.redirect(loginUrl);
    }

    // ---------------------------------------------------------
    // 4) PUBLIC ROUTES → ALLOW
    // ---------------------------------------------------------
    if (routerOwner === null) {
      return NextResponse.next();
    }

    // ---------------------------------------------------------
    // 5) NOT LOGGED IN → BLOCK PROTECTED ROUTES
    // ---------------------------------------------------------
    if ((!accessToken || !isValidAccessToken) && !sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathWithQuery);
      return NextResponse.redirect(loginUrl);
    }

    // ---------------------------------------------------------
    // 6) ENFORCE EMAIL VERIFICATION + PASSWORD CHANGE
    // ---------------------------------------------------------
    if (accessToken || sessionToken) {
      const userInfo = await getUserInfo();

      if (!userInfo) {
        if (isValidAccessToken && userRole) {
          return NextResponse.next();
        }

        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathWithQuery);
        return NextResponse.redirect(loginUrl);
      }

      userRole = (userInfo.role as UserRole) || userRole;

      if (userInfo) {
        // EMAIL NOT VERIFIED → force verify-email
        if (!userInfo.emailVerified) {
          if (pathname !== "/verify-email") {
            const verifyEmailUrl = new URL("/verify-email", request.url);
            verifyEmailUrl.searchParams.set("email", userInfo.email);
            return NextResponse.redirect(verifyEmailUrl);
          }
          return NextResponse.next();
        }

        // EMAIL VERIFIED → block verify-email page
        if (userInfo.emailVerified && pathname === "/verify-email") {
          return NextResponse.redirect(
            new URL(getDefaultDashboardRoute(userRole as UserRole), request.url)
          );
        }

        // ADMIN NEED PASSWORD CHANGE → force change-password
        if (userInfo.needPasswordChange) {
          if (pathname !== "/change-password") {
            const changePasswordUrl = new URL("/change-password", request.url);
            changePasswordUrl.searchParams.set("email", userInfo.email);
            return NextResponse.redirect(changePasswordUrl);
          }
          return NextResponse.next();
        }

        // Allow access to change-password for all authenticated users (voluntary or forced)
        if (pathname === "/change-password") {
          return NextResponse.next();
        }
      }
    }

    // ---------------------------------------------------------
    // 7) COMMON PROTECTED ROUTES → ALLOW
    // ---------------------------------------------------------
    if (routerOwner === "COMMON") {
      return NextResponse.next();
    }

    // ---------------------------------------------------------
    // 8) ROLE-BASED ROUTES → BLOCK IF ROLE DOES NOT MATCH
    // ---------------------------------------------------------
    if (routerOwner === "ADMIN" || routerOwner === "EXPERT" || routerOwner === "CLIENT") {
      if (routerOwner !== userRole) {
        return NextResponse.redirect(
          new URL(getDefaultDashboardRoute(userRole as UserRole), request.url)
        );
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Error in proxy middleware:", error);
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)",
  ],
};