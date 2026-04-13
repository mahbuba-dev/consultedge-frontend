"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <section className="relative -mx-4 -mt-6 overflow-hidden border-y border-slate-800/80 bg-slate-950 shadow-[0_30px_80px_-30px_rgba(34,211,238,0.35)] md:-mx-6 lg:-mt-8">
      <div className="relative h-125 overflow-hidden md:h-155 lg:h-170">
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

        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-between px-6 py-6 text-white md:px-8 md:py-8 lg:px-10">
          <div className="max-w-3xl space-y-5 pt-2 md:pt-4">
            <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
              <Sparkles className="mr-1 size-3.5" />
              Premium consultation platform
            </Badge>

            <div key={currentSlide.title} className="consultedge-banner-copy space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">
                {currentSlide.eyebrow}
              </p>
              <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                {currentSlide.title}
              </h1>
              <p className="max-w-2xl text-sm text-slate-200 md:text-lg">
                {currentSlide.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/experts">
                <Button className="bg-white text-slate-900 hover:bg-white/90">
                  Explore experts
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <Link href="/apply-expert">
                <Button
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Become an expert
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
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

            <div className="grid gap-3 md:grid-cols-3">
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
