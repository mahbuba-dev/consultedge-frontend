import Link from "next/link";
import { ArrowRight, FileText, Mail, Scale } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Terms of Service | ConsultEdge",
  description:
    "Read the Terms of Service for ConsultEdge — the rules, rights, and responsibilities that govern your use of the platform.",
};

const lastUpdated = "1 January 2025";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of terms",
    content: [
      {
        subtitle: "",
        text: "By accessing or using ConsultEdge (the \"Platform\"), you agree to be bound by these Terms of Service (\"Terms\") and our Privacy Policy. If you do not agree to these Terms, you must not use the Platform. These Terms apply to all users, including clients and registered experts.",
      },
    ],
  },
  {
    id: "platform-overview",
    title: "2. Platform overview",
    content: [
      {
        subtitle: "",
        text: "ConsultEdge is an online marketplace that connects individuals and organisations (\"Clients\") with independent expert consultants (\"Experts\"). ConsultEdge facilitates bookings, payments, and communication but is not itself a party to any consultation agreement between a Client and an Expert. Experts are independent contractors, not employees or agents of ConsultEdge.",
      },
    ],
  },
  {
    id: "accounts",
    title: "3. Accounts and registration",
    content: [
      {
        subtitle: "Eligibility",
        text: "You must be at least 18 years old and legally capable of entering into a binding contract to use the Platform.",
      },
      {
        subtitle: "Account accuracy",
        text: "You agree to provide accurate, current, and complete information during registration and to keep your account information up to date.",
      },
      {
        subtitle: "Account security",
        text: "You are responsible for maintaining the confidentiality of your login credentials. Notify us immediately at security@consultedge.com if you suspect unauthorised access to your account.",
      },
      {
        subtitle: "One account per user",
        text: "Each person may hold one client account. Expert accounts are separate and require a successful application review. Creating multiple accounts to circumvent suspensions or reviews is prohibited.",
      },
    ],
  },
  {
    id: "bookings",
    title: "4. Bookings and sessions",
    content: [
      {
        subtitle: "Booking confirmation",
        text: "A booking is confirmed once you receive a confirmation email and payment is successfully processed. Unconfirmed bookings have no contractual effect.",
      },
      {
        subtitle: "Cancellation by client",
        text: "Clients may cancel a confirmed booking up to 24 hours before the scheduled session start time for a full refund. Cancellations within 24 hours are non-refundable unless the Expert also fails to attend.",
      },
      {
        subtitle: "Cancellation by expert",
        text: "If an Expert cancels, you will receive a full refund within 3–5 business days and the option to re-book. Repeated cancellations by Experts may result in account suspension.",
      },
      {
        subtitle: "No-shows",
        text: "A session where the Expert fails to appear within 10 minutes of the scheduled start time constitutes a no-show. Full refunds are issued automatically. A session where the Client fails to appear is non-refundable.",
      },
      {
        subtitle: "Session conduct",
        text: "Sessions must be used for legitimate professional consultation. Recording a session without the other party's explicit consent is prohibited.",
      },
    ],
  },
  {
    id: "payments",
    title: "5. Payments and fees",
    content: [
      {
        subtitle: "Pricing",
        text: "Session prices are set by Experts and displayed on their profile pages. All prices are inclusive of applicable taxes where required.",
      },
      {
        subtitle: "Payment processing",
        text: "Payments are processed by our third-party payment provider. By booking, you authorise ConsultEdge to charge the displayed amount to your chosen payment method.",
      },
      {
        subtitle: "Platform fee",
        text: "ConsultEdge deducts a platform fee from the amount payable to Experts. This fee is disclosed in the Expert Agreement and does not affect the Client's displayed price.",
      },
      {
        subtitle: "Refunds",
        text: "Refunds are issued only in circumstances described in Section 4 (Bookings and sessions) or where required by applicable consumer law. All refunds are returned to the original payment method.",
      },
    ],
  },
  {
    id: "expert-responsibilities",
    title: "6. Expert responsibilities",
    content: [
      {
        subtitle: "Accuracy of credentials",
        text: "Experts warrant that all professional credentials, qualifications, and experience listed on their profile are accurate, current, and not misleading.",
      },
      {
        subtitle: "Professional standards",
        text: "Experts agree to conduct sessions with professional competence, punctuality, and respect. Sessions must be advisory in nature and must not constitute regulated professional services (e.g. legal representation, medical treatment) unless the Expert holds the required licence.",
      },
      {
        subtitle: "Confidentiality",
        text: "Experts must keep all Client information shared during sessions strictly confidential and may not use it for any purpose other than conducting the booked consultation.",
      },
    ],
  },
  {
    id: "prohibited",
    title: "7. Prohibited conduct",
    content: [
      {
        subtitle: "",
        text: "You may not: (a) use the Platform for any unlawful purpose; (b) post false, misleading, or defamatory content; (c) harass, abuse, or discriminate against any user; (d) attempt to circumvent ConsultEdge's payment system by arranging direct payments outside the Platform; (e) scrape, copy, or reverse-engineer any part of the Platform; (f) introduce malware or otherwise attempt to compromise Platform security; (g) use automated bots or scripts to interact with the Platform; (h) impersonate any person or entity.",
      },
    ],
  },
  {
    id: "intellectual-property",
    title: "8. Intellectual property",
    content: [
      {
        subtitle: "ConsultEdge IP",
        text: "The Platform's design, software, brand name, logos, and original content are the exclusive property of ConsultEdge and may not be used, copied, or distributed without prior written consent.",
      },
      {
        subtitle: "User content",
        text: "By submitting content to the Platform (e.g. profile descriptions, reviews), you grant ConsultEdge a non-exclusive, worldwide, royalty-free licence to display and use that content on the Platform.",
      },
    ],
  },
  {
    id: "liability",
    title: "9. Limitation of liability",
    content: [
      {
        subtitle: "",
        text: "To the maximum extent permitted by applicable law, ConsultEdge and its officers, directors, and employees will not be liable for any indirect, incidental, special, or consequential damages arising out of or relating to your use of the Platform. ConsultEdge's total aggregate liability for any claim arising out of these Terms will not exceed the amount you paid to ConsultEdge in the 12 months preceding the claim.",
      },
    ],
  },
  {
    id: "disclaimers",
    title: "10. Disclaimers",
    content: [
      {
        subtitle: "",
        text: "The Platform is provided \"as is\" and \"as available\". ConsultEdge does not guarantee that the Platform will be uninterrupted, error-free, or virus-free. Expert advice provided through the Platform is for informational purposes only and does not substitute for licensed professional advice in regulated fields such as law, medicine, or financial planning. ConsultEdge does not verify the accuracy of Expert advice given during sessions.",
      },
    ],
  },
  {
    id: "termination",
    title: "11. Termination",
    content: [
      {
        subtitle: "",
        text: "ConsultEdge may suspend or terminate your account at any time, with or without notice, for conduct that violates these Terms or that is otherwise harmful to the Platform, users, or third parties. You may close your account at any time through Settings → Account. Termination does not affect rights or obligations that arose prior to termination.",
      },
    ],
  },
  {
    id: "governing-law",
    title: "12. Governing law and disputes",
    content: [
      {
        subtitle: "",
        text: "These Terms are governed by the laws of the State of New York, USA, without regard to conflict-of-law principles. Any dispute arising under these Terms will be resolved by binding arbitration administered by the American Arbitration Association, except that either party may seek injunctive relief in a court of competent jurisdiction for intellectual property violations.",
      },
    ],
  },
  {
    id: "changes",
    title: "13. Changes to these terms",
    content: [
      {
        subtitle: "",
        text: "ConsultEdge may update these Terms from time to time. We will notify you of material changes by email or a prominent notice on the Platform at least 14 days before the changes take effect. Continued use of the Platform after the effective date constitutes acceptance of the revised Terms.",
      },
    ],
  },
  {
    id: "contact",
    title: "14. Contact",
    content: [
      {
        subtitle: "",
        text: "For questions about these Terms, contact us at legal@consultedge.com or by post at ConsultEdge, Attn: Legal Team, New York, NY 10001, USA.",
      },
    ],
  },
];

