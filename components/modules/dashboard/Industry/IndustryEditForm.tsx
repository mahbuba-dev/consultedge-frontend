"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import AppSubmitButton from "@/components/form/AppSubmitButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getIndustryById, updateIndustry } from "@/src/services/industry.services";
import type { IIndustryUpdatePayload } from "@/src/types/industry.types";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };

    return maybeError.response?.data?.message ?? maybeError.message ?? fallback;
  }

  return fallback;
};

type IndustryEditFormProps = {
  industryId: string;
};

export default function IndustryEditForm({ industryId }: IndustryEditFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["industry", industryId],
    queryFn: () => getIndustryById(industryId),
    enabled: Boolean(industryId),
  });

  useEffect(() => {
    const industry = data?.data;
    if (!industry) return;

    setName(industry.name ?? "");
    setDescription(industry.description ?? "");
  }, [data]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Industry name is required.");
      return;
    }

    const payload: IIndustryUpdatePayload = {
      name: name.trim(),
      description: description.trim(),
      ...(file ? { file } : {}),
    };

    try {
      setIsSaving(true);
      const res = (await updateIndustry(industryId, payload)) as
        | { success?: boolean; message?: string }
        | undefined;

      if (!res?.success) {
        toast.error(res?.message || "Failed to update industry", {
          description: "Please review the details and try again.",
        });
        return;
      }

      toast.success("Industry updated successfully", {
        description: "Your changes are now live in industry management.",
      });

      router.push("/admin/dashboard/industries-management");
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update industry"), {
        description: "The industry could not be updated right now.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="mx-auto max-w-lg rounded-lg border p-4 text-sm">Loading industry...</div>;
  }

  if (isError || !data?.data) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Unable to load this industry. Please go back and try again.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="industry-name">Industry Name</Label>
        <Input
          id="industry-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Cybersecurity"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="industry-description">Description</Label>
        <Textarea
          id="industry-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description"
          rows={4}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="industry-icon">Icon (optional)</Label>
        <Input
          id="industry-icon"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <AppSubmitButton isPending={isSaving} pendingLabel="Updating...">
        Update Industry
      </AppSubmitButton>
    </form>
  );
}
