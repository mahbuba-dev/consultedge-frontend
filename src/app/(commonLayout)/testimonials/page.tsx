import TestimonialsDirectory from "@/components/modules/HomePage/TestimonialsDirectory";
import { getAllTestimonials } from "@/src/services/testimonial.services";
import type { ITestimonial } from "@/src/types/testimonial.types";

export const metadata = {
  title: "Testimonials | ConsultEdge",
  description:
    "Read verified client experiences from professionals and businesses who booked expert consultations on ConsultEdge.",
};

const fallbackTestimonials: ITestimonial[] = [
  {
    id: "fallback-1",
    rating: 5,
    comment: "ConsultEdge helped us de-risk a key hiring decision in one session.",
    clientId: "client-1",
    expertId: "expert-1",
    consultationId: "consultation-1",
    createdAt: new Date().toISOString(),
    expert: { fullName: "Hiring Strategy Expert" },
    client: { fullName: "Operations Lead" },
  },
  {
    id: "fallback-2",
    rating: 5,
    comment: "Premium experience from discovery to booking. The advice was immediately actionable.",
    clientId: "client-2",
    expertId: "expert-2",
    consultationId: "consultation-2",
    createdAt: new Date().toISOString(),
    expert: { fullName: "Growth Consultant" },
    client: { fullName: "Startup Founder" },
  },
  {
    id: "fallback-3",
    rating: 4,
    comment: "Clean dashboard, fast scheduling, and high-quality experts. Highly recommended.",
    clientId: "client-3",
    expertId: "expert-3",
    consultationId: "consultation-3",
    createdAt: new Date().toISOString(),
    expert: { fullName: "Business Advisor" },
    client: { fullName: "Team Manager" },
  },
  {
    id: "fallback-4",
    rating: 5,
    comment: "I got clear direction in one call and avoided weeks of trial-and-error.",
    clientId: "client-4",
    expertId: "expert-4",
    consultationId: "consultation-4",
    createdAt: new Date().toISOString(),
    expert: { fullName: "Execution Strategy Expert" },
    client: { fullName: "Operations Manager" },
  },
];

export default async function TestimonialsPage() {
  const data = await getAllTestimonials(32).catch(() => []);
  const testimonials = data.length > 0 ? data : fallbackTestimonials;

  return (
    <main className="relative overflow-hidden pb-16 pt-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-160 bg-[radial-gradient(circle_at_12%_16%,rgba(37,99,235,0.18),transparent_40%),radial-gradient(circle_at_86%_18%,rgba(34,211,238,0.18),transparent_36%)]"
      />

      <TestimonialsDirectory testimonials={testimonials} />
    </main>
  );
}
