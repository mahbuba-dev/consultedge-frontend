"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { loginAction } from "@/src/app/(commonLayout)/(authRouteGroup)/login/_action";
import {
  demoLoginAction,
  expertDemoLoginAction,
  adminDemoLoginAction,
} from "@/src/app/(commonLayout)/(authRouteGroup)/login/_action";
import AppField from "@/components/form/AppField";
import AppSubmitButton from "@/components/form/AppSubmitButton";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ILoginPayload, loginZodSchema } from "@/src/zod/auth.validation";
import { getFriendlyAuthErrorMessage } from "@/src/lib/authErrorMessages";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginFormProps {
  redirectPath?: string;
  passwordReset?: boolean;
}

const LoginForm = ({ redirectPath, passwordReset = false }: LoginFormProps) => {
  // Track server-side error messages
  const [serverError, setServerError] = useState<string | null>(null);

  // Toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  const safeRedirectPath =
    redirectPath?.startsWith("/") && !redirectPath.startsWith("//")
      ? redirectPath
      : undefined;

  const registerHref = safeRedirectPath
    ? `/register?redirect=${encodeURIComponent(safeRedirectPath)}`
    : "/register";

  const handleGoogleAuth = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
    const redirectTarget = safeRedirectPath || "/dashboard";

    // Always send the OAuth round-trip back through our own /auth/oauth-callback
    // page so it can persist the tokens on the frontend domain. The eventual
    // post-login destination is forwarded as `redirect` so the callback page
    // can hand the user off to the right dashboard / deep link.
    const callbackURL = new URL(
      `/auth/oauth-callback?redirect=${encodeURIComponent(redirectTarget)}`,
      window.location.origin,
    ).toString();

    window.location.href = `${baseUrl || window.location.origin}/auth/login/google?callbackURL=${encodeURIComponent(callbackURL)}&redirect=${encodeURIComponent(redirectTarget)}`;
  };

  /**
   * React Query mutation for login
   * Calls loginAction(payload, redirectPath)
   */
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: ILoginPayload) =>
      loginAction(payload, redirectPath),
  });

  const { mutateAsync: mutateDemoLogin, isPending: isDemoPending } = useMutation({
    mutationFn: () => demoLoginAction(redirectPath),
  });

  const { mutateAsync: mutateExpertDemo, isPending: isExpertDemoPending } = useMutation({
    mutationFn: () => expertDemoLoginAction(redirectPath),
  });

  const { mutateAsync: mutateAdminDemo, isPending: isAdminDemoPending } = useMutation({
    mutationFn: () => adminDemoLoginAction(redirectPath),
  });

  const isAnyDemoPending = isDemoPending || isExpertDemoPending || isAdminDemoPending;

  const runDemo = async (
    runner: () => Promise<unknown>,
    fallbackMessage: string,
  ) => {
    setServerError(null);

    try {
      const result = (await runner()) as any;

      if (result && result.success === false) {
        setServerError(result.message || fallbackMessage);
      }
    } catch (error: any) {
      if (
        (typeof error?.digest === "string" &&
          error.digest.startsWith("NEXT_REDIRECT")) ||
        String(error?.message ?? "").includes("NEXT_REDIRECT")
      ) {
        return;
      }

      setServerError(getFriendlyAuthErrorMessage(error, "login"));
    }
  };

  /**
   * TanStack Form setup
   */
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },

    onSubmit: async ({ value }) => {
      setServerError(null);

      try {
        const result = (await mutateAsync(value)) as any;

        // Handle failed login
        if (!result.success) {
          setServerError(result.message || "We couldn't sign you in right now. Please try again.");
          return;
        }

        // success case handled inside loginAction (redirect)
      } catch (error: any) {
        // Next.js server redirect can surface as an exception on the client.
        // In that case, do not show a false "Login failed" message.
        if (
          (typeof error?.digest === "string" && error.digest.startsWith("NEXT_REDIRECT")) ||
          String(error?.message || "").includes("NEXT_REDIRECT")
        ) {
          return;
        }

        setServerError(getFriendlyAuthErrorMessage(error, "login"));
      }
    },
  });

  return (
    <Card className="relative w-full max-w-md mx-auto overflow-hidden rounded-3xl border border-white/40 bg-white/55 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-950/55">
      {/* Top accent bar */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-600 via-cyan-500 to-teal-400"
      />
      {/* Inner highlight ring */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_55%)] opacity-70 mix-blend-overlay dark:opacity-20"
      />
      {/* Header */}
      <CardHeader className="relative text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
        <CardDescription>
          Please enter your credentials to log in.
        </CardDescription>
      </CardHeader>

      <CardContent className="relative">
        {passwordReset ? (
          <Alert className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-800">
            <AlertDescription>
              Password updated successfully. Please sign in with your new password.
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Form */}
        <form
          method="POST"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Email Field */}
          <form.Field
            name="email"
            validators={{ onChange: loginZodSchema.shape.email }}
          >
            {(field) => (
              <AppField
                field={field}
                label="Email"
                type="email"
                placeholder="Enter your email"
              />
            )}
          </form.Field>

          {/* Password Field */}
          <form.Field
            name="password"
            validators={{ onChange: loginZodSchema.shape.password }}
          >
            {(field) => (
              <AppField
                field={field}
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="cursor-pointer"
                append={
                  <Button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    variant="ghost"
                    size="icon"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </Button>
                }
              />
            )}
          </form.Field>

          {/* Forgot Password Link */}
          <div className="text-right mt-2">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {/* Demo login — uses pre-seeded demo credentials via server action */}
          <div className="grid gap-2 sm:grid-cols-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                runDemo(
                  () => mutateDemoLogin(),
                  "Demo login failed. Please try again or use the regular login.",
                )
              }
              disabled={isPending || isAnyDemoPending}
              className="w-full justify-center gap-2 rounded-full border-blue-200 bg-blue-50/70 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-cyan-400/30 dark:bg-cyan-500/10 dark:text-cyan-200 dark:hover:bg-cyan-500/15"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              {isDemoPending ? "Starting…" : "Demo client"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                runDemo(
                  () => mutateExpertDemo(),
                  "Expert demo login failed. Please try again later.",
                )
              }
              disabled={isPending || isAnyDemoPending}
              className="w-full justify-center gap-2 rounded-full border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/15"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              {isExpertDemoPending ? "Starting…" : "Demo expert"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                runDemo(
                  () => mutateAdminDemo(),
                  "Admin demo login failed. Please try again later.",
                )
              }
              disabled={isPending || isAnyDemoPending}
              className="w-full justify-center gap-2 rounded-full border-amber-200 bg-amber-50/70 text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/15"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              {isAdminDemoPending ? "Starting…" : "Demo admin"}
            </Button>
          </div>

          {/* Submit Button */}
          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <AppSubmitButton
                isPending={isSubmitting || isPending}
                pendingLabel="Logging In...."
                disabled={!canSubmit}
              >
                Log In
              </AppSubmitButton>
            )}
          </form.Subscribe>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/70 dark:border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="rounded-full border border-white/40 bg-white/60 px-3 py-0.5 text-xs font-medium text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Login */}
         <Button
           variant="outline"
           className="w-full rounded-full border-slate-200 bg-white/70 backdrop-blur hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
           type="button"
           onClick={handleGoogleAuth}
         >
          
          {/* Google Icon */}
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </Button>
      </CardContent>

      {/* Footer */}
      <CardFooter className="relative justify-center border-t border-white/40 pt-4 dark:border-white/10">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href={registerHref}
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            Sign Up for an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;