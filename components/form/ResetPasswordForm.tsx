/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/auth/ResetPasswordForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordZodSchema, IResetPasswordPayload } from "@/src/zod/resetPassword.validation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

import { toast } from "sonner"; // or your toast hook
import { getPasswordStrength } from "@/lib/passwordStrength";

export default function ResetPasswordForm({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong">("weak");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<IResetPasswordPayload>({
    resolver: zodResolver(resetPasswordZodSchema),
    defaultValues: {
      email,
      token,
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");

  const onSubmit = async (data: IResetPasswordPayload) => {
    console.log('submitting', data);
  try {
    const res = await fetch("/api/v1/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        otp: data.token,
        newPassword: data.password,
      }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      toast.error(json.message || "Failed to reset password");
      return;
    }

    toast.success("Password reset successfully");
    router.push("/");
  } catch (error: any) {
    toast.error(error?.message || "Something went wrong");
  }
};

  const strength = getPasswordStrength(passwordValue || "");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-4 border p-6 rounded-lg shadow bg-white"
    >
      <h2 className="text-xl font-semibold text-center">Reset Password</h2>

      <p className="text-sm text-gray-600 text-center">
        Resetting password for <span className="font-medium">{email}</span>
      </p>

      {/* Hidden fields */}
      <input type="hidden" {...register("email")} />
      <input type="hidden" {...register("token")} />

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password">New Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            onChange={(e) => {
              const value = e.target.value;
              setPasswordStrength(getPasswordStrength(value));
              // still let RHF handle it
              (register("password").onChange as any)(e);
            }}
            className="pr-10"
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}

        {/* Strength meter */}
        <div className="mt-1">
          <div className="h-1.5 w-full bg-gray-200 rounded">
            <div
              className={`h-1.5 rounded transition-all ${
                strength === "weak"
                  ? "w-1/3 bg-red-500"
                  : strength === "medium"
                  ? "w-2/3 bg-yellow-500"
                  : "w-full bg-green-500"
              }`}
            />
          </div>
          <p className="text-xs mt-1 text-gray-600">
            Strength:{" "}
            <span
              className={
                strength === "weak"
                  ? "text-red-500"
                  : strength === "medium"
                  ? "text-yellow-600"
                  : "text-green-600"
              }
            >
              {strength.toUpperCase()}
            </span>
          </p>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            {...register("confirmPassword")}
            className="pr-10"
            placeholder="Confirm new password"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
}