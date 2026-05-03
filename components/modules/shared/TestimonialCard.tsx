import { format } from "date-fns";
import { Quote, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ITestimonial } from "@/src/types/testimonial.types";

interface TestimonialCardProps {
  testimonial: ITestimonial;
  compact?: boolean;
}

const getReviewerName = (testimonial: ITestimonial) =>
  testimonial.reviewerName ||
  testimonial.client?.fullName ||
  testimonial.client?.user?.name ||
  "Verified Client";

const getFormattedDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : format(parsedDate, "dd MMM yyyy");
};

const TestimonialCard = ({ testimonial, compact = false }: TestimonialCardProps) => {
  const reviewerName = getReviewerName(testimonial);
  const reviewDate = getFormattedDate(testimonial.createdAt) || "Recently";

  return (
    <Card className="h-full border-border/60 bg-card/95 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/85 dark:shadow-black/20">
      <CardContent className={compact ? "space-y-3 p-4" : "space-y-3 p-5"}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">{reviewerName}</p>
            <p className="text-xs text-muted-foreground">{reviewDate}</p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-blue-100 to-sky-100 text-blue-700 dark:from-blue-500/20 dark:to-cyan-500/20 dark:text-blue-200">
            <Quote className="size-4" />
          </div>
        </div>

        <div className="flex items-center gap-1 text-amber-500">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`size-4 ${index < Number(testimonial.rating || 0) ? "fill-current" : "text-muted-foreground/40"}`}
            />
          ))}
          <span className="ml-1 text-xs font-medium text-muted-foreground">
            {Number(testimonial.rating || 0).toFixed(1)} / 5
          </span>
        </div>

        <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
          {testimonial.comment || "A positive consultation experience shared by the client."}
        </p>

        <div className="flex flex-wrap gap-2">
          {testimonial.expert?.fullName ? (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
              For {testimonial.expert.fullName}
            </Badge>
          ) : null}

          {testimonial.isHidden ? (
            <Badge variant="outline" className="border-amber-200 text-amber-700">
              Hidden from public view
            </Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
