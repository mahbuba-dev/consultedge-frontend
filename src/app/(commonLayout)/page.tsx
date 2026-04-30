import Banner from "@/components/modules/HomePage/Banner";
import ExpertAnimated from "@/components/modules/HomePage/ExpertAnimated";
import HomeSection2 from "@/components/modules/HomePage/HomeSection2";
import HomeSection3 from "@/components/modules/HomePage/HomeSection3";
import InViewReveal from "@/components/modules/HomePage/InViewReveal";
import IndustryTicker from "@/components/modules/HomePage/IndustryTicker";

import { getExperts } from "@/src/services/expert.services";
import { getAllIndustries } from "@/src/services/industry.services";
import { getAllTestimonials } from "@/src/services/testimonial.services";
import type { IExpert } from "@/src/types/expert.types";
import type { IIndustry } from "@/src/types/industry.types";
import type { ITestimonial } from "@/src/types/testimonial.types";

const fallbackTestimonials: ITestimonial[] = [
  {
    id: "fallback-1",
    rating: 5,
    comment: "ConsultEdge made it easy to find the right expert and book a valuable session fast.",
    clientId: "client-1",
    expertId: "expert-1",
    consultationId: "consultation-1",
    createdAt: new Date().toISOString(),
    expert: { fullName: "Growth Specialist" },
    client: { fullName: "Verified Client" },
  },
  {
    id: "fallback-2",
    rating: 5,
    comment: "The platform feels modern, organized, and genuinely useful for business consultation workflows.",
    clientId: "client-2",
    expertId: "expert-2",
    consultationId: "consultation-2",
    createdAt: new Date().toISOString(),
    expert: { fullName: "Strategy Advisor" },
    client: { fullName: "Startup Founder" },
  },
  {
    id: "fallback-3",
    rating: 4,
    comment: "From expert discovery to follow-up, the whole experience feels smooth and premium.",
    clientId: "client-3",
    expertId: "expert-3",
    consultationId: "consultation-3",
    createdAt: new Date().toISOString(),
    expert: { fullName: "Operations Consultant" },
    client: { fullName: "Business Owner" },
  },
];

const HomePage = async () => {
  const [expertsResult, industriesResult, testimonialsResult] = await Promise.allSettled([
    getExperts(),
    getAllIndustries(),
    getAllTestimonials(3),
  ]);

  const featuredExperts: IExpert[] =
    expertsResult.status === "fulfilled" && Array.isArray(expertsResult.value?.data)
      ? expertsResult.value.data.slice(0, 3)
      : [];

  const featuredIndustries: IIndustry[] =
    industriesResult.status === "fulfilled" && Array.isArray(industriesResult.value?.data)
      ? industriesResult.value.data.slice(0, 6)
      : [];

  const featuredTestimonials: ITestimonial[] =
    testimonialsResult.status === "fulfilled" && testimonialsResult.value.length > 0
      ? testimonialsResult.value.slice(0, 3)
      : fallbackTestimonials;

  return (
    <div className="relative overflow-x-hidden pb-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.14),transparent_40%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_36%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[40rem] -z-10 h-[48rem] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_26%),radial-gradient(circle_at_80%_30%,rgba(56,189,248,0.08),transparent_24%)]" />
      <Banner />

      <div
        id="home-after-hero"
        className="mt-10 scroll-mt-24 space-y-8 md:mt-14 md:space-y-10 lg:mt-16 lg:space-y-12"
      >
        <InViewReveal delay={40}>
          <IndustryTicker industries={featuredIndustries} />
        </InViewReveal>
        <InViewReveal delay={80}>
          <ExpertAnimated experts={featuredExperts} />
        </InViewReveal>
        <InViewReveal delay={120}>
          <HomeSection2 testimonials={featuredTestimonials} />
        </InViewReveal>
        <InViewReveal delay={160}>
          <HomeSection3 />
        </InViewReveal>
      </div>
    </div>
  );
};

export default HomePage;
