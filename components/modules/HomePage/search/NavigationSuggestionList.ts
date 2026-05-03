import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Building2,
  CircleHelp,
  Compass,
  FileSignature,
  Info,
  Layers3,
  MessageCircle,
  Rows3,
  Send,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";

export interface NavigationSuggestion {
  id: string;
  label: string;
  description?: string;
  route: string;
  icon: LucideIcon;
  keywords?: string[];
}

export const NAVIGATION_SUGGESTIONS: NavigationSuggestion[] = [
  {
    id: "contact",
    label: "Contact",
    description: "Reach out to the ConsultEdge team",
    route: "/contact",
    icon: MessageCircle,
    keywords: ["contact", "support", "help", "con"],
  },
  {
    id: "expert-apply",
    label: "Expert Apply Form",
    description: "Apply to join as a verified expert",
    route: "/apply-expert",
    icon: FileSignature,
    keywords: ["apply", "application", "expert", "join"],
  },
  {
    id: "home-experts",
    label: "Recommended Experts Section",
    description: "Jump to the smart experts block on homepage",
    route: "/#experts-showcase",
    icon: Users,
    keywords: ["home experts", "recommended", "experts section"],
  },
  {
    id: "home-testimonials",
    label: "Homepage Testimonials",
    description: "Jump to testimonial highlights on homepage",
    route: "/#home-testimonials",
    icon: Rows3,
    keywords: ["home testimonial", "review section", "client feedback"],
  },
  {
    id: "trending",
    label: "Trending Experts",
    description: "See top-trending profiles and specialties",
    route: "/#trending-experts",
    icon: TrendingUp,
    keywords: ["trending", "popular", "trend"],
  },
  {
    id: "insights-home",
    label: "Insights Section",
    description: "Jump to curated insights section on homepage",
    route: "/#insights-section",
    icon: Compass,
    keywords: ["insights section", "reads", "content"],
  },
  {
    id: "engagement-home",
    label: "Engagement Options",
    description: "Jump to flexible engagement cards on homepage",
    route: "/#engagement-section",
    icon: Layers3,
    keywords: ["engagement", "plans", "pricing"],
  },
  {
    id: "newsletter-home",
    label: "Newsletter Section",
    description: "Jump to weekly digest signup on homepage",
    route: "/#newsletter-section",
    icon: Send,
    keywords: ["newsletter", "subscribe", "digest"],
  },
  {
    id: "insights-page",
    label: "Insights",
    description: "Open all insights in one place",
    route: "/insights",
    icon: BookOpen,
    keywords: ["insights", "articles", "playbooks"],
  },
  {
    id: "industries",
    label: "All Industries",
    description: "Browse every supported industry",
    route: "/industries",
    icon: Building2,
    keywords: ["industries", "industry", "sector", "ind"],
  },
  {
    id: "experts",
    label: "All Experts",
    description: "Explore the full expert directory",
    route: "/experts",
    icon: Users,
    keywords: ["experts", "directory", "consultants"],
  },
  {
    id: "process",
    label: "Process",
    description: "Learn how ConsultEdge works",
    route: "/process",
    icon: Workflow,
    keywords: ["process", "workflow", "steps", "how"],
  },
  {
    id: "about",
    label: "About",
    description: "Discover the ConsultEdge mission",
    route: "/about",
    icon: Info,
    keywords: ["about", "company", "mission"],
  },
  {
    id: "faq",
    label: "FAQ",
    description: "Find quick answers to common questions",
    route: "/#faq-section",
    icon: CircleHelp,
    keywords: ["faq", "questions", "answers", "help"],
  },
];

const fuzzyIncludes = (query: string, target: string) => {
  if (!query) return true;
  const normalizedQuery = query.toLowerCase();
  const normalizedTarget = target.toLowerCase();

  if (normalizedTarget.includes(normalizedQuery)) {
    return true;
  }

  let queryIndex = 0;
  for (let i = 0; i < normalizedTarget.length; i += 1) {
    if (normalizedTarget[i] === normalizedQuery[queryIndex]) {
      queryIndex += 1;
      if (queryIndex === normalizedQuery.length) {
        return true;
      }
    }
  }

  return false;
};

export const filterNavigationSuggestions = (query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return NAVIGATION_SUGGESTIONS;
  }

  return NAVIGATION_SUGGESTIONS.map((item, index) => {
    const bag = [item.label, item.description, ...(item.keywords ?? [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    let score = 0;
    if (item.label.toLowerCase().startsWith(normalizedQuery)) score += 100;
    if (bag.includes(normalizedQuery)) score += 50;
    if (fuzzyIncludes(normalizedQuery, item.label)) score += 35;
    if (item.keywords?.some((keyword) => fuzzyIncludes(normalizedQuery, keyword))) score += 25;

    return { item, index, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return a.index - b.index;
    })
    .map((entry) => entry.item);
};
