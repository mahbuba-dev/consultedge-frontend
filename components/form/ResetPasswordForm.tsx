"use client";

import { useForm } from "@tanstack/react-form";
import { resetPasswordSchema } from "@/src/zod/resetPassword.validation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { resetPasswordService } from "@/src/services/auth.services";

// Translate raw backend messages into something a normal user can act on.
const friendlyOtpMessage = (rawMessage: unknown, fallback: string) => {
  const text = typeof rawMessage === "string" ? rawMessage.trim() : "";
  const lower = text.toLowerCase();

  if (!text) return fallback;
  if (/expired|expiry|timed?\s?out/.test(lower))
    return "This reset code has expired. Please request a new one.";
  if (/invalid|incorrect|wrong|mismatch|not match/.test(lower))
    return "The reset code is incorrect. Please double-check and try again.";
  if (/too many|rate limit|limit reached|429/.test(lower))
    return "Too many attempts. Please wait a minute before trying again.";
  if (/not found|no otp|no record/.test(lower))
    return "We couldn't find an active reset code for this email. Please request a new one.";
  if (/network|failed to fetch|timeout/.test(lower))
    return "Network issue. Check your connection and try again.";
  return text;
};

export default function ResetPasswordForm({ email, otpSent = false }: { email: string; otpSent?: boolean }) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      otp: "",
      password: "",
      confirmPassword: "",
    },

    onSubmit: async ({ value }) => {
      const validation = resetPasswordSchema.safeParse(value);
      if (!validation.success) {
        const fields = validation.error.flatten().fieldErrors;
        const firstError =
          fields.password?.[0] ||
          fields.confirmPassword?.[0] ||
          "Please check your reset details.";
        toast.error(firstError);
        return;
      }

      let res: any;

      try {
        res = await resetPasswordService({
          email,
          otp: value.otp,
          password: value.password,
        });
      } catch (error: any) {
        const raw = error?.response?.data?.message || error?.message;
        toast.error(friendlyOtpMessage(raw, "Couldn't reset your password right now. Please try again."));
        return;
      }

      if (!res.success) {
        toast.error(friendlyOtpMessage(res.message, "Couldn't reset your password right now. Please try again."));
        return;
      }

      toast.success("Password updated successfully");
      form.reset();

      setTimeout(() => {
        router.replace("/login?passwordReset=true");
        router.refresh();
      }, 1200);
    },
  });

  return (
    <Card className="mx-auto w-full max-w-md shadow-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
        <CardDescription>
          Enter the OTP sent to <span className="font-medium text-foreground">{email}</span> and choose a new password.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {otpSent ? (
          <Alert className="mb-4 border-blue-200 bg-blue-50 text-blue-800">
            <AlertDescription>
              OTP has been sent successfully. Check your email and complete the reset below.
            </AlertDescription>
          </Alert>
        ) : null}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-5"
        >
          <form.Field name="otp">
            {(field) => (
              <div>
                <Input
                  type="text"
                  placeholder="Enter OTP"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors && (
                  <p className="text-red-500 text-sm">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <div>
                <Input
                  type="password"
                  placeholder="New Password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors && (
                  <p className="text-red-500 text-sm">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => (
              <div>
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors && (
                  <p className="text-red-500 text-sm">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <Button type="submit" className="w-full">
            Reset Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}