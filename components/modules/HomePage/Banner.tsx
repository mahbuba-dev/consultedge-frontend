"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  Clock3,
  Layers3,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";

const carouselSlides = [
  {
    image: "/banner/banner1.jpg",
    eyebrow: "Smart expert guidance",
    title: "Make better decisions with the right expert beside you.",
    description:
      "A clean modern consultation experience for discovery, booking, and confident next steps.",
  },
  {
    image: "/banner/image.jpg",
    eyebrow: "Smooth booking flow",
    title: "Simple, secure, and fast from first click to booked session.",
    description:
      "Explore trusted specialists, choose the right slot, and keep everything organized in one place.",
  },
  {
    image: "/banner/image (1).jpg",
    eyebrow: "Future-ready platform",
    title: "Modern consulting for teams that want clarity and momentum.",
    description:
      "ConsultEdge brings expert insight, smart dashboards, and a premium platform feel into one journey.",
  },
];

const trustCards = [
  {
    title: "Verified experts",
    subtitle: "Trusted profiles",
    icon: Users,
  },
  {
    title: "Secure booking",
    subtitle: "Smooth payment flow",
    icon: ShieldCheck,
  },
  {
    title: "Fast scheduling",
    subtitle: "Clear next steps",
    icon: CalendarRange,
  },
];

const heroStats = [
  {
    value: "24/7",
    label: "Expert discovery",
    icon: Clock3,
  },
  {
    value: "1 hub",
    label: "Booking and follow-up",
    icon: Layers3,
  },
  {
    value: "100%",
    label: "Guided workflow feel",
    icon: ShieldCheck,
  },
];

const AUTO_PLAY_DELAY = 6000;

export default function Banner() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % carouselSlides.length);
    }, AUTO_PLAY_DELAY);

    return () => window.clearInterval(intervalId);
  }, []);

  const currentSlide = carouselSlides[activeSlide];

  const goToPrevious = () => {
    setActiveSlide((current) => (current === 0 ? carouselSlides.length - 1 : current - 1));
  };

  const goToNext = () => {
    setActiveSlide((current) => (current + 1) % carouselSlides.length);
  };

  return (
    <section className="relative -mx-4 -mt-6 overflow-hidden rounded-b-[2.25rem] border-b border-slate-800/80 bg-slate-950 shadow-[0_30px_80px_-30px_rgba(34,211,238,0.35)] md:-mx-6 lg:-mt-8 lg:rounded-b-[2.75rem]">
      <div className="relative min-h-168 overflow-hidden md:min-h-188 lg:min-h-196">
        {carouselSlides.map((slide, index) => (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeSlide ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="100vw"
              className={`object-cover ${index === activeSlide ? "consultedge-carousel-image" : ""}`}
            />

            <div className="absolute inset-0 bg-linear-to-r from-slate-950/90 via-slate-950/65 to-slate-950/20" />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/10 to-slate-950/30" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[34px_34px] opacity-20" />
          </div>
        ))}

        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-between px-5 py-6 text-white md:px-8 md:py-8 lg:px-10 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-end">
            <div className="max-w-3xl space-y-5 pt-3 md:space-y-6 md:pt-6 lg:pt-10">
              <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
                <Sparkles className="mr-1 size-3.5" />
                Premium consultation platform
              </Badge>

              <div key={currentSlide.title} className="consultedge-banner-copy space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200 md:text-sm">
                  {currentSlide.eyebrow}
                </p>
                <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl xl:text-[4.25rem] xl:leading-[1.02]">
                  {currentSlide.title}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-200 md:text-lg md:leading-8">
                  {currentSlide.description}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/experts"
                  className={cn(
                    "inline-flex h-11 items-center justify-center rounded-full border border-transparent px-5 text-sm font-medium transition-all",
                    "bg-white text-slate-900 hover:bg-white/90",
                  )}
                >
                    Explore experts
                    <ArrowRight className="ml-2 size-4" />
                </Link>
                <Link
                  href="/apply-expert"
                  className={cn(
                    "inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition-all",
                    "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
                  )}
                >
                    Become an expert
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {heroStats.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 backdrop-blur-md"
                    >
                      <div className="mb-2 flex items-center gap-2 text-cyan-200">
                        <Icon className="size-4" />
                        <span className="text-[11px] uppercase tracking-[0.18em] text-white/70">
                          {item.label}
                        </span>
                      </div>
                      <p className="text-xl font-semibold text-white md:text-2xl">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="rounded-[2rem] border border-white/12 bg-white/10 p-5 backdrop-blur-xl shadow-[0_28px_80px_-34px_rgba(15,23,42,0.75)]">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Why it feels premium</p>
                    <p className="mt-2 text-2xl font-semibold text-white">Designed for faster expert decisions</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-cyan-200">
                    <Sparkles className="size-5" />
                  </div>
                </div>

                <div className="space-y-3">
                  {trustCards.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/30 p-4"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{item.title}</p>
                          <p className="text-sm text-slate-300">{item.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 md:pt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 px-1">
                {carouselSlides.map((slide, index) => (
                  <button
                    key={slide.image}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    onClick={() => setActiveSlide(index)}
                    className={`rounded-full transition-all ${
                      index === activeSlide
                        ? "h-2.5 w-8 bg-white"
                        : "h-2.5 w-2.5 bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={goToPrevious}
                  className="rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <ArrowLeft className="size-4" />
                  <span className="sr-only">Previous slide</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={goToNext}
                  className="rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <ArrowRight className="size-4" />
                  <span className="sr-only">Next slide</span>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3 lg:hidden">
              {trustCards.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={`consultedge-card-glow rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md ${index % 2 === 0 ? "consultedge-float" : "consultedge-float consultedge-float--delay"}`}
                  >
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-200">
                      <Icon className="size-4" />
                    </div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="text-sm text-slate-200">{item.subtitle}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
