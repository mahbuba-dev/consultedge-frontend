"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, RefreshCw, CheckCircle2, ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { applyExpertAction } from "@/src/services/expert.services";
import { getAllIndustries } from "@/src/services/industry.services";
import { aiChatOpenAIFallback } from "@/src/services/ai.service";
import { getMe } from "@/src/services/auth.services";
import { createNotification } from "@/src/services/notification.service";
import { getUsers } from "@/src/services/user.services";
import type { IIndustry, IIndustryListResponse } from "@/src/types/industry.types";

// ─── fee ranges used for AI price suggestion (fallback heuristics) ───────────
const FEE_HINTS: Record<string, { min: number; max: number; mid: number }> = {
  default: { min: 80, max: 200, mid: 120 },
  finance: { min: 150, max: 400, mid: 250 },
  legal: { min: 200, max: 500, mid: 300 },
  tech: { min: 100, max: 300, mid: 180 },
  marketing: { min: 80, max: 250, mid: 150 },
  healthcare: { min: 120, max: 350, mid: 200 },
  hr: { min: 80, max: 200, mid: 120 },
  strategy: { min: 150, max: 450, mid: 250 },
};

function feeHintForIndustry(name: string): { min: number; max: number; mid: number } {
  const lower = name.toLowerCase();
  for (const [key, range] of Object.entries(FEE_HINTS)) {
    if (key !== "default" && lower.includes(key)) return range;
  }
  return FEE_HINTS.default;
}

