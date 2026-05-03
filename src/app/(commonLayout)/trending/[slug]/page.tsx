import Link from "next/link";

import { Badge } from "@/components/ui/badge";

interface TrendingPageProps {
  params: Promise<{ slug: string }>;
}

function toTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function TrendingTopicPage({ params }: TrendingPageProps) {
  const { slug } = await params;
  const title = toTitle(slug);

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-360 space-y-4">
        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-200">
          Trending Topic
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">{title || "Trending"}</h1>
        <p className="text-muted-foreground">
          You opened a live trending topic route. This page is ready for topic-level content modules.
        </p>
        <Link href={`/search?q=${encodeURIComponent(title)}`} className="text-sm font-medium text-cyan-700 hover:text-cyan-600 dark:text-cyan-300 dark:hover:text-cyan-200">
          View related universal search results
        </Link>
      </div>
    </main>
  );
}
