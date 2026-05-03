import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import type { NavigationSuggestion } from "@/components/modules/HomePage/search/NavigationSuggestionList";

export const resolveNavigationRoute = (item: NavigationSuggestion) => item.route;

export const navigateToSuggestion = (
  router: AppRouterInstance,
  item: NavigationSuggestion,
  onNavigate?: () => void,
) => {
  const target = resolveNavigationRoute(item);
  onNavigate?.();
  router.push(target);
};
