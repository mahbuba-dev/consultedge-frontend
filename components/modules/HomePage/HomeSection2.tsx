import { CalendarRange, Rocket, ShieldCheck } from "lucide-react";

import TestimonialCard from "@/components/modules/shared/TestimonialCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ITestimonial } from "@/src/types/testimonial.types";

const featureCards = [
  {
    title: "Expert-led strategy",
    description: "Connect with experienced consultants across business, tech, and growth domains.",
    icon: ShieldCheck,
  },
  {
    title: "Fast booking flow",
    description: "Book consultations, track progress, and manage communication in one place.",
    icon: CalendarRange,
  },
  {
    title: "Built for growth",
    description: "A modern consulting ecosystem for clients, experts, and platform teams.",
    icon: Rocket,
  },
];

type HomeSection2Props = {
  testimonials: ITestimonial[];
};

export default function HomeSection2({ testimonials }: HomeSection2Props) {
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {featureCards.map((feature) => {
          const Icon = feature.icon;

          return (
            <Card
              key={feature.title}
              className="border-border/60 bg-white/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-violet-100 to-sky-100 text-violet-700">
                  <Icon className="size-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      <section className="space-y-6 rounded-[2rem] border bg-linear-to-br from-emerald-50/70 via-white to-cyan-50/60 p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="secondary" className="mb-2 bg-emerald-100 text-emerald-700">
              Testimonials
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              What clients are saying
            </h2>
            <p className="text-muted-foreground">
              Real feedback from businesses and professionals using ConsultEdge.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </section>
    </>
  );
}
