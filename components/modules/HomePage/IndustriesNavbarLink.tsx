"use client";

import Link from "next/link";
import {
  trackCategoryClick,
  trackIndustryExplore,
} from "@/src/lib/aiPersonalization";

export default function IndustriesNavbarLink() {
  return (
    <Link
      href="/industries"
      onClick={() => {
        trackCategoryClick("Industries");
        trackIndustryExplore("Industries");
      }}
      className="font-medium text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md"
    >
      Industries
    </Link>
  );
}
