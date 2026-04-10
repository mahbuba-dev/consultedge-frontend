"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { changePasswordService } from "@/src/services/auth.services";
import { changePasswordSchema } from "@/src/zod/changePassword.validation";

export default function ChangePasswordForm() {
  const router = useRouter();
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = changePasswordSchema.safeParse(value);
        if (!result.success) {
          return result.error.flatten().fieldErrors;
        }
        return {};
      },
    },
    onSubmit: async ({ value }) => {
      setSubmitMessage(null);

      try {
        const res = await changePasswordService({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
        });

        if (!res.success) {
          const message = res.message || "Failed to change password";
          setSubmitMessage(message);
          toast.error(message);
          return;
        }

        const message = res.message || "Password changed successfully";
        setSubmitMessage(message);
        toast.success(message);
        form.reset();

        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1200);
      } catch (error: any) {
        const message = error?.message || "Failed to change password";
        setSubmitMessage(message);
        toast.error(message);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-5"
    >
      {submitMessage && (
        <Alert>
          <AlertDescription>{submitMessage}</AlertDescription>
        </Alert>
      )}

      <form.Field name="currentPassword">
        {(field) => (
          <div>
            <Input
              type="password"
              placeholder="Current Password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors?.[0] && (
              <p className="text-sm text-red-500">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="newPassword">
        {(field) => (
          <div>
            <Input
              type="password"
              placeholder="New Password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors?.[0] && (
              <p className="text-sm text-red-500">{String(field.state.meta.errors[0])}</p>
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
            />
            {field.state.meta.errors?.[0] && (
              <p className="text-sm text-red-500">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.isSubmitting] as const}>
        {([isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Changing Password..." : "Change Password"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}