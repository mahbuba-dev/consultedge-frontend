"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { registerAction } from "@/src/app/(commonLayout)/(authRouteGroup)/register/_action";
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



import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getFriendlyAuthErrorMessage } from "@/src/lib/authErrorMessages";
import { IRegisterPayload, registerZodSchema } from "@/src/zod/auth.validation";

interface RegisterFormProps {
  redirectPath?: string;
}

const RegisterForm = ({ redirectPath }: RegisterFormProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const safeRedirectPath =
    redirectPath?.startsWith("/") && !redirectPath.startsWith("//")
      ? redirectPath
      : undefined;

  const loginHref = safeRedirectPath
    ? `/login?redirect=${encodeURIComponent(safeRedirectPath)}`
    : "/login";

  const handleGoogleAuth = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
    const redirectTarget = safeRedirectPath || "/dashboard";

    // Send the OAuth round-trip back through our own /auth/oauth-callback page
    // so it can persist the tokens on the frontend domain before forwarding
    // the user on to their requested destination.
    const callbackURL = new URL(
      `/auth/oauth-callback?redirect=${encodeURIComponent(redirectTarget)}`,
      window.location.origin,
    ).toString();

    window.location.href = `${baseUrl || window.location.origin}/auth/login/google?callbackURL=${encodeURIComponent(callbackURL)}&redirect=${encodeURIComponent(redirectTarget)}`;
  };

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: IRegisterPayload) =>
      registerAction(payload, redirectPath),
  });

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },

    onSubmit: async ({ value }) => {
      setServerError(null);

      try {
        const result = (await mutateAsync(value)) as any;

        if (!result.success) {
          setServerError(result.message || "We couldn't create your account right now. Please try again.");
          return;
        }

        // Redirect handled inside registerAction
      } catch (error: any) {
        // Next.js redirect can throw on the client boundary.
        // Do not show a false failure message when redirect is intentional.
        if (
          (typeof error?.digest === "string" && error.digest.startsWith("NEXT_REDIRECT")) ||
          String(error?.message || "").includes("NEXT_REDIRECT")
        ) {
          return;
        }

        setServerError(getFriendlyAuthErrorMessage(error, "register"));
      }
    },
  });

  return (
    <Card className="relative w-full max-w-md mx-auto overflow-hidden rounded-3xl border border-white/40 bg-white/55 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-950/55">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-600 via-cyan-500 to-teal-400"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_55%)] opacity-70 mix-blend-overlay dark:opacity-20"
      />
      <CardHeader className="relative text-center">
        <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
        <CardDescription>
          Fill in your details to create your account.
        </CardDescription>
      </CardHeader>

      <CardContent className="relative">
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
          {/* Full Name */}
          <form.Field
            name="fullName"
            validators={{ onChange: registerZodSchema.shape.fullName }}
          >
            {(field) => (
              <AppField
                field={field}
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
              />
            )}
          </form.Field>

          {/* Email */}
          <form.Field
            name="email"
            validators={{ onChange: registerZodSchema.shape.email }}
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

          {/* Password */}
          <form.Field
            name="password"
            validators={{ onChange: registerZodSchema.shape.password }}
          >
            {(field) => (
              <AppField
                field={field}
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                append={
                  <Button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    variant="ghost"
                    size="icon"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                }
              />
            )}
          </form.Field>

          {/* Server Error */}
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {/* Submit */}
          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <AppSubmitButton
                isPending={isSubmitting || isPending}
                pendingLabel="Creating Account..."
                disabled={!canSubmit}
              >
                Sign Up
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

        {/* Google Signup */}
        <Button
          variant="outline"
          className="w-full rounded-full border-slate-200 bg-white/70 backdrop-blur hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          type="button"
          onClick={handleGoogleAuth}
        >
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
          Sign up with Google
        </Button>
      </CardContent>

      <CardFooter className="relative justify-center border-t border-white/40 pt-4 dark:border-white/10">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={loginHref}
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            Log In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;