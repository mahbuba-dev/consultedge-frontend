"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquareText,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Zap,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SmartAutofillBanner from "@/components/AI/SmartAutofillBanner";
import { rememberAutofill } from "@/src/lib/autofillStore";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const contactInfoItems = [
  {
    icon: Mail,
    label: "Email us",
    value: "hello@consultedge.com",
    sub: "We reply within 24 hours",
    href: "mailto:hello@consultedge.com",
    accent: "from-blue-500 to-cyan-500",
  },
  {
    icon: Phone,
    label: "Call us",
    value: "+1 (800) 123-4567",
    sub: "Mon – Fri, 9 am – 6 pm EST",
    href: "tel:+18001234567",
    accent: "from-cyan-500 to-teal-500",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    value: "New York, NY 10001",
    sub: "United States",
    href: "https://maps.google.com",
    accent: "from-sky-500 to-blue-500",
  },
  {
    icon: Clock,
    label: "Support hours",
    value: "24 / 7 live chat",
    sub: "AI support always available",
    href: null,
    accent: "from-emerald-500 to-cyan-500",
  },
];

const promises = [
  { icon: Zap, text: "Response in under 24h" },
  { icon: ShieldCheck, text: "Your data stays private" },
  { icon: MessageCircle, text: "Real humans, not bots" },
];

const faqs = [
  {
    q: "How do I book an expert session?",
    a: "Browse our expert directory, choose a specialist, pick an available slot, and confirm your booking in one click.",
  },
  {
    q: "Can I reschedule or cancel a booking?",
    a: "Yes. Open your dashboard, navigate to bookings, and use the reschedule or cancel option up to 24 hours before your session.",
  },
  {
    q: "How are payments handled?",
    a: "All payments are processed securely through our payment gateway. You'll receive an invoice immediately after booking.",
  },
];

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const INITIAL_FORM: FormState = { name: "", email: "", subject: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    rememberAutofill({ name: form.name, email: form.email });
    setLoading(false);
    setSent(true);
    setForm(INITIAL_FORM);
    toast.success("Message sent! We'll get back to you within 24 hours.");
  }

  return (
    <div className="space-y-16 pb-16">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-linear-to-br from-slate-950 via-blue-950 to-cyan-900 px-6 py-10 text-center text-white shadow-[0_40px_100px_-30px_rgba(34,211,238,0.4)] md:px-12 md:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-blue-500/30 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -right-16 size-72 rounded-full bg-cyan-400/30 blur-[90px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_60%)]"
        />

        <div className="relative mx-auto max-w-2xl space-y-5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-cyan-200 backdrop-blur">
            <MessageSquareText className="size-3" />
            We&apos;d love to hear from you
          </span>

          <h1 className="text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">
            Let&apos;s start a{" "}
            <span className="bg-linear-to-r from-cyan-300 via-sky-300 to-blue-300 bg-clip-text text-transparent">
              conversation
            </span>
          </h1>

          <p className="mx-auto max-w-lg text-sm text-white/70 md:text-base">
            Whether you have a question, feedback, or a partnership idea — drop us a line and the
            right person will get back to you fast.
          </p>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-2 text-xs text-white/70">
            {promises.map(({ icon: Icon, text }) => (
              <span key={text} className="inline-flex items-center gap-1.5">
                <Icon className="size-3.5 text-cyan-300" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Info cards + Form ────────────────────────────────────── */}
      <section className="grid gap-8 lg:grid-cols-[1fr_1.55fr]">
        {/* Contact info */}
        <div className="space-y-5">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
              Contact details
            </p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Reach us anytime
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Multiple ways to connect — pick what works best for you.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {contactInfoItems.map(({ icon: Icon, label, value, sub, href, accent }) => {
              const cardBody = (
                <>
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${accent} text-white shadow-md shadow-cyan-500/20`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {label}
                    </p>
                    <p className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-cyan-300">
                      {value}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
                  </div>
                </>
              );

              const baseClass =
                "group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-cyan-400/30";

              return href ? (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className={baseClass}
                >
                  {cardBody}
                </a>
              ) : (
                <div key={label} className={baseClass}>
                  {cardBody}
                </div>
              );
            })}
          </div>

          {/* Sparkle CTA block */}
          <div className="relative overflow-hidden rounded-2xl border border-blue-200/60 bg-linear-to-br from-blue-50 via-white to-cyan-50 p-5 dark:border-cyan-400/20 dark:from-blue-950/40 dark:via-slate-900/60 dark:to-cyan-950/40">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-cyan-400/20 blur-2xl"
            />
            <div className="relative">
              <div className="flex items-center gap-2 text-blue-700 dark:text-cyan-300">
                <Search className="size-4" />
                <span className="text-sm font-semibold">Looking for an expert?</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Browse our vetted specialists and book a session in minutes.
              </p>
              <Button
                asChild
                size="sm"
                className="mt-3 rounded-full bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25 hover:from-blue-700 hover:to-cyan-600"
              >
                <Link href="/experts">
                  Browse experts
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-[28px] bg-linear-to-br from-blue-500/30 via-cyan-500/20 to-transparent opacity-0 blur transition-opacity duration-500 dark:opacity-100"
          />
          <div className="relative rounded-[28px] border border-slate-200/70 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70 md:p-10">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-cyan-500 text-white shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="size-8" />
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Message sent!
                </h3>
                <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
                  Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 rounded-full"
                  onClick={() => setSent(false)}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <SmartAutofillBanner
                  fields={["name", "email"]}
                  onApply={(values) => {
                    if (values.name) handleChange("name", values.name);
                    if (values.email) handleChange("email", values.email);
                  }}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25">
                      <Send className="size-4" />
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Send a message
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    We&apos;ll respond to every inquiry personally.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-name" className="text-slate-700 dark:text-slate-300">
                      Full name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="contact-name"
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="rounded-xl border-slate-200 bg-slate-50/80 focus-visible:ring-cyan-500 dark:border-white/10 dark:bg-slate-950/60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email" className="text-slate-700 dark:text-slate-300">
                      Email address <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="rounded-xl border-slate-200 bg-slate-50/80 focus-visible:ring-cyan-500 dark:border-white/10 dark:bg-slate-950/60"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-subject" className="text-slate-700 dark:text-slate-300">
                    Subject
                  </Label>
                  <Input
                    id="contact-subject"
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    className="rounded-xl border-slate-200 bg-slate-50/80 focus-visible:ring-cyan-500 dark:border-white/10 dark:bg-slate-950/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-message" className="text-slate-700 dark:text-slate-300">
                    Message <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    id="contact-message"
                    placeholder="Tell us what's on your mind..."
                    rows={5}
                    value={form.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    className="resize-none rounded-xl border-slate-200 bg-slate-50/80 focus-visible:ring-cyan-500 dark:border-white/10 dark:bg-slate-950/60"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-linear-to-r from-blue-600 via-cyan-500 to-sky-500 py-5 text-sm font-semibold text-white shadow-md shadow-cyan-500/30 transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? (
                    "Sending…"
                  ) : (
                    <>
                      Send message
                      <Send className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="space-y-8">
        <div className="space-y-1 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
            FAQ
          </p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Common questions
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {faqs.map(({ q, a }, i) => (
            <div
              key={q}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60"
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-blue-500 via-cyan-500 to-sky-500 opacity-60" />
              <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <span className="inline-flex size-6 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-cyan-500 text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                {q}
              </p>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
