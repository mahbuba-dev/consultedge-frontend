import { CalendarDays, MessageSquareQuote, Star, ThumbsUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { ITestimonial } from "@/src/types/testimonial.types";

interface ReviewSummaryCardsProps {
  reviews: ITestimonial[];
}

const formatLatestDate = (value: Date | null) => {
  if (!value) {
    return "No reviews yet";
  }

  return value.toLocaleDateString();
};

export default function ReviewSummaryCards({ reviews }: ReviewSummaryCardsProps) {
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / totalReviews
    : 0;
  const positiveReviews = reviews.filter((review) => Number(review.rating || 0) >= 4).length;
  const fiveStarReviews = reviews.filter((review) => Number(review.rating || 0) >= 5).length;

  const latestReviewDate = reviews.reduce<Date | null>((latest, review) => {
    const parsedDate = new Date(review.createdAt);

    if (Number.isNaN(parsedDate.getTime())) {
      return latest;
    }

    if (!latest || parsedDate > latest) {
      return parsedDate;
    }

    return latest;
  }, null);

  const summaryItems = [
    {
      label: "Total reviews",
      value: totalReviews.toString(),
      hint: "All visible client feedback",
      icon: MessageSquareQuote,
      accent: "from-blue-50 to-white text-blue-700",
    },
    {
      label: "Average rating",
      value: `${averageRating.toFixed(1)} / 5`,
      hint: "Calculated from submitted scores",
      icon: Star,
      accent: "from-amber-50 to-white text-amber-600",
    },
    {
      label: "Positive sentiment",
      value: `${totalReviews ? Math.round((positiveReviews / totalReviews) * 100) : 0}%`,
      hint: `${positiveReviews} reviews rated 4★ or higher`,
      icon: ThumbsUp,
      accent: "from-emerald-50 to-white text-emerald-700",
    },
    {
      label: "Latest feedback",
      value: formatLatestDate(latestReviewDate),
      hint: `${fiveStarReviews} five-star reviews so far`,
      icon: CalendarDays,
      accent: "from-sky-50 to-white text-sky-700",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summaryItems.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.label} className={`bg-linear-to-br ${item.accent} shadow-sm`}>
            <CardContent className="flex items-start justify-between gap-4 p-5">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold tracking-tight text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.hint}</p>
              </div>

              <div className="rounded-2xl bg-white/80 p-2 shadow-sm">
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
