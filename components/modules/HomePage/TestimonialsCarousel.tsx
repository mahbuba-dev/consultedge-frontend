import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Testimonial {
  name: string;
  text: string;
  avatarUrl?: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Mahi",
    text: "ConsultEdge connected me with the perfect expert for my business challenge. Highly recommended!",
    avatarUrl: "/banner/avatar1.png",
  },
  {
    name: "Alex",
    text: "The consultation was insightful and actionable. The process was seamless.",
    avatarUrl: "/banner/avatar2.png",
  },
  {
    name: "Jordan",
    text: "Professional, reliable, and fast. I’ll use ConsultEdge again!",
    avatarUrl: "/banner/avatar3.png",
  },
];

const FADE_DURATION = 400; // ms
const INTERVAL = 4000; // ms

export default function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % testimonials.length);
        setFade(true);
        setBounce(true);
        setTimeout(() => setBounce(false), 200); // micro-bounce duration
      }, FADE_DURATION);
    }, INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const t = testimonials[index];

  return (
    <section className="w-full max-w-xl mx-auto py-12">
      <div
        className={`relative flex flex-col items-center text-center transition-opacity duration-[${FADE_DURATION}ms] ${fade ? "opacity-100" : "opacity-0"}`}
      >
        <div
          className={`mb-4 flex items-center justify-center transition-transform duration-200 ease-out ${
            bounce ? "scale-105" : "scale-100"
          }`}
        >
          <Avatar className="size-16 shadow-lg">
            {t.avatarUrl ? (
              <AvatarImage src={t.avatarUrl} alt={t.name} />
            ) : (
              <AvatarFallback>{t.name[0]}</AvatarFallback>
            )}
          </Avatar>
        </div>
        <blockquote className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">
          “{t.text}”
        </blockquote>
        <div className="text-sm font-semibold text-blue-700 dark:text-blue-300 tracking-wide">
          {t.name}
        </div>
      </div>
    </section>
  );
}
