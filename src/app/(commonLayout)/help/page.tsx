import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CalendarX,
  CreditCard,
  HelpCircle,
  LifeBuoy,
  Mail,
  MessageCircle,
  Phone,
  Search,
  ShieldAlert,
  UserCheck,
  UserCog,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Help & Support | ConsultEdge",
  description:
    "Find answers to common questions about bookings, payments, expert sessions, accounts, and more. Contact our support team anytime.",
};

const faqCategories = [
  {
    id: "booking",
    icon: CalendarX,
    label: "Bookings",
    color: "from-blue-500 to-cyan-500",
    faqs: [
      {
        q: "How do I book an expert session?",
        a: "Browse our expert directory, select a specialist that matches your need, choose an available time slot, and confirm your booking. Most bookings take under 3 minutes to complete.",
      },
      {
        q: "Can I reschedule or cancel a booking?",
        a: "Yes. Open your dashboard, navigate to Bookings, and use the Reschedule or Cancel option. Changes are accepted up to 24 hours before your session start time.",
      },
      {
        q: "What happens if an expert cancels my session?",
        a: "You will receive an instant notification and an automatic full refund to your original payment method within 3–5 business days. You may also re-book with the same or a different expert.",
      },
      {
        q: "How long is a typical session?",
        a: "Sessions are available in 30-minute and 60-minute blocks. Some experts also offer extended 90-minute deep-dive sessions. Duration is shown on each expert's profile.",
      },
    ],
  },
  {
    id: "payments",
    icon: CreditCard,
    label: "Payments",
    color: "from-emerald-500 to-teal-500",
    faqs: [
      {
        q: "What payment methods are accepted?",
        a: "ConsultEdge accepts all major credit and debit cards (Visa, Mastercard, American Express), as well as UPI and net banking in supported regions.",
      },
      {
        q: "When am I charged for a session?",
        a: "Payment is processed at the time of booking confirmation. You will receive an invoice by email immediately after a successful payment.",
      },
      {
        q: "How do refunds work?",
        a: "Approved refunds (cancellations before the 24-hour window, expert no-shows) are returned to your original payment method within 3–5 business days.",
      },
      {
        q: "Are there any hidden fees?",
        a: "No. The price shown on an expert's profile is the total you pay. There are no booking fees, service charges, or hidden costs.",
      },
    ],
  },
  {
    id: "experts",
    icon: UserCheck,
    label: "Working with experts",
    color: "from-purple-500 to-indigo-500",
    faqs: [
      {
        q: "How are experts vetted on ConsultEdge?",
        a: "Every expert goes through a manual review including credential verification, reference checks, and a sample advisory assessment before they can accept bookings.",
      },
      {
        q: "What industries are covered?",
        a: "ConsultEdge covers 40+ industries including strategy, finance, technology, marketing, legal, healthcare, operations, HR, and many more. Use the Industry filter on the Experts page to browse by sector.",
      },
      {
        q: "Can I communicate with an expert before booking?",
        a: "Yes. Once you create a free account you can send an introductory message to any expert through their profile page before committing to a session.",
      },
      {
        q: "What if the session does not meet my expectations?",
        a: "Contact support within 48 hours of your session and our team will review the case. We take quality seriously and will work with you to find a resolution.",
      },
    ],
  },
  {
    id: "account",
    icon: UserCog,
    label: "Account & profile",
    color: "from-orange-500 to-amber-500",
    faqs: [
      {
        q: "How do I reset my password?",
        a: "Click Forgot password on the login screen, enter your registered email address, and follow the link we send you. The link expires after 30 minutes.",
      },
      {
        q: "Can I have both a client and an expert profile?",
        a: "Client and expert accounts are separate. If you wish to offer consultations as well as book them, please apply as an expert through the Apply as Expert page.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to Settings → Account → Delete account. All personal data is permanently removed within 30 days in accordance with our Privacy Policy.",
      },
      {
        q: "Is my personal information secure?",
        a: "Yes. All data is encrypted in transit and at rest. We do not sell or share personal information with third parties. Read our Privacy Policy for full details.",
      },
    ],
  },
  {
    id: "ai",
    icon: Bot,
    label: "AI features",
    color: "from-cyan-500 to-sky-500",
    faqs: [
      {
        q: "What does the AI assistant do?",
        a: "The ConsultEdge AI assistant can answer questions about the platform, help you find the right expert, explain how sessions work, and guide you through your bookings — all grounded in real platform data.",
      },
      {
        q: "Is the AI replacing human support?",
        a: "No. The AI handles common questions instantly, while our human support team handles complex, account-specific, or sensitive issues. You can always request a human agent.",
      },
      {
        q: "How does the personalised recommendation engine work?",
        a: "Based on your search history, viewed profiles, and booking activity, our AI ranks experts and content most relevant to your specific goals. Data is used solely to improve your experience.",
      },
    ],
  },
  {
    id: "safety",
    icon: ShieldAlert,
    label: "Safety & trust",
    color: "from-rose-500 to-pink-500",
    faqs: [
      {
        q: "What should I do if I encounter inappropriate behaviour?",
        a: "Use the Report button inside the session or booking page, or email safety@consultedge.com. All reports are reviewed within 24 hours and taken seriously.",
      },
      {
        q: "How are disputes resolved?",
        a: "Our Dispute Resolution team reviews both sides, examines session recordings (with consent), and makes a fair decision. Most disputes are resolved within 5 business days.",
      },
    ],
  },
];

