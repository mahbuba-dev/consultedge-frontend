import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const pricingPlans = [
  {
    name: "Starter",
    price: "$0",
    description: "Ideal for exploring experts and discovering the right fit.",
    features: ["Expert discovery", "Profile browsing", "Industry filters"],
    accent: "from-sky-50 to-white",
  },
  {
    name: "Growth",
    price: "$49",
    description: "Perfect for individuals and teams booking consultations regularly.",
    features: ["Priority booking", "Faster scheduling", "Consultation history"],
    accent: "from-violet-50 to-white",
  },
  {
    name: "Scale",
    price: "Custom",
    description: "Best for larger organizations needing ongoing strategic support.",
    features: ["Dedicated expert matching", "Team coordination", "Custom workflows"],
    accent: "from-emerald-50 to-white",
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

export default function HomeSection3() {
  return (
    <>
      <section className="space-y-6">
        <div>
          <Badge variant="secondary" className="mb-2 bg-amber-100 text-amber-700">
            Pricing
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Simple plans for every stage
          </h2>
          <p className="text-muted-foreground">
            Start free, grow with premium features, or contact us for a custom team setup.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`border-border/60 bg-linear-to-br ${plan.accent} shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                index === 1 ? "ring-2 ring-violet-200" : ""
              }`}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-2 text-3xl font-bold text-foreground">{plan.price}</div>
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>{feature}</span>
                  </div>
                ))}
                <Button className="mt-2 w-full bg-violet-600 hover:bg-violet-700">
                  Choose {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-[2rem] border bg-linear-to-r from-cyan-50 via-white to-violet-50 p-6 shadow-sm md:p-10">
        <div>
          <Badge variant="secondary" className="mb-2 bg-sky-100 text-sky-700">
            FAQ
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground">
            Quick answers to the most common questions about the platform.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full rounded-xl bg-background/70 p-4">
          {faqItems.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-base font-semibold">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="rounded-[2rem] border border-slate-900 bg-linear-to-r from-slate-950 via-violet-950 to-cyan-950 p-6 text-white shadow-xl md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Ready to make your next smart move?
            </h2>
            <p className="max-w-2xl text-slate-200">
              Join a platform designed to connect insight seekers with industry experts through a fast,
              modern, and delightful experience.
            </p>
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
