"use client";

import { useMemo, useState } from "react";
import { Quote, Search, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ITestimonial } from "@/src/types/testimonial.types";

type SortKey = "date-desc" | "date-asc" | "rating-desc" | "rating-asc";

interface TestimonialsDirectoryProps {
  testimonials: ITestimonial[];
}

const formatDate = (value?: string) => {
  if (!value) return "Recently";
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
};

const getClientName = (testimonial: ITestimonial) =>
  testimonial.client?.fullName || testimonial.client?.user?.name || "Verified Client";

const getExpertName = (testimonial: ITestimonial) =>
  testimonial.expert?.fullName || "Unknown Expert";

const getClientMeta = (testimonial: ITestimonial) =>
  testimonial.client?.email || testimonial.client?.user?.email || `Client ID: ${testimonial.clientId}`;

export default function TestimonialsDirectory({ testimonials }: TestimonialsDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpert, setSelectedExpert] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("date-desc");

  const experts = useMemo(() => {
    return [...new Set(testimonials.map((item) => getExpertName(item)))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [testimonials]);

  const filteredTestimonials = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = testimonials.filter((item) => {
      const expertName = getExpertName(item);
      const clientName = getClientName(item);
      const comment = (item.comment || "").toLowerCase();
      const rating = Number(item.rating || 0);

      const matchesExpert = selectedExpert === "all" || expertName === selectedExpert;
      const matchesRating =
        selectedRating === "all" || rating === Number(selectedRating);
      const matchesSearch =
        !normalizedQuery ||
        expertName.toLowerCase().includes(normalizedQuery) ||
        clientName.toLowerCase().includes(normalizedQuery) ||
        comment.includes(normalizedQuery);

      return matchesExpert && matchesRating && matchesSearch;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      const ratingA = Number(a.rating || 0);
      const ratingB = Number(b.rating || 0);

      if (sortBy === "date-asc") return dateA - dateB;
      if (sortBy === "date-desc") return dateB - dateA;
      if (sortBy === "rating-asc") return ratingA - ratingB;
      return ratingB - ratingA;
    });
  }, [testimonials, searchQuery, selectedExpert, selectedRating, sortBy]);

  const averageRating = useMemo(() => {
    if (!filteredTestimonials.length) return 0;
    const total = filteredTestimonials.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    return total / filteredTestimonials.length;
  }, [filteredTestimonials]);

  return (
    <section className="rounded-[2.4rem] border border-slate-200/70 bg-linear-to-br from-slate-950 via-blue-950 to-cyan-950 p-6 shadow-[0_34px_100px_-50px_rgba(30,64,175,0.65)] md:p-8 lg:p-10">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
            Testimonials archive
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            What clients say after booking experts on ConsultEdge
          </h1>
          <p className="text-sm text-slate-200/90 md:text-base">
            Search, filter, and sort testimonials by expert, rating, and date.
          </p>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-cyan-100">
          {filteredTestimonials.length} results · {averageRating.toFixed(1)} avg rating
        </div>
      </div>

      <div className="mb-6 grid gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 md:grid-cols-4">
        <label className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by expert, client, or comment"
            className="h-11 w-full rounded-xl border border-white/15 bg-slate-950/30 pl-10 pr-3 text-sm text-white placeholder:text-slate-300/70 outline-none transition focus:border-cyan-400"
          />
        </label>

        <select
          value={selectedExpert}
          onChange={(e) => setSelectedExpert(e.target.value)}
          className="h-11 rounded-xl border border-white/15 bg-slate-950/30 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
        >
          <option value="all">All experts</option>
          {experts.map((expertName) => (
            <option key={expertName} value={expertName}>
              {expertName}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="h-11 rounded-xl border border-white/15 bg-slate-950/30 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
          >
            <option value="all">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="h-11 rounded-xl border border-white/15 bg-slate-950/30 px-3 text-sm text-white outline-none transition focus:border-cyan-400"
          >
            <option value="date-desc">Newest</option>
            <option value="date-asc">Oldest</option>
            <option value="rating-desc">Top rated</option>
            <option value="rating-asc">Lowest rated</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredTestimonials.map((testimonial) => {
          const clientName = getClientName(testimonial);
          const clientMeta = getClientMeta(testimonial);
          const expertName = getExpertName(testimonial);
          const clientInitials = clientName
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <article
              key={testimonial.id}
              className="group relative overflow-hidden rounded-3xl border border-white/20 bg-linear-to-b from-white/20 to-white/10 p-5 shadow-[0_20px_56px_-34px_rgba(15,23,42,0.85)] backdrop-blur transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-[11px] font-semibold text-cyan-100">
                    {clientInitials}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">{clientName}</p>
                    <p className="text-xs text-slate-300/90">{clientMeta}</p>
                    <p className="text-xs text-slate-200/80">{formatDate(testimonial.createdAt)}</p>
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-cyan-100">
                  <Quote className="size-4" />
                </div>
              </div>

              <div className="mb-3 flex items-center gap-1 text-amber-300">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`size-4 ${index < Number(testimonial.rating || 0) ? "fill-current" : "text-white/30"}`}
                  />
                ))}
              </div>

              <p className="line-clamp-6 text-sm leading-6 text-slate-100/95">
                {testimonial.comment || "A positive consultation experience shared by the client."}
              </p>

              <p className="mt-4 text-xs font-medium text-cyan-100/90">Consulted: {expertName}</p>
            </article>
          );
        })}
      </div>

      {filteredTestimonials.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/30 bg-white/5 p-6 text-center text-sm text-slate-200/90">
          No testimonials matched your filters.
        </div>
      ) : null}
    </section>
  );
}
