"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import gsap from "gsap";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";

const carouselSlides = [
  {
    image: "/banner/banner1.jpg",
    eyebrow: "Smart expert guidance",
    title: "Better decisions with the right expert beside you.",
    description:
      "Discover, book, and act — a clean consultation flow built for confident next steps.",
  },
  {
    image: "/banner/image.jpg",
    eyebrow: "Smooth booking",
    title: "From first click to booked session in seconds.",
    description:
      "Trusted specialists, real-time availability, and one place to manage every conversation.",
  },
  {
    image: "/banner/image (1).jpg",
    eyebrow: "Future-ready",
    title: "Modern consulting for teams that move fast.",
    description:
      "Expert insight, smart dashboards, and a premium feel — all in one journey.",
  },
];

const trustCards = [
  { title: "Verified experts", subtitle: "Trusted profiles", icon: Users },
  { title: "Secure booking", subtitle: "Smooth payments", icon: ShieldCheck },
  { title: "Fast scheduling", subtitle: "Clear next steps", icon: CalendarRange },
];

const AUTO_PLAY_DELAY = 6000;

export default function Banner() {
  const [activeSlide, setActiveSlide] = useState(0);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % carouselSlides.length);
    }, AUTO_PLAY_DELAY);
    return () => window.clearInterval(intervalId);
  }, []);

  // GSAP intro/transition animation on slide change
  useEffect(() => {
    const node = copyRef.current;
    if (!node) return;
    const targets = node.querySelectorAll<HTMLElement>("[data-anim]");
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { y: 28, opacity: 0, filter: "blur(8px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
        },
      );
    }, node);

    return () => ctx.revert();
  }, [activeSlide]);

  const currentSlide = carouselSlides[activeSlide];

  const goToPrevious = () =>
    setActiveSlide((c) => (c === 0 ? carouselSlides.length - 1 : c - 1));
  const goToNext = () => setActiveSlide((c) => (c + 1) % carouselSlides.length);

  return (
    <section className="relative -mx-4 -mt-6 overflow-hidden rounded-b-[2rem] border-b border-slate-800/80 bg-slate-950 shadow-[0_30px_80px_-30px_rgba(34,211,238,0.35)] md:-mx-6 lg:-mt-8 lg:rounded-b-[2.5rem]">
      <div className="relative h-120 overflow-hidden md:h-130 lg:h-140">
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
            <div className="absolute inset-0 bg-linear-to-r from-slate-950/95 via-slate-950/70 to-slate-950/30" />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-transparent to-slate-950/30" />
          </div>
        ))}

        <div className="relative z-10 mx-auto flex h-full w-full max-w-360 flex-col justify-between px-5 py-6 text-white md:px-8 md:py-7 lg:px-10 lg:py-8">
          <div className="grid h-full gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:items-center">
            {/* LEFT: copy */}
            <div ref={copyRef} className="max-w-2xl space-y-4">
              <Badge
                data-anim
                className="border-white/20 bg-white/10 text-white hover:bg-white/10"
              >
                <Sparkles className="mr-1 size-3.5" />
                Premium consultation platform
              </Badge>

              <p
                data-anim
                className="text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-200 md:text-xs"
              >
                {currentSlide.eyebrow}
              </p>

              <h1
                data-anim
                className="text-2xl font-bold leading-[1.1] tracking-tight text-balance md:text-3xl lg:text-4xl xl:text-5xl"
              >
                {currentSlide.title}
              </h1>

              <p
                data-anim
                className="max-w-xl text-sm leading-6 text-slate-200/90 md:text-base md:leading-7"
              >
                {currentSlide.description}
              </p>

              <div data-anim className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/experts"
                  className={cn(
                    "inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-medium transition-all",
                    "bg-white text-slate-900 hover:bg-white/90",
                  )}
                >
                  Explore experts
                  <ArrowRight className="ml-2 size-4" />
                </Link>
                <Link
                  href="/apply-expert"
                  className={cn(
                    "inline-flex h-10 items-center justify-center rounded-full border px-5 text-sm font-medium transition-all",
                    "border-white/30 bg-transparent text-white hover:bg-white/10",
                  )}
                >
                  Become an expert
                </Link>
              </div>
            </div>

            {/* RIGHT: compact trust panel */}
            <div className="hidden lg:block">
              <div className="rounded-3xl border border-white/12 bg-white/8 p-4 backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-200">
                      Why it feels premium
                    </p>
                    <p className="mt-1 text-base font-semibold text-white">
                      Designed for faster expert decisions
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/10 p-2 text-cyan-200">
                    <Sparkles className="size-4" />
                  </div>
                </div>
                <div className="space-y-2">
                  {trustCards.map(({ title, subtitle, icon: Icon }) => (
                    <div
                      key={title}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-200">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="text-[11px] text-slate-300">{subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center justify-between gap-3 pt-3">
            <div className="flex items-center gap-1.5">
              {carouselSlides.map((slide, index) => (
                <button
                  key={slide.image}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => setActiveSlide(index)}
                  className={`rounded-full transition-all ${
                    index === activeSlide
                      ? "h-2 w-7 bg-white"
                      : "h-2 w-2 bg-white/45 hover:bg-white/75"
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
                className="size-9 rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <ArrowLeft className="size-4" />
                <span className="sr-only">Previous slide</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={goToNext}
                className="size-9 rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <ArrowRight className="size-4" />
                <span className="sr-only">Next slide</span>
              </Button>
            </div>
          </div>
        </div>

        <a
          href="#home-after-hero"
          aria-label="Scroll to next section"
          className="group absolute inset-x-0 bottom-2 z-10 mx-auto flex w-fit flex-col items-center gap-0.5 text-white/60 transition hover:text-white"
        >
          <ChevronDown className="size-5 animate-bounce" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
