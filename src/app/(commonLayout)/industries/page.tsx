import { getAllIndustries } from "@/src/services/industry.services";
import type { IIndustry } from "@/src/types/industry.types";
import Image from "next/image";

export default async function IndustriesPage() {
  const industries: IIndustry[] = await getAllIndustries();

  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50 py-12 px-4 md:px-12">
      <section className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-gray-900">
          Explore All Industries
        </h1>
        <p className="text-center text-lg text-gray-600 mb-12">
          Discover a wide range of industries and find the right experts for your needs.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {industries.map((industry) => (
            <div
              key={industry.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 flex flex-col items-center text-center border border-gray-100 group"
            >
              {industry.icon && (
                <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-gray-50 group-hover:bg-blue-50 transition-colors">
                  <Image
                    src={industry.icon}
                    alt={industry.name}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                {industry.name}
              </h2>
              <p className="text-gray-500 text-sm mb-4 line-clamp-3 min-h-15">
                {industry.description}
              </p>
              <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                {industry.expertsCount ?? 0} Experts
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
