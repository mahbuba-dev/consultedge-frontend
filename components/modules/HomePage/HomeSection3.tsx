import Link from "next/link";
import { ArrowRight, CheckCircle2, HeadphonesIcon, Layers3, ShieldCheck, Sparkles, Clock3 } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/src/lib/utils";

const engagementOptions = [
  {
    name: "Explore",
    price: "Start free",
    description: "Best for discovering experts, comparing profiles, and shortlisting faster.",
    features: ["Verified directory", "AI-powered discovery", "Industry filters"],
    accent: "from-sky-600 to-cyan-500",
    href: "/experts",
    cta: "Browse experts",
    eta: "2 min setup",
  },
  {
    name: "Book a session",
    price: "Pay per consultation",
    description: "For professionals and teams ready for direct, outcome-focused expert guidance.",
    features: ["Flexible rates", "Secure checkout", "Session history & notes"],
    accent: "from-blue-600 to-cyan-500",
    href: "/experts",
    cta: "Start booking",
    eta: "5 min to book",
    featured: true,
  },
  {
    name: "Team support",
    price: "Custom",
    description: "For organizations needing recurring strategic support and coordinated expert sessions.",
    features: ["Dedicated coordination", "Multi-stakeholder planning", "Custom operating cadence"],
    accent: "from-cyan-600 to-teal-500",
    href: "/contact",
    cta: "Talk to us",
    eta: "White-glove onboarding",
    featured: true,
  },
];

const faqItems = [
  {
    question: "How do I book a consultation?",
    answer:
      "Browse experts, choose a schedule that works for you, and confirm the booking from your dashboard.",
  },
  {
    question: "Can I become an expert on ConsultEdge?",
    answer:
      "Yes. Apply through the expert application form and our team will review your experience and specialization.",
  },
  {
    question: "Are payments handled securely?",
    answer:
      "Yes. Consultation payments are processed using a secure payment flow and role-based access protections.",
  },
  {
    question: "Can I manage everything from one dashboard?",
    answer:
      "Yes. Clients, experts, and admins each get a dedicated dashboard tailored to their workflow.",
  },
];

const supportHighlights = [
  {
    title: "Secure payments",
    description: "A cleaner checkout and booking confirmation experience.",
    icon: ShieldCheck,
    accent: "from-emerald-500 to-teal-500",
  },
  {
    title: "Smart dashboards",
    description: "Keep consultations, schedules, and progress in one place.",
    icon: Layers3,
    accent: "from-blue-600 to-cyan-500",
  },
  {
    title: "Human support",
    description: "Reach out when you need extra help or a tailored setup.",
    icon: HeadphonesIcon,
    accent: "from-cyan-500 to-sky-500",
  },
];

export default function HomeSection3() {
  return (
    <>
      <section id="engagement-section" className="relative scroll-mt-28 overflow-hidden space-y-6 rounded-(--ce-shell-radius) border border-border/60 bg-white/50 p-5 shadow-(--ce-shell-shadow-soft) backdrop-blur-2xl md:rounded-(--ce-shell-radius-md) md:p-7 dark:rounded-(--ce-shell-radius-dark) dark:border-white/10 dark:bg-slate-950/44">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(124deg,rgba(255,255,255,0.42),rgba(255,255,255,0.08)_44%,rgba(56,189,248,0.08)_100%)] dark:bg-[linear-gradient(124deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_44%,rgba(56,189,248,0.07)_100%)]"
        />

        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="secondary" className="mb-2 bg-amber-100 text-amber-700">
              Get started
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Flexible ways to engage with ConsultEdge
            </h2>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            Start by exploring experts, book when you are ready, or contact us for a more tailored team setup.
          </p>
        </div>

        <div className="relative grid gap-5 xl:grid-cols-3">
          {engagementOptions.map((option, index) => (
            <Card
              key={option.name}
              style={{ animationDelay: `${90 + index * 90}ms` }}
              className={`consultedge-reveal--visible consultedge-card-glow relative overflow-hidden border border-slate-200/70 bg-slate-950 text-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.7)] dark:border-white/10 ${
                option.featured ? "ring-2 ring-cyan-400/40 shadow-[0_28px_70px_-34px_rgba(34,211,238,0.5)]" : ""
              }`}
            >
              <div className={`pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-linear-to-r ${option.accent}`} />
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-white">{option.name}</CardTitle>
                  {option.featured ? (
                    <Badge className="bg-blue-600 text-white hover:bg-blue-600">Popular</Badge>
                  ) : null}
                </div>
                <CardDescription className="text-slate-300">{option.description}</CardDescription>
                <div className="pt-2 text-3xl font-bold text-white">{option.price}</div>
                <p className="inline-flex items-center gap-1 text-xs text-cyan-200">
                  <Clock3 className="size-3.5" />
                  {option.eta}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {option.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-slate-200">
                    <CheckCircle2 className="size-4 text-emerald-300" />
                    <span>{feature}</span>
                  </div>
                ))}

<div className="mt-2 w-full">
  <Link
    href={option.href}
    className={cn(
      "group inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-all outline-none",
      option.featured
        ? "bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-[0_10px_30px_-12px_rgba(34,211,238,0.55)] hover:from-blue-700 hover:to-cyan-600"
        : "border border-blue-200 bg-white text-slate-900 hover:border-cyan-300 hover:bg-cyan-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-cyan-400/40 dark:hover:bg-white/10",
    )}
  >
      {option.cta}
      <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
</div>
 
              </CardContent>
            
            </Card>
          ))}
        </div>
      </section>

      <section
        id="faq-section"
        className="relative my-8 scroll-mt-28 overflow-hidden grid gap-6 rounded-(--ce-shell-radius) border bg-white/48 p-6 shadow-(--ce-shell-shadow-soft) backdrop-blur-2xl md:rounded-(--ce-shell-radius-md) md:p-8 lg:grid-cols-[0.8fr_1.2fr] dark:rounded-(--ce-shell-radius-dark) dark:border-white/10 dark:bg-slate-950/44"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(122deg,rgba(255,255,255,0.42),rgba(255,255,255,0.08)_42%,rgba(14,165,233,0.09)_100%)] dark:bg-[linear-gradient(122deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_42%,rgba(14,165,233,0.07)_100%)]"
        />

        <div className="relative space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2 bg-sky-100 text-sky-700">
              FAQ
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Answers that keep things moving
            </h2>
            <p className="text-muted-foreground">
              Quick guidance for the most common questions about booking, payments, and expert access.
            </p>
          </div>

          <div className="space-y-3">
            {supportHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border/60 bg-white/85 p-3.5 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-white/10 dark:bg-slate-950/70 dark:hover:border-cyan-400/30"
                >
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${item.accent} text-white shadow-md shadow-cyan-500/20 transition-transform group-hover:scale-110`}
                  >
                    <Icon className="size-5" />
                  </div>

                  <div className="flex flex-col">
                    <p className="font-semibold leading-tight text-foreground">
                      {item.title}
                    </p>
                    <p className="text-sm leading-snug text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Accordion
          type="single"
          collapsible
          className="relative w-full space-y-3 rounded-2xl border border-border/60 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/80"
        >
          {faqItems.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`faq-${index}`}
              className="rounded-xl border border-border/50 bg-white/70 px-4 transition-colors hover:border-blue-300 dark:border-white/5 dark:bg-slate-900/60 dark:hover:border-cyan-400/30"
            >
              <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-cyan-500 text-xs font-bold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pl-10 text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
