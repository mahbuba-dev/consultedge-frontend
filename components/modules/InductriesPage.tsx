"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllIndustries } from "@/src/services/industry.services";
export default function IndustriesPage() {
  const { data: industriesResponse, isLoading } = useQuery({
    queryKey: ["industries"],
    queryFn: getAllIndustries,
  });

  const industries = industriesResponse?.data || [];

  if (isLoading) {
    return <div className="p-6 text-center">Loading industries...</div>;
  }

  return (
    <div className="max-w-360 mx-auto p-6">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Industries</h1>
        <p className="text-gray-600 mt-2">
          Explore different industries we work with
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {industries.map((industry: any) => (
          <div
            key={industry.id}
            className="border rounded-xl p-4 hover:shadow-md transition bg-white"
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              {industry.icon ? (
                <img
                  src={industry.icon}
                  alt={industry.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg text-gray-400">
                  No Icon
                </div>
              )}
            </div>

            {/* Content */}
            <h2 className="text-lg font-semibold text-center">
              {industry.name}
            </h2>

            <p className="text-sm text-gray-600 mt-2 text-center line-clamp-3">
              {industry.description}
            </p>

            {/* Optional meta info */}
            <div className="mt-4 text-xs text-gray-400 text-center">
              {industry.createdAt}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {industries.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          No industries found.
        </div>
      )}
    </div>
  );
}