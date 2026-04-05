"use client";

import { useForm } from "@tanstack/react-form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { changePasswordService } from "@/src/services/auth.services";
import { changePasswordSchema } from "@/src/zod/changePassword.validation";

export default function ChangePasswordForm() {
  const router = useRouter();

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
      const res = await changePasswordService({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success("Password changed successfully");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="space-y-5">
      <form.Field name="currentPassword">
        {(field) => (
          <div>
            <Input
              type="password"
              placeholder="Current Password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors && (
              <p className="text-red-500 text-sm">{field.state.meta.errors[0]}</p>
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
            />
            {field.state.meta.errors && (
              <p className="text-red-500 text-sm">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      <Button type="submit" className="w-full">
        Change Password
      </Button>
    </form>
  );
}