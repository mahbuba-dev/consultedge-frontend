
import Banner from "@/components/modules/HomePage/Banner";
import HomeSection2 from "@/components/modules/HomePage/HomeSection2";
import HomeSection3 from "@/components/modules/HomePage/HomeSection3";
import InViewReveal from "@/components/modules/HomePage/InViewReveal";
import IndustryTicker from "@/components/modules/HomePage/IndustryTicker";
import PremiumGlassBackground from "@/components/modules/HomePage/PremiumGlassBackground";
import SmartNewsletter from "@/components/modules/HomePage/SmartNewsletter";
import type { PremiumGlassIntensity } from "@/components/modules/HomePage/PremiumGlassBackground";

import { cache, Suspense } from "react";
import ExpertsShowcase from "@/components/modules/HomePage/ExpertsShowcase";
import TrendingExperts from "@/components/modules/HomePage/TrendingExperts";
import ContentSuggestions from "@/components/modules/HomePage/ContentSuggestions";

import { getExperts } from "@/src/services/expert.services";
import { getAllIndustries } from "@/src/services/industry.services";
import { getAllTestimonials } from "@/src/services/testimonial.services";
import type { IExpert } from "@/src/types/expert.types";
import type { IIndustry } from "@/src/types/industry.types";
import type { ITestimonial } from "@/src/types/testimonial.types";

type HomeLayoutVariant = "compact" | "editorial" | "immersive";

const HOME_LAYOUT_VARIANT: HomeLayoutVariant = "editorial";

const HOME_LAYOUT_PRESETS: Record<
  HomeLayoutVariant,
  {
    backgroundIntensity: PremiumGlassIntensity;
    stackClass: string;
    surfaceClass: string;
  }
> = {
  compact: {
    // Conversion-first: tighter rhythm, flatter surfaces, calm background.
    backgroundIntensity: "calm",
    stackClass: "mt-7 scroll-mt-24 space-y-5 md:mt-10 md:space-y-7 lg:mt-12 lg:space-y-8",
    surfaceClass:
      "[--ce-shell-radius:0rem] [--ce-shell-radius-md:0rem] [--ce-shell-radius-dark:0rem] [--ce-shell-shadow-soft:0_12px_28px_-24px_rgba(15,23,42,0.2)] [--ce-shell-shadow-strong:0_18px_40px_-30px_rgba(15,23,42,0.24)]",
  },
  editorial: {
    // Reading-first: balanced spacing and gentle depth.
    backgroundIntensity: "balanced",
    stackClass: "mt-10 scroll-mt-24 space-y-8 md:mt-14 md:space-y-10 lg:mt-16 lg:space-y-12",
    surfaceClass:
      "[--ce-shell-radius:0rem] [--ce-shell-radius-md:0rem] [--ce-shell-radius-dark:0rem] [--ce-shell-shadow-soft:0_20px_44px_-32px_rgba(15,23,42,0.24)] [--ce-shell-shadow-strong:0_28px_62px_-38px_rgba(15,23,42,0.3)]",
  },
  immersive: {
    // Brand-first: airier rhythm, richer depth, cinematic background.
    backgroundIntensity: "rich",
    stackClass: "mt-12 scroll-mt-24 space-y-10 md:mt-16 md:space-y-12 lg:mt-20 lg:space-y-15",
    surfaceClass:
      "[--ce-shell-radius:0rem] [--ce-shell-radius-md:0rem] [--ce-shell-radius-dark:0rem] [--ce-shell-shadow-soft:0_30px_68px_-38px_rgba(15,23,42,0.31)] [--ce-shell-shadow-strong:0_42px_96px_-48px_rgba(15,23,42,0.4)]",
  },
};

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
  {
    id: "fallback-4",
    rating: 5,
    comment: "The recommendations were practical and immediately useful for our next quarter plan.",
    clientId: "client-4",
    expertId: "expert-4",
    consultationId: "consultation-4",
    createdAt: new Date().toISOString(),
    expert: { fullName: "Execution Advisor" },
    client: { fullName: "Product Lead" },
  },
];

const getHomepageExperts = cache(async (): Promise<IExpert[]> => {
  try {
    const result = await getExperts();
    return Array.isArray(result?.data) ? result.data : [];
  } catch {
    return [];
  }
});

const getHomepageIndustries = cache(async (): Promise<IIndustry[]> => {
  try {
    const result = await getAllIndustries();
    return Array.isArray(result?.data) ? result.data : [];
  } catch {
    return [];
  }
});

const getHomepageTestimonials = cache(async (): Promise<ITestimonial[]> => {
  try {
    const result = await getAllTestimonials(4);
    return result.length > 0 ? result.slice(0, 4) : fallbackTestimonials;
  } catch {
    return fallbackTestimonials;
  }
});

function SectionFallback({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-(--ce-shell-radius) border border-white/70 bg-white/55 dark:border-white/10 dark:bg-slate-900/40 ${className}`} />
  );
}

async function IndustrySections() {
  const industries = await getHomepageIndustries();
  const featuredIndustries = industries.slice(0, 6);

  return (
    <>
      <InViewReveal delay={40}>
        <IndustryTicker industries={featuredIndustries} />
      </InViewReveal>
      <InViewReveal delay={130}>
        <ContentSuggestions industries={industries} />
      </InViewReveal>
      <InViewReveal delay={180}>
        <SmartNewsletter industries={industries} />
      </InViewReveal>
    </>
  );
}

async function ExpertSections() {
  const experts = await getHomepageExperts();

  return (
    <>
      <InViewReveal delay={80}>
        <ExpertsShowcase experts={experts} limit={4} />
      </InViewReveal>
      <InViewReveal delay={110}>
        <TrendingExperts experts={experts} />
      </InViewReveal>
    </>
  );
}

async function TestimonialSection() {
  const testimonials = await getHomepageTestimonials();

  return (
    <InViewReveal delay={120}>
      <HomeSection2 testimonials={testimonials} />
    </InViewReveal>
  );
}

const HomePage = () => {
  const layoutPreset = HOME_LAYOUT_PRESETS[HOME_LAYOUT_VARIANT];

  return (
    <div className={`relative overflow-x-hidden bg-white pb-20 dark:bg-slate-950 ${layoutPreset.surfaceClass}`}>
      <PremiumGlassBackground intensity={layoutPreset.backgroundIntensity} />
      <Banner />

      <div id="home-after-hero" className={layoutPreset.stackClass}>
        <Suspense fallback={<SectionFallback className="h-52 md:h-60" />}>
          <IndustrySections />
        </Suspense>
        <Suspense fallback={<SectionFallback className="h-72 md:h-80" />}>
          <ExpertSections />
        </Suspense>
        <Suspense fallback={<SectionFallback className="h-60 md:h-72" />}>
          <TestimonialSection />
        </Suspense>
        <InViewReveal delay={160}>
          <HomeSection3 />
        </InViewReveal>
      </div>
    </div>
  );
};

export default HomePage;