export default function TermsPage() {
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
              <Scale className="mr-1.5 size-3.5" />
              Terms of Service
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Platform rules and responsibilities
            </h1>
            <p className="max-w-2xl text-sm text-white/75 md:text-base">
              These terms govern your use of ConsultEdge. Please read them carefully before using the
              platform.
            </p>
            <p className="text-xs text-white/50">Last updated: {lastUpdated}</p>
          </div>
        </section>

        {/* ── NOTICE ─────────────────────────────────────── */}
        <div className="flex gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/60 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
          <FileText className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
            By using ConsultEdge you confirm that you have read, understood, and agree to these Terms.
            If you are using the Platform on behalf of an organisation, you confirm you have authority
            to bind that organisation.
          </p>
        </div>

        {/* ── TOC ─────────────────────────────────────── */}
        <nav className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold">Table of contents</h2>
          <ol className="grid gap-1 sm:grid-cols-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── SECTIONS ─────────────────────────────────────── */}
        <div className="space-y-8">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24 rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm md:p-8"
            >
              <h2 className="mb-4 text-lg font-bold tracking-tight">{section.title}</h2>
              <div className="space-y-4">
                {section.content.map((item, idx) => (
                  <div key={idx}>
                    {item.subtitle && (
                      <h3 className="mb-1 text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {item.subtitle}
                      </h3>
                    )}
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
            Questions about our terms? Contact our legal team.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="h-9 rounded-full px-5 text-sm">
              <a href="mailto:legal@consultedge.com">
                <Mail className="mr-2 size-3.5" />
                Email legal team
              </a>
            </Button>
            <Button asChild variant="outline" className="h-9 rounded-full px-5 text-sm">
              <Link href="/privacy">
                View Privacy Policy <ArrowRight className="ml-2 size-3.5" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
