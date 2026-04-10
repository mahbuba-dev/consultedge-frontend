"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";

import AppField from "@/components/form/AppField";
import AppSubmitButton from "@/components/form/AppSubmitButton";
import { createIndustry } from "@/src/services/industry.services";

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };

    return (
      maybeError.response?.data?.message ??
      maybeError.message ??
      "Failed to create industry"
    );
  }

  return "Failed to create industry";
};

export default function IndustryCreateForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    onSubmit: async ({ value }) => {
      const fd = new FormData();
      fd.append("name", value.name);
      fd.append("description", value.description);
      if (file) fd.append("file", file);

      try {
        const res = await createIndustry(fd);

        if (!res?.success) {
          const message = res?.message || "Failed to create industry";
          toast.error(message, {
            description: "Please review the details and try again.",
          });
          return;
        }

        const industryName = value.name.trim() || "Your new industry";

        toast.success("Industry created successfully ✨", {
          description: `${industryName} is now ready to manage from the dashboard.`,
        });

        form.reset();
        setFile(null);
        router.push("/admin/dashboard/industries-management");
        router.refresh();
      } catch (error: unknown) {
        toast.error(getErrorMessage(error), {
          description: "The industry could not be created right now.",
        });
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
      className="mx-auto max-w-lg space-y-6"
    >
      <form.Field name="name">
        {(field) => (
          <AppField
            field={field}
            label="Industry Name"
            placeholder="e.g. Cybersecurity"
          />
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <AppField
            field={field}
            label="Description"
            placeholder="Short description"
          />
        )}
      </form.Field>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Icon</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border rounded p-2 w-full"
        />
      </div>

      <AppSubmitButton isPending={form.state.isSubmitting}>
        Create Industry
      </AppSubmitButton>
    </form>
  );
}
