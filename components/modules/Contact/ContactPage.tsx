"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const contactInfoItems = [
  {
    icon: Mail,
    label: "Email us",
    value: "hello@consultedge.com",
    sub: "We reply within 24 hours",
    href: "mailto:hello@consultedge.com",
  },
  {
    icon: Phone,
    label: "Call us",
    value: "+1 (800) 123-4567",
    sub: "Mon – Fri, 9 am – 6 pm EST",
    href: "tel:+18001234567",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    value: "New York, NY 10001",
    sub: "United States",
    href: "https://maps.google.com",
  },
  {
    icon: Clock,
    label: "Support hours",
    value: "24 / 7 live chat",
    sub: "AI support always available",
    href: null,
  },
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
    // Simulate a network request — swap for real API call when backend is ready
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
    setForm(INITIAL_FORM);
    toast.success("Message sent! We'll get back to you within 24 hours.");
  }

  return (
    <div className="space-y-16 pb-16">
      {/* ── Info cards + Form ────────────────────────────────────────── */}
      <section className="grid gap-10 lg:grid-cols-[1fr_1.55fr]">
        {/* Contact info */}
        <div className="space-y-5">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400">
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
            {contactInfoItems.map(({ icon: Icon, label, value, sub, href }) => (
              <div
                key={label}
                className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-100 to-fuchsia-100 text-violet-600 dark:from-violet-900/40 dark:to-fuchsia-900/40 dark:text-violet-400">
                  <Icon className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="block truncate text-sm font-semibold text-slate-800 transition-colors hover:text-violet-600 dark:text-slate-100 dark:hover:text-violet-400"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {value}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Sparkle CTA block */}
          <div className="rounded-2xl border border-violet-100 bg-linear-to-br from-violet-50 to-fuchsia-50 p-5 dark:border-violet-900/40 dark:from-violet-950/40 dark:to-fuchsia-950/40">
            <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
              <Sparkles className="size-4" />
              <span className="text-sm font-semibold">Looking for an expert?</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Browse our vetted specialists and book a session in minutes.
            </p>
            <Button
              asChild
              size="sm"
              className="mt-3 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-500 text-white hover:opacity-90"
            >
              <a href="/experts">
                Browse experts
                <ArrowRight className="ml-1.5 size-3.5" />
              </a>
            </Button>
          </div>
        </div>

        {/* Contact form */}
        <div className="rounded-[28px] border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-10">
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 className="size-7" />
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
                className="mt-2 rounded-xl"
                onClick={() => setSent(false)}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Send a message
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  We&apos;ll respond to every inquiry personally.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name" className="text-slate-700 dark:text-slate-300">
                    Full name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contact-name"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-violet-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email" className="text-slate-700 dark:text-slate-300">
                    Email address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-violet-500 dark:border-slate-700 dark:bg-slate-800"
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
                  className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-violet-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-message" className="text-slate-700 dark:text-slate-300">
                  Message <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="contact-message"
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  className="resize-none rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-violet-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-linear-to-r from-violet-600 via-fuchsia-500 to-sky-500 py-5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-60"
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
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="space-y-8">
        <div className="space-y-1 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400">
            FAQ
          </p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Common questions
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {faqs.map(({ q, a }) => (
            <div
              key={q}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{q}</p>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
