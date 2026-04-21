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

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [serverError, setServerError] = useState<string | null>(null);
  const [serversuccess, setServersuccess] = useState<string | null>(null);

  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }

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
      setCanResend(false);
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Failed to resend OTP";
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
        const res = await verifyMutation.mutateAsync({
          email: email!,
          otp: value.otp,
        });

        setServersuccess("Email verified successfully!");
        toast.success("Email verified successfully!");

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } catch (err: any) {
        const message = err?.response?.data?.message || "Invalid OTP";
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