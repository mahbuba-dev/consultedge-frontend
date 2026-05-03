"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import AppField from "@/components/form/AppField";
import AppSubmitButton from "@/components/form/AppSubmitButton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { httpClient } from "@/src/lib/axious/httpClient";

// Translate raw backend messages into something a normal user can act on.
const friendlyOtpMessage = (rawMessage: unknown, fallback: string) => {
  const text = typeof rawMessage === "string" ? rawMessage.trim() : "";
  const lower = text.toLowerCase();

  if (!text) return fallback;
  if (/expired|expiry|timed?\s?out/.test(lower))
    return "This OTP has expired. Please request a new one.";
  if (/invalid|incorrect|wrong|mismatch|not match/.test(lower))
    return "The code you entered is incorrect. Please double-check and try again.";
  if (/too many|rate limit|limit reached|429/.test(lower))
    return "Too many attempts. Please wait a minute before trying again.";
  if (/not found|no otp|no record/.test(lower))
    return "We couldn't find an active OTP for this email. Please request a new one.";
  if (/already verified|already used|used/.test(lower))
    return "This code has already been used. Please request a new one if needed.";
  if (/network|failed to fetch|timeout/.test(lower))
    return "Network issue. Check your connection and try again.";
  return text;
};

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [serverError, setServerError] = useState<string | null>(null);
  const [serversuccess, setServersuccess] = useState<string | null>(null);

  const [timer, setTimer] = useState(120);
  const canResend = timer <= 0;

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Verify OTP mutation
  const verifyMutation = useMutation({
    mutationFn: async (payload: { email: string; otp: string }) => {
      return httpClient.post("/auth/verify-email", payload, {
        expectedStatuses: [400, 401, 403, 429],
      });
    },
  });

  // Resend OTP mutation
  const resendMutation = useMutation({
    mutationFn: async () => {
      return httpClient.post("/auth/resend-otp", { email }, {
        expectedStatuses: [400, 403, 404, 429],
      });
    },
    onSuccess: () => {
      setServersuccess("A new OTP has been sent to your email.");
      setServerError(null);
      toast.success("A new OTP has been sent to your email.");
      setTimer(120);
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message || err?.message;
      const message = friendlyOtpMessage(raw, "Couldn't send a new code right now. Please try again.");
      setServerError(message);
      setServersuccess(null);
      toast.error(message);
    },
  });

  // TanStack Form
  const form = useForm({
    defaultValues: { otp: "" },

    onSubmit: async ({ value }) => {
      setServerError(null);
      setServersuccess(null);

      try {
        const _res = await verifyMutation.mutateAsync({
          email: email!,
          otp: value.otp,
        });

        setServersuccess("Email verified successfully!");
        toast.success("Email verified successfully!");

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } catch (err: any) {
        const raw = err?.response?.data?.message || err?.message;
        const message = friendlyOtpMessage(raw, "Invalid OTP. Please try again.");
        setServerError(message);
        toast.error(message);
      }
    },
  });

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
      <p className="text-gray-600 mb-6">
        Enter the OTP sent to <strong>{email}</strong>
      </p>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        {/* OTP Field */}
        <form.Field name="otp">
          {(field) => (
            <AppField
              field={field}
              label="OTP Code"
              placeholder="Enter the 6-digit OTP"
            />
          )}
        </form.Field>

        {/* Error */}
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        {/* success */}
        {serversuccess && (
          <Alert className="border-green-500 text-green-700">
            <AlertDescription>{serversuccess}</AlertDescription>
          </Alert>
        )}

        {/* Submit */}
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <AppSubmitButton
              isPending={isSubmitting || verifyMutation.isPending}
              pendingLabel="Verifying..."
              disabled={!canSubmit}
            >
              Verify Email
            </AppSubmitButton>
          )}
        </form.Subscribe>
      </form>

      {/* Resend OTP */}
      <div className="mt-6 text-center">
        {!canResend ? (
          <p className="text-sm text-gray-500">
            Resend OTP in <strong>{timer}s</strong>
          </p>
        ) : (
          <Button
            variant="link"
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
          >
            Resend OTP
          </Button>
        )}
      </div>
    </div>
  );
}