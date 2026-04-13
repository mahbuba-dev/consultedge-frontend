import Link from "next/link";
import { ArrowRight, CheckCircle2, HeadphonesIcon, Layers3, ShieldCheck } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const engagementOptions = [
  {
    name: "Explore",
    price: "Free",
    description: "Ideal for discovering experts, comparing profiles, and finding the right fit.",
    features: ["Expert discovery", "Profile browsing", "Industry filters"],
    accent: "from-sky-50 to-white",
    href: "/experts",
    cta: "Browse experts",
  },
  {
    name: "Book a session",
    price: "Pay per consultation",
    description: "Perfect for professionals and teams ready to unlock direct expert guidance.",
    features: ["Flexible expert rates", "Secure payment flow", "Consultation tracking"],
    accent: "from-blue-50 to-white",
    href: "/experts",
    cta: "Start booking",
    featured: true,
  },
  {
    name: "Team support",
    price: "Custom",
    description: "Best for organizations that need recurring strategic support or coordinated sessions.",
    features: ["Priority coordination", "Multi-stakeholder planning", "Custom workflow help"],
    accent: "from-emerald-50 to-white",
    href: "/contact",
    cta: "Talk to us",
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
    tone: "text-emerald-700 bg-emerald-100",
  },
  {
    title: "Smart dashboards",
    description: "Keep consultations, schedules, and progress in one place.",
    icon: Layers3,
    tone: "text-blue-700 bg-blue-100",
  },
  {
    title: "Human support",
    description: "Reach out when you need extra help or a tailored setup.",
    icon: HeadphonesIcon,
    tone: "text-cyan-700 bg-cyan-100",
  },
];

export default function HomeSection3() {
  return (
    <>
      <section className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
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

        <div className="grid gap-5 lg:grid-cols-3">
          {engagementOptions.map((option, index) => (
            <Card
              key={option.name}
              style={{ animationDelay: `${90 + index * 90}ms` }}
              className={`consultedge-reveal--visible consultedge-card-glow border-border/60 bg-linear-to-br ${option.accent} shadow-sm dark:border-white/10 dark:from-slate-900 dark:to-slate-950 dark:shadow-black/20 ${
                option.featured ? "ring-2 ring-blue-200 dark:ring-blue-500/40" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{option.name}</CardTitle>
                  {option.featured ? (
                    <Badge className="bg-blue-600 text-white hover:bg-blue-600">Popular</Badge>
                  ) : null}
                </div>
                <CardDescription>{option.description}</CardDescription>
                <div className="pt-2 text-2xl font-bold text-foreground md:text-3xl">{option.price}</div>
              </CardHeader>
              <CardContent className="space-y-3">
                {option.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>{feature}</span>
                  </div>
                ))}

                <Link href={option.href}>
                  <Button
                    className={`mt-2 w-full ${
                      option.featured
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-slate-900 hover:bg-slate-800"
                    }`}
                  >
                    {option.cta}
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-[2rem] border bg-linear-to-r from-cyan-50 via-white to-blue-50 p-6 shadow-sm dark:border-white/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 md:p-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
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
                <div key={item.title} className="flex gap-3 rounded-2xl border bg-white/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}>
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full rounded-2xl border bg-background/80 p-4 dark:border-white/10 dark:bg-slate-950/80">
          {faqItems.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-base font-semibold">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-slate-900 bg-linear-to-r from-slate-950 via-blue-950 to-cyan-950 p-6 text-white shadow-xl md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_35%)]" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
              Start today
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Ready to turn expert insight into momentum?
            </h2>
            <p className="max-w-2xl text-slate-200">
              Join a platform designed to connect insight seekers with the right industry experts through a fast,
              modern, and more confident consultation experience.
            </p>

            <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-100">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Expert discovery</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Secure booking</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Smart dashboards</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button className="bg-white text-slate-900 hover:bg-white/90">Get started</Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Contact us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
