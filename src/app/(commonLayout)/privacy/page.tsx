import Link from "next/link";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy | ConsultEdge",
  description:
    "Understand how ConsultEdge collects, uses, stores, and protects your personal information.",
};

const lastUpdated = "1 January 2025";

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information we collect",
    content: [
      {
        subtitle: "Account information",
        text: "When you register, we collect your name, email address, and a hashed password. Experts additionally provide professional credentials, biography, and profile photo.",
      },
      {
        subtitle: "Booking and session data",
        text: "We record details of consultations booked, including session time, duration, topic, expert assigned, and post-session ratings you submit.",
      },
      {
        subtitle: "Usage and activity data",
        text: "We automatically log pages visited, search queries entered, experts viewed, features used, device type, browser, IP address (anonymised after 30 days), and approximate geographic region.",
      },
      {
        subtitle: "Payment information",
        text: "Payment card details are handled entirely by our payment processor. ConsultEdge stores only a masked card reference and transaction identifiers. We never see or store full card numbers.",
      },
      {
        subtitle: "Communications",
        text: "Messages sent through the platform's chat or contact form, and emails exchanged with our support team, are retained to provide support and resolve disputes.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "2. How we use your information",
    content: [
      {
        subtitle: "Providing the service",
        text: "We use your data to create and manage your account, facilitate bookings, process payments, send booking confirmations and reminders, and enable in-session communication.",
      },
      {
        subtitle: "Personalisation",
        text: "Your browsing and booking history informs our AI recommendation engine, which surfaces relevant experts, content, and insights. This processing is based on our legitimate interest in improving your experience.",
      },
      {
        subtitle: "Safety and trust",
        text: "We analyse activity patterns to detect fraudulent behaviour, resolve disputes, and enforce our Terms of Service.",
      },
      {
        subtitle: "Marketing (opt-in only)",
        text: "With your explicit consent, we may send newsletters, product updates, and special offers. You can withdraw consent at any time via the Unsubscribe link in any marketing email or in your account settings.",
      },
      {
        subtitle: "Legal compliance",
        text: "We process data where required by applicable law, such as retaining financial records for tax purposes.",
      },
    ],
  },
  {
    id: "sharing",
    title: "3. How we share your information",
    content: [
      {
        subtitle: "With experts",
        text: "When you book a session, the expert receives your name, a summary of the topic, and the session time. They do not receive your payment information or other account data.",
      },
      {
        subtitle: "Service providers",
        text: "We share data with trusted third parties who operate under strict data-processing agreements: our cloud infrastructure provider, payment processor, email delivery service, and analytics tools.",
      },
      {
        subtitle: "Legal requirements",
        text: "We may disclose data if required by law, court order, or to protect the rights, property, or safety of ConsultEdge, our users, or the public.",
      },
      {
        subtitle: "Business transfers",
        text: "If ConsultEdge is acquired or merged, user data may be transferred as part of that transaction. We will notify users before their data becomes subject to a different privacy policy.",
      },
    ],
  },
  {
    id: "retention",
    title: "4. Data retention",
    content: [
      {
        subtitle: "Active accounts",
        text: "Personal data is retained for as long as your account is active or as needed to provide services.",
      },
      {
        subtitle: "Deleted accounts",
        text: "When you delete your account, personal data is permanently removed within 30 days, except where we are required by law to retain certain records (e.g. financial records for up to 7 years).",
      },
      {
        subtitle: "Anonymised data",
        text: "Aggregated or anonymised analytics data that cannot be linked back to an individual may be retained indefinitely.",
      },
    ],
  },
  {
    id: "security",
    title: "5. Security",
    content: [
      {
        subtitle: "Technical measures",
        text: "All data in transit is encrypted via TLS 1.3. Data at rest is encrypted using AES-256. Access to production systems is restricted by role-based access controls and multi-factor authentication.",
      },
      {
        subtitle: "Organisational measures",
        text: "Our team undergoes regular security training. We conduct periodic penetration tests and security audits.",
      },
      {
        subtitle: "Breach notification",
        text: "In the event of a data breach that affects your personal information, we will notify you and the relevant authorities within the timeframes required by applicable law.",
      },
    ],
  },
  {
    id: "rights",
    title: "6. Your rights",
    content: [
      {
        subtitle: "Access",
        text: "You may request a copy of the personal data we hold about you at any time.",
      },
      {
        subtitle: "Correction",
        text: "You may update most personal data directly in your account settings. For corrections that require our assistance, email privacy@consultedge.com.",
      },
      {
        subtitle: "Deletion",
        text: "You may request deletion of your account and associated personal data. See Settings → Account → Delete account, or contact us.",
      },
      {
        subtitle: "Portability",
        text: "Where technically feasible, you may request your data in a machine-readable format.",
      },
      {
        subtitle: "Objection and restriction",
        text: "You may object to processing based on legitimate interests or request that we restrict processing in certain circumstances.",
      },
    ],
  },
  {
    id: "cookies",
    title: "7. Cookies and tracking",
    content: [
      {
        subtitle: "Essential cookies",
        text: "Required for the platform to function (e.g. session authentication). Cannot be disabled.",
      },
      {
        subtitle: "Analytics cookies",
        text: "Help us understand how users interact with the platform. Anonymised and aggregated. You may opt out via your browser settings.",
      },
      {
        subtitle: "Personalisation cookies",
        text: "Enable AI-powered recommendations based on your in-session activity. May be disabled in your account settings, though this will reduce personalisation.",
      },
    ],
  },
  {
    id: "contact",
    title: "8. Contact",
    content: [
      {
        subtitle: "Privacy questions",
        text: "For any privacy-related requests or questions, contact our Data Protection Officer at privacy@consultedge.com or by post at ConsultEdge, Attn: Privacy Team, New York, NY 10001, USA.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="relative overflow-hidden pb-20 pt-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-160 bg-[radial-gradient(circle_at_10%_10%,rgba(37,99,235,0.12),transparent_40%),radial-gradient(circle_at_90%_12%,rgba(16,185,129,0.1),transparent_38%)]"
      />

      <div className="mx-auto max-w-4xl space-y-10 px-4 md:px-6">
        {/* ── HEADER ─────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[2rem] border border-blue-200/50 bg-linear-to-br from-slate-950 via-blue-950 to-cyan-950 px-8 py-12 text-white shadow-[0_30px_80px_-24px_rgba(34,211,238,0.35)] dark:border-white/10">
          <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-blue-500/20 blur-[100px]" />
          <div aria-hidden className="pointer-events-none absolute -bottom-16 -right-14 size-60 rounded-full bg-cyan-400/20 blur-[80px]" />
          <div className="relative space-y-3">
            <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
              <Lock className="mr-1.5 size-3.5" />
              Privacy Policy
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              How we handle your data
            </h1>
            <p className="max-w-2xl text-sm text-white/75 md:text-base">
              ConsultEdge is committed to protecting your privacy. This policy explains what data we
              collect, why we collect it, and how you can control it.
            </p>
            <p className="text-xs text-white/50">Last updated: {lastUpdated}</p>
          </div>
        </section>

        {/* ── HIGHLIGHTS ─────────────────────────────────────── */}
        <section className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "We never sell your data",
              text: "Personal data is never sold to advertisers or third parties.",
              color: "text-emerald-600 dark:text-emerald-400",
            },
            {
              icon: Lock,
              title: "Encrypted end-to-end",
              text: "All data in transit and at rest is encrypted with industry-standard protocols.",
              color: "text-blue-600 dark:text-blue-400",
            },
            {
              icon: Mail,
              title: "You're in control",
              text: "Access, correct, export, or delete your data anytime from your account settings.",
              color: "text-purple-600 dark:text-purple-400",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm"
              >
                <Icon className={`mb-3 size-5 ${item.color}`} />
                <h3 className="mb-1 text-sm font-semibold">{item.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            );
          })}
        </section>

        {/* ── TOC ─────────────────────────────────────── */}
        <nav className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold">Table of contents</h2>
          <ol className="grid gap-1 sm:grid-cols-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── SECTIONS ─────────────────────────────────────── */}
        <div className="space-y-10">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24 rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm md:p-8"
            >
              <h2 className="mb-5 text-lg font-bold tracking-tight">{section.title}</h2>
              <div className="space-y-4">
                {section.content.map((item) => (
                  <div key={item.subtitle}>
                    <h3 className="mb-1 text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {item.subtitle}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* ── BOTTOM CTA ─────────────────────────────────────── */}
        <section className="rounded-2xl border border-border/60 bg-card/70 p-6 text-center shadow-sm">
          <p className="mb-3 text-sm text-muted-foreground">
            Questions about your data? Our privacy team is here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="h-9 rounded-full px-5 text-sm">
              <a href="mailto:privacy@consultedge.com">
                <Mail className="mr-2 size-3.5" />
                Email privacy team
              </a>
            </Button>
            <Button asChild variant="outline" className="h-9 rounded-full px-5 text-sm">
              <Link href="/terms">
                View Terms of Service <ArrowRight className="ml-2 size-3.5" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
