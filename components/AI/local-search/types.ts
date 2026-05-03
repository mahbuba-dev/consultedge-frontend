export type SearchDropdownItemType =
  | "expert"
  | "industry"
  | "testimonial"
  | "trending"
  | "recent";

export interface SearchDropdownItem {
  id: string;
  type: SearchDropdownItemType;
  label: string;
  subLabel?: string;
  expertId?: string;
  slug?: string;
  matchScore?: number;
}
