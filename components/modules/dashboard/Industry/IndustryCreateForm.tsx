"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { ImagePlus, Sparkles, Trash2, Wand2 } from "lucide-react";

import AppField from "@/components/form/AppField";
import AppSubmitButton from "@/components/form/AppSubmitButton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { aiIndustryCreation } from "@/src/services/ai.service";
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const handleFileChange = (selected: File | null) => {
    setFile(selected);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  };

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      shortTagline: "",
      idealExpertTypesText: "",
      commonUseCasesText: "",
    },
    onSubmit: async ({ value }) => {
      const fd = new FormData();
      fd.append("name", value.name);
      fd.append("description", value.description);
      if (value.shortTagline.trim()) {
        fd.append("shortTagline", value.shortTagline.trim());
      }

      const idealExpertTypes = value.idealExpertTypesText
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);

      const commonUseCases = value.commonUseCasesText
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);

      if (idealExpertTypes.length > 0) {
        fd.append("idealExpertTypes", JSON.stringify(idealExpertTypes));
      }

      if (commonUseCases.length > 0) {
        fd.append("commonUseCases", JSON.stringify(commonUseCases));
      }

      if (file) fd.append("file", file);

      try {
        const res = await createIndustry(fd);

        if (!res?.success) {
          toast.error(res?.message || "Failed to create industry", {
            description: "Please review the details and try again.",
          });
          return;
        }
        const industryName = value.name.trim() || "Your new industry";

        toast.success("Industry created successfully", {
          description: `${industryName} is now ready to manage from the dashboard.`,
        });

        form.reset();
        handleFileChange(null);
        router.push("/admin/dashboard/industries-management");
        router.refresh();
      } catch (error: unknown) {
        toast.error(getErrorMessage(error), {
          description: "The industry could not be created right now.",
        });
      }
    },
  });

  const handleGenerateWithAI = async () => {
    const industryName = form.state.values.name.trim();

    if (industryName.length < 2) {
      setGenerateError("Enter an industry name first to generate AI content.");
      return;
    }

    setGenerateError(null);
    setIsGenerating(true);

    try {
      const response = await aiIndustryCreation({ industryName });

      if (response.error) {
        setGenerateError(response.error.message || "AI generation failed.");
      }

      const payload = response.data;
      form.setFieldValue("name", payload.industryName || industryName);
      form.setFieldValue("description", payload.industryDescription || "");
      form.setFieldValue("shortTagline", payload.shortTagline || "");
      form.setFieldValue("idealExpertTypesText", (payload.idealExpertTypes || []).join("\n"));
      form.setFieldValue("commonUseCasesText", (payload.commonUseCases || []).join("\n"));

      if (!response.error) {
        toast.success("Industry draft generated", {
          description: "AI drafted a professional profile. You can edit every field before saving.",
        });
      }
    } catch (error) {
      setGenerateError(getErrorMessage(error));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-6"
    >
      <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
        <form.Field name="name">
          {(field) => (
            <AppField
              field={field}
              label="Industry Name"
              placeholder="e.g. Cybersecurity"
            />
          )}
        </form.Field>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={handleGenerateWithAI}
            disabled={isGenerating}
            className="h-9 rounded-full bg-linear-to-r from-blue-600 to-cyan-500 px-4 text-xs font-semibold text-white hover:from-blue-700 hover:to-cyan-600"
          >
            <Wand2 className="mr-1.5 size-3.5" />
            {isGenerating ? "Generating..." : "Generate with AI"}
          </Button>
          <p className="text-xs text-muted-foreground">
            AI will draft description, tagline, expert types, and common use-cases.
          </p>
        </div>

        {generateError ? (
          <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-300">
            {generateError}
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
        <form.Field name="description">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name}>Description</Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                rows={5}
                placeholder="Short description shown to clients"
              />
            </div>
          )}
        </form.Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
          <form.Field name="shortTagline">
            {(field) => (
              <AppField
                field={field}
                label="Short Tagline"
                placeholder="One-line positioning statement"
              />
            )}
          </form.Field>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
          <form.Field name="idealExpertTypesText">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Ideal Expert Types</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={5}
                  placeholder={"Growth strategist\nCompliance specialist\nOperations lead"}
                />
              </div>
            )}
          </form.Field>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 md:col-span-2 dark:border-white/10 dark:bg-white/5">
          <form.Field name="commonUseCasesText">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Common Use-Cases</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={5}
                  placeholder={"Market entry roadmap\nAudit readiness\nOperational scaling"}
                />
              </div>
            )}
          </form.Field>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <ImagePlus className="size-4 text-blue-600 dark:text-cyan-300" />
          Industry icon
        </label>

        {previewUrl ? (
          <div className="flex items-center gap-4 rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full ring-1 ring-slate-200/70 sm:rounded-xl dark:ring-white/10">
              <Image
                src={previewUrl}
                alt="Icon preview"
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{file?.name}</p>
              <p className="text-xs text-muted-foreground">
                {file ? `${Math.round(file.size / 1024)} KB` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleFileChange(null)}
              className="inline-flex items-center gap-1 rounded-full border border-rose-200/70 bg-rose-50/70 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/15"
            >
              <Trash2 className="size-3.5" />
              Remove
            </button>
          </div>
        ) : (
          <label
            htmlFor="industry-icon"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200/70 bg-white/40 p-6 text-center transition hover:border-cyan-400/60 hover:bg-cyan-50/40 dark:border-white/10 dark:bg-white/5 dark:hover:border-cyan-500/40 dark:hover:bg-cyan-500/5"
          >
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25 sm:rounded-xl">
              <ImagePlus className="size-5" />
            </div>
            <p className="text-sm font-medium text-foreground">Click to upload an icon</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, or SVG</p>
          </label>
        )}

        <input
          id="industry-icon"
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="hidden"
        />
      </div>

      <AppSubmitButton
        isPending={form.state.isSubmitting}
        className="h-11 w-full rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25 hover:from-blue-700 hover:to-cyan-600"
      >
        <Sparkles className="mr-2 size-4" />
        Create industry
      </AppSubmitButton>
    </form>
  );
}