// ─── main component ───────────────────────────────────────────────────────────
export default function ApplyExpertForm() {
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<string>("");
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [resuggestFeedback, setResuggestFeedback] = useState("");
  const [showResuggest, setShowResuggest] = useState(false);
  const [submitSuccessOpen, setSubmitSuccessOpen] = useState(false);
  // tracks which fields were set by AI so we can show badges
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());
  // whether the industry-triggered AI suggestion has run for the current choice
  const lastAiIndustryId = useRef<string>("");
  const resuggestInputRef = useRef<HTMLInputElement | null>(null);

  // ── submit mutation ──────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: applyExpertAction,
    onSuccess: async () => {
      // The success dialog IS the success message. Avoid stacking sonner
      // toasts on top of it (previously fired success + debug + AI toasts).
      try {
        const admins = await getUsers({ role: "ADMIN", limit: 100 });
        await Promise.all(
          admins
            .map((admin) => admin.userId || admin.id)
            .filter(Boolean)
            .map((adminUserId) =>
              createNotification({
                type: "EXPERT_APPLICATION",
                userId: adminUserId,
                message: `New expert application submitted by ${form.state.values.fullName || "a candidate"}.`,
              }),
            ),
        );
      } catch {
        // Submission should remain successful even if notifications fail.
      }

      // Open the confirmation dialog. Do NOT auto-redirect — the user must
      // click "Go to homepage" / Contact / Terms themselves.
      setSubmitSuccessOpen(true);
    },
    onError: (err: any) => {
      const backendMessage = err?.response?.data?.message;
      const normalizedMessage = Array.isArray(backendMessage)
        ? backendMessage.join(", ")
        : typeof backendMessage === "string"
          ? backendMessage
          : err?.message;

      toast.error(normalizedMessage || "Failed to apply");
    },
  });

  // ── fetch current user profile to pre-fill name + email ─────────────────
  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // ── industries list ──────────────────────────────────────────────────────
  const {
    data: industriesResponse,
    isLoading: isIndustriesLoading,
    isError: isIndustriesError,
  } = useQuery<IIndustryListResponse>({
    queryKey: ["industries", "options"],
    queryFn: getAllIndustries,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnMount: true,
  });

  const industries: IIndustry[] = Array.isArray(industriesResponse?.data)
    ? industriesResponse.data
    : [];

  // ── form ─────────────────────────────────────────────────────────────────
  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      bio: "",
      title: "",
      experience: 0,
      consultationFee: 0,
      industryId: "",
    },
    onSubmit: ({ value }) => {
      const fullName = value.fullName.trim();
      const email = value.email.trim();
      const phone = value.phone.trim();
      const bio = value.bio.trim();
      const title = value.title.trim();
      const industryId = value.industryId;
      const experience = Number(value.experience ?? 0);
      const consultationFee = Number(value.consultationFee ?? 0);

      if (!fullName) {
        toast.error("Full name is required.");
        return;
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error("Please enter a valid email address.");
        return;
      }

      if (!industryId) {
        toast.error("Please select an industry.");
        return;
      }

      if (experience < 0) {
        toast.error("Experience cannot be negative.");
        return;
      }

      if (consultationFee <= 0) {
        toast.error("Consultation fee must be greater than 0.");
        return;
      }

      const selectedIndustry = industries.find((ind) => ind.id === industryId);

      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("bio", bio);
      formData.append("title", title);
      formData.append("experience", String(experience));
      formData.append("consultationFee", String(consultationFee));
      // Backend has been observed to reject with "Industry is required" when only
      // `industryId` is sent. Send the *ID* under every plausible key so any
      // schema (Zod/express-validator/Mongoose) on the server side accepts it.
      formData.append("industryId", industryId);
      formData.append("industry", industryId);
      formData.append("industry_id", industryId);
      // The human-readable name is sent under a separate key to avoid colliding
      // with the ID-based fields above.
      if (selectedIndustry?.name) {
        formData.append("industryName", selectedIndustry.name);
      }
      if (profilePhoto) {
        formData.append("profilePhoto", profilePhoto);
      }
      if (resume) {
        formData.append("resume", resume);
      }

      mutation.mutate(formData);
    },
  });

  const analyzeResumeWithAI = async (file: File) => {
    setIsAnalyzingResume(true);
    setResumeAnalysis("");

    try {
      const reply = await aiChatOpenAIFallback({
        context: "expert-apply-resume-review",
        message: [
          "You are an expert reviewer for consulting applications.",
          `Evaluate this resume metadata and rate it as Strong or Weak with 2 concise reasons.`,
          `File name: ${file.name}`,
          `File type: ${file.type || "unknown"}`,
          `File size KB: ${Math.max(1, Math.round(file.size / 1024))}`,
          `Expert title: ${form.state.values.title || "not provided"}`,
          `Industry id: ${form.state.values.industryId || "not provided"}`,
          `Experience years: ${form.state.values.experience || 0}`,
          "Return format: Rating: Strong/Weak. Reasons: ...",
        ].join("\n"),
      });

      setResumeAnalysis(reply.reply || "Rating unavailable.");
    } catch {
      setResumeAnalysis("Rating: Weak. Reasons: AI review is unavailable right now, but your resume is attached successfully.");
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  // ── pre-fill name + email once user data arrives ─────────────────────────
  useEffect(() => {
    if (!meData) return;
    const userName = meData.client?.fullName || meData.name || "";
    const userEmail = meData.email || "";
    if (userName && !form.state.values.fullName) {
      form.setFieldValue("fullName", userName);
      setAiFilledFields((prev) => new Set([...prev, "fullName"]));
    }
    if (userEmail && !form.state.values.email) {
      form.setFieldValue("email", userEmail);
      setAiFilledFields((prev) => new Set([...prev, "email"]));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meData]);

  // ── core AI helper (direct OpenAI — bypasses unreliable aiSummary) ──────────
  const runAISuggest = async (industry: IIndustry, feedback?: string) => {
    const feeRange = feeHintForIndustry(industry.name);

    const prompt = feedback?.trim()
      ? [
          `You are an expert profile writer for a consulting platform.`,
          `Write a professional profile for a "${industry.name}" expert. The user gave this feedback: "${feedback.trim()}".`,
          `Return ONLY this exact format with no extra text:`,
          `TITLE: <specific expert title, e.g. "Senior E-Commerce Strategy Consultant">`,
          `BIO: <2-3 sentence professional bio in first person>`,
          `FEE: <suggested hourly USD rate as a plain number>`,
        ].join("\n")
      : [
          `You are an expert profile writer for a consulting platform.`,
          `Write a professional profile for a "${industry.name}" expert.`,
          `Return ONLY this exact format with no extra text:`,
          `TITLE: <specific expert title, e.g. "Senior E-Commerce Strategy Consultant">`,
          `BIO: <2-3 sentence professional bio in first person>`,
          `FEE: <suggested hourly USD rate as a plain number>`,
        ].join("\n");

    const response = await aiChatOpenAIFallback({
      context: "expert-apply-profile-suggestion",
      message: prompt,
    });

    return { response, feeRange };
  };

  // ── apply structured AI response to form ─────────────────────────────────
  const applyOpenAIResult = (
    response: Awaited<ReturnType<typeof aiChatOpenAIFallback>>,
    industry: IIndustry,
    feeRange: { min: number; max: number; mid: number },
    forceOverwrite = false,
  ) => {
    const text = response.reply ?? "";
    const values = form.state.values;
    const filled = new Set(aiFilledFields);

    const titleMatch = text.match(/TITLE:\s*(.+)/i);
    const bioMatch = text.match(/BIO:\s*([\s\S]+?)(?:\nFEE:|$)/i);
    const feeMatch = text.match(/FEE:\s*(\d+)/i);

    const generatedTitle =
      titleMatch?.[1]?.trim() ||
      `${industry.name} Consultant`;

    const generatedBio =
      bioMatch?.[1]?.trim() ||
      `I am a seasoned ${industry.name} professional helping clients achieve measurable outcomes. My expertise spans strategic planning, execution, and hands-on advisory across various ${industry.name.toLowerCase()} domains. I bring a client-first approach to every engagement.`;

    const generatedFee = feeMatch?.[1] ? Number(feeMatch[1]) : feeRange.mid;

    if (forceOverwrite || !values.title.trim()) {
      form.setFieldValue("title", generatedTitle);
      filled.add("title");
    }
    if (forceOverwrite || !values.bio.trim()) {
      form.setFieldValue("bio", generatedBio);
      filled.add("bio");
    }
    if (forceOverwrite || (values.consultationFee ?? 0) <= 0) {
      form.setFieldValue("consultationFee", generatedFee);
      filled.add("consultationFee");
    }

    setAiFilledFields(filled);
    setShowResuggest(false);
    setResuggestFeedback("");
  };

  // ── mutation: triggered on industry change ────────────────────────────────
  const aiIndustryMutation = useMutation({
    mutationFn: async (industry: IIndustry) => {
      const { response, feeRange } = await runAISuggest(industry);
      return { response, feeRange, industry };
    },
    onSuccess: ({ response, feeRange, industry }) => {
      applyOpenAIResult(response, industry, feeRange, false);
      toast.success(`AI suggestions generated for ${industry.name}.`);
    },
    onError: () => {
      toast.error("AI could not generate suggestions right now.");
    },
  });

  // ── mutation: re-suggest with user feedback ───────────────────────────────
  const aiResuggestMutation = useMutation({
    mutationFn: async () => {
      const values = form.state.values;
      const industry = industries.find((ind) => ind.id === values.industryId);
      if (!industry) throw new Error("Please select an industry first.");
      const { response, feeRange } = await runAISuggest(industry, resuggestFeedback);
      return { response, feeRange, industry };
    },
    onSuccess: ({ response, feeRange, industry }) => {
      applyOpenAIResult(response, industry, feeRange, true);
      toast.success("AI has generated new suggestions based on your feedback.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Could not re-generate AI suggestions.");
    },
  });

  const isAILoading = aiIndustryMutation.isPending || aiResuggestMutation.isPending;
  const hasAISuggestions = aiFilledFields.has("title") || aiFilledFields.has("bio");
  const resumeRating: "STRONG" | "WEAK" | null = /rating\s*:\s*strong/i.test(resumeAnalysis)
    ? "STRONG"
    : /rating\s*:\s*weak/i.test(resumeAnalysis)
      ? "WEAK"
      : null;

  const resumeReasonsText = resumeAnalysis.match(/reasons?\s*:\s*([\s\S]+)/i)?.[1] ?? "";
  const resumeReasons = resumeReasonsText
    .split(/\n|;|\.|•|-/)
    .map((item) => item.replace(/^\d+[.)]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 4);

  const handleResuggestToggle = () => {
    if (aiResuggestMutation.isPending) {
      return;
    }

    if (!showResuggest) {
      setShowResuggest(true);
      setTimeout(() => {
        resuggestInputRef.current?.focus();
      }, 0);
      return;
    }

    if (!resuggestFeedback.trim()) {
      aiResuggestMutation.mutate();
      return;
    }

    setShowResuggest(false);
  };

  return (
    <>
    <Card className="max-w-2xl mx-auto shadow-sm border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Apply as an Expert
          <Badge className="gap-1 bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
            <Sparkles className="size-3" />
            {hasAISuggestions ? "AI assisted" : "AI ready"}
          </Badge>
        </CardTitle>
      </CardHeader>
       <CardDescription className="text-sm text-muted-foreground ml-4">
    Pick your industry — AI will guide you with smart suggestions for every field.
  </CardDescription>

      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* ── Name (pre-filled from account) ── */}
          <form.Field name="fullName">
            {(field) => (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  Full Name
                  {aiFilledFields.has("fullName") && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-normal text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3" /> From your account
                    </span>
                  )}
                </label>
                <Input
                  placeholder="Full Name"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    setAiFilledFields((prev) => { const s = new Set(prev); s.delete("fullName"); return s; });
                  }}
                />
              </div>
            )}
          </form.Field>

          {/* ── Email (pre-filled from account) ── */}
          <form.Field name="email">
            {(field) => (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  Email
                  {aiFilledFields.has("email") && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-normal text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3" /> From your account
                    </span>
                  )}
                </label>
                <Input
                  placeholder="Email"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    setAiFilledFields((prev) => { const s = new Set(prev); s.delete("email"); return s; });
                  }}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="phone">
            {(field) => (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  placeholder="Phone"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          {/* ── Industry — selecting this triggers AI ── */}
          <form.Field
            name="industryId"
            validators={{
              onChange: ({ value }) =>
                !value ? "Please select an industry." : undefined,
              onSubmit: ({ value }) =>
                !value ? "Please select an industry." : undefined,
            }}
          >
            {(field) => {
              const industryError = field.state.meta.errors?.[0];
              return (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Industry</label>
                <div className="relative">
                  <select
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const id = e.target.value;
                      field.handleChange(id);
                      if (id && id !== lastAiIndustryId.current) {
                        lastAiIndustryId.current = id;
                        const industry = industries.find((ind) => ind.id === id);
                        if (industry) aiIndustryMutation.mutate(industry);
                      }
                    }}
                    className="w-full appearance-none rounded-md border bg-background px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isIndustriesLoading || isIndustriesError || industries.length === 0}
                  >
                    <option value="">
                      {isIndustriesLoading
                        ? "Loading industries..."
                        : isIndustriesError
                          ? "Failed to load industries"
                          : industries.length === 0
                            ? "No industries available"
                            : "Select Industry — AI will suggest your profile"}
                    </option>
                    {industries.map((ind) => (
                      <option key={ind.id} value={ind.id}>
                        {ind.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                {industryError && !isIndustriesError && (
                  <p className="text-sm text-red-500">{String(industryError)}</p>
                )}
                {isIndustriesError && (
                  <p className="text-sm text-red-500">
                    Could not load industries right now. Please refresh.
                  </p>
                )}
                {isAILoading && (
                  <p className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                    <Sparkles className="size-3 animate-pulse" />
                    AI is generating suggestions for this industry…
                  </p>
                )}
              </div>
              );
            }}
          </form.Field>

          {/* ── Title (AI suggested) ── */}
          <form.Field name="title">
            {(field) => (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  Expert Title
                  {aiFilledFields.has("title") && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-normal text-blue-600 dark:text-blue-400">
                      <Sparkles className="size-3" /> AI suggested
                    </span>
                  )}
                </label>
                <Input
                  placeholder="e.g. Senior Finance Consultant"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    setAiFilledFields((prev) => { const s = new Set(prev); s.delete("title"); return s; });
                  }}
                />
              </div>
            )}
          </form.Field>

          {/* ── Bio (AI suggested) ── */}
          <form.Field name="bio">
            {(field) => (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  Bio
                  {aiFilledFields.has("bio") && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-normal text-blue-600 dark:text-blue-400">
                      <Sparkles className="size-3" /> AI suggested
                    </span>
                  )}
                </label>
                <Textarea
                  placeholder="Short professional bio"
                  rows={4}
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    setAiFilledFields((prev) => { const s = new Set(prev); s.delete("bio"); return s; });
                  }}
                />
              </div>
            )}
          </form.Field>

          {/* ── Re-suggest panel ─ shown after initial AI fill ── */}
          <AnimatePresence>
            {hasAISuggestions && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border border-blue-200/80 bg-blue-50/60 p-3 dark:border-blue-500/20 dark:bg-blue-500/8"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Not happy with the AI suggestion?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResuggestToggle}
                  disabled={aiResuggestMutation.isPending}
                  className="mb-1 text-xs text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300"
                >
                  {showResuggest
                    ? aiResuggestMutation.isPending
                      ? "Re-generating..."
                      : "Re-generate now"
                    : "Give feedback and re-suggest"}
                </button>

                <AnimatePresence>
                  {showResuggest && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <Input
                          ref={resuggestInputRef}
                          value={resuggestFeedback}
                          onChange={(e) => setResuggestFeedback(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (!aiResuggestMutation.isPending) {
                                aiResuggestMutation.mutate();
                              }
                            }
                          }}
                          placeholder='e.g. "Make the bio shorter" or "Focus on startup consulting"'
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={aiResuggestMutation.isPending}
                          onClick={() => aiResuggestMutation.mutate()}
                          className="shrink-0 gap-1.5"
                        >
                          <RefreshCw className={`size-3.5 ${aiResuggestMutation.isPending ? "animate-spin" : ""}`} />
                          {aiResuggestMutation.isPending ? "Re-generating…" : "Re-suggest"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <form.Field name="experience">
            {(field) => (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Years of Experience</label>
                <Input
                  type="number"
                  placeholder="e.g. 8"
                  value={field.state.value === 0 ? "" : field.state.value}
                  onChange={(e) =>
                    field.handleChange(e.target.value === "" ? 0 : Number(e.target.value))
                  }
                />
              </div>
            )}
          </form.Field>

          {/* ── Consultation Fee (AI suggested) ── */}
          <form.Field name="consultationFee">
            {(field) => (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  Consultation Fee ($/hr)
                  {aiFilledFields.has("consultationFee") && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-normal text-blue-600 dark:text-blue-400">
                      <Sparkles className="size-3" /> AI suggested
                    </span>
                  )}
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 150"
                  value={field.state.value === 0 ? "" : field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value === "" ? 0 : Number(e.target.value));
                    setAiFilledFields((prev) => { const s = new Set(prev); s.delete("consultationFee"); return s; });
                  }}
                />
              </div>
            )}
          </form.Field>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Profile Picture</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
              className="h-auto py-2"
            />
            {profilePhoto && (
              <p className="text-xs text-muted-foreground">
                Selected: {profilePhoto.name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Resume / CV
              <span className="ml-1 text-xs font-normal text-muted-foreground">(PDF, DOC, DOCX — optional)</span>
            </label>
            <Input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setResume(file);
                if (file) {
                  void analyzeResumeWithAI(file);
                } else {
                  setResumeAnalysis("");
                }
              }}
              className="h-auto py-2"
            />
            {resume && (
              <p className="text-xs text-muted-foreground">
                Selected: {resume.name}
              </p>
            )}
            {isAnalyzingResume && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                AI is analyzing your resume strength...
              </p>
            )}
            {!isAnalyzingResume && resumeAnalysis && (
              <div className="rounded-md border border-blue-200/70 bg-blue-50/60 px-2.5 py-2 text-xs text-blue-800 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-200">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="font-semibold">AI Resume Review</span>
                  {resumeRating && (
                    <span
                      className={
                        resumeRating === "STRONG"
                          ? "rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : "rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-300"
                      }
                    >
                      {resumeRating === "STRONG" ? "Strong" : "Weak"}
                    </span>
                  )}
                </div>

                {resumeReasons.length > 0 ? (
                  <ul className="list-disc space-y-1 pl-4 text-xs">
                    {resumeReasons.map((reason, index) => (
                      <li key={`${reason}-${index}`}>{reason}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs">{resumeAnalysis}</p>
                )}
              </div>
            )}
          </div>

          <form.Subscribe selector={(state) => state.values.industryId}>
            {(industryId) => (
              <Button
                type="submit"
                disabled={mutation.isPending || isIndustriesLoading || !industryId}
                className="w-full"
              >
                {mutation.isPending ? "Submitting…" : "Submit Application"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
    <Dialog
      open={submitSuccessOpen}
      onOpenChange={(open) => {
        // No auto-redirect — let the user choose Home / Terms / Contact.
        setSubmitSuccessOpen(open);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-5" />
            Expert application submitted
          </DialogTitle>
          <DialogDescription className="pt-1 text-sm leading-relaxed">
            You have successfully submitted your application as an expert. Our admin team will review your
            form shortly. Once approved, we will notify you by email and you will be able to access your
            expert dashboard.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSubmitSuccessOpen(false);
              window.location.href = "/contact";
            }}
          >
            Contact us
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSubmitSuccessOpen(false);
              window.location.href = "/terms";
            }}
          >
            Terms
          </Button>
          <Button
            type="button"
            onClick={() => {
              setSubmitSuccessOpen(false);
              window.location.href = "/";
            }}
          >
            Go to homepage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