const contactChannels = [
  {
    icon: Bot,
    label: "AI chat",
    description: "Instant answers, available 24/7 — powered by our AI assistant.",
    cta: "Open chat",
    href: "/ai",
    accent: "from-blue-500 to-cyan-500",
  },
  {
    icon: Mail,
    label: "Email support",
    description: "Send us a detailed message and expect a reply within 24 hours.",
    cta: "Send email",
    href: "mailto:support@consultedge.com",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    icon: Phone,
    label: "Phone",
    description: "Talk to a support agent Monday–Friday, 9 am – 6 pm EST.",
    cta: "+1 (800) 123-4567",
    href: "tel:+18001234567",
    accent: "from-orange-500 to-amber-500",
  },
  {
    icon: MessageCircle,
    label: "Contact form",
    description: "Describe your issue in detail and we'll route it to the right team.",
    cta: "Open form",
    href: "/contact",
    accent: "from-purple-500 to-indigo-500",
  },
];

export default function HelpPage() {
  return (
    <main className="relative overflow-hidden pb-20 pt-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-200 bg-[radial-gradient(circle_at_8%_12%,rgba(37,99,235,0.14),transparent_40%),radial-gradient(circle_at_92%_10%,rgba(16,185,129,0.12),transparent_40%)]"
      />

      <div className="mx-auto max-w-5xl space-y-20 px-4 md:px-6">
        {/* ── HERO ─────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[2.2rem] border border-blue-200/50 bg-linear-to-br from-slate-950 via-blue-950 to-cyan-950 px-8 py-14 text-center text-white shadow-[0_40px_100px_-30px_rgba(34,211,238,0.4)] md:px-16 md:py-20 dark:border-white/10">
          <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-blue-500/25 blur-[120px]" />
          <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-16 size-72 rounded-full bg-cyan-400/25 blur-[100px]" />

          <div className="relative mx-auto max-w-2xl space-y-5">
            <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
              <LifeBuoy className="mr-1.5 size-3.5" />
              Help centre
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              How can we{" "}
              <span className="bg-linear-to-r from-cyan-300 via-sky-300 to-blue-300 bg-clip-text text-transparent">
                help you?
              </span>
            </h1>

            <p className="text-sm text-white/75 md:text-base">
              Browse common questions below or reach out directly — our support team is always ready.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild className="h-11 rounded-full bg-white px-6 font-semibold text-slate-900 hover:bg-white/90">
                <Link href="/contact">
                  Contact support <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-full border-white/20 bg-white/10 px-6 text-white hover:bg-white/15">
                <Link href="/ai">
                  <Bot className="mr-2 size-4" />
                  Ask AI assistant
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── CONTACT CHANNELS ─────────────────────────────────────── */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Get in touch</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose the channel that works best for you.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contactChannels.map((ch) => {
              const Icon = ch.icon;
              return (
                <Link key={ch.label} href={ch.href} className="group block">
                  <Card className="h-full border-border/70 transition-shadow hover:shadow-md">
                    <CardContent className="space-y-3 p-5">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${ch.accent} text-white shadow`}
                      >
                        <Icon className="size-5" />
                      </div>
                      <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {ch.label}
                      </h3>
                      <p className="text-xs leading-relaxed text-muted-foreground">{ch.description}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                        {ch.cta} <ArrowRight className="size-3" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────── */}
        <section>
          <div className="mb-10 text-center">
            <Badge variant="secondary" className="mb-3 gap-1.5 bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">
              <HelpCircle className="size-3.5" />
              Frequently asked questions
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">Common questions, answered</h2>
          </div>

          <div className="space-y-12">
            {faqCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.id}>
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br ${cat.color} text-white shadow`}
                    >
                      <Icon className="size-4.5" />
                    </div>
                    <h3 className="text-lg font-semibold">{cat.label}</h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {cat.faqs.map((faq) => (
                      <div
                        key={faq.q}
                        className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm"
                      >
                        <div className="mb-2 flex items-start gap-2">
                          <Search className="mt-0.5 size-4 shrink-0 text-blue-500" />
                          <h4 className="text-sm font-semibold leading-snug">{faq.q}</h4>
                        </div>
                        <p className="pl-6 text-xs leading-relaxed text-muted-foreground">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── STILL NEED HELP ─────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-linear-to-r from-blue-950 via-slate-900 to-cyan-950 p-10 text-center text-white shadow-[0_30px_80px_-24px_rgba(34,211,238,0.35)] md:p-14">
          <div aria-hidden className="pointer-events-none absolute -left-20 top-0 size-72 rounded-full bg-blue-500/20 blur-[100px]" />
          <div aria-hidden className="pointer-events-none absolute -right-16 bottom-0 size-64 rounded-full bg-cyan-400/20 blur-[90px]" />
          <div className="relative mx-auto max-w-xl space-y-4">
            <Zap className="mx-auto size-8 text-cyan-300" />
            <h2 className="text-2xl font-bold md:text-3xl">Still need help?</h2>
            <p className="text-sm text-white/70">
              Our support team is available Monday–Friday, 9 am – 6 pm EST. For urgent issues, our AI
              assistant is available 24/7.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-1">
              <Button asChild className="h-10 rounded-full bg-white px-5 font-semibold text-slate-900 hover:bg-white/90">
                <Link href="/contact">
                  Contact us <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-10 rounded-full border-white/20 bg-white/10 px-5 text-white hover:bg-white/15">
                <Link href="/ai">
                  <Bot className="mr-2 size-4" />
                  Open AI chat
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
