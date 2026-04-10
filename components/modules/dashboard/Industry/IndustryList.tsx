"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllIndustries } from "@/src/services/industry.services";
import Link from "next/link";
import DateCell from "../../shared/Cell/DataCell";

export default function IndustryList() {
  const { data: industriesResponse } = useQuery({
    queryKey: ["industries"],
    queryFn: getAllIndustries,
    refetchOnWindowFocus: "always",
  });

  const industries = industriesResponse?.data || [];

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Icon</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-left">Created</th>
            <th className="p-3 text-left">Updated</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {industries.map((industry: any) => (
            <tr key={industry.id} className="border-t">
              <td className="p-3">
                {industry.icon ? (
                  <img src={industry.icon} className="w-10 h-10 rounded" />
                ) : (
                  <span className="text-gray-400">No Icon</span>
                )}
              </td>

              <td className="p-3 font-medium">{industry.name}</td>
              <td className="p-3 text-gray-600">{industry.description}</td>

              <td className="p-3">
                <DateCell date={industry.createdAt} />
              </td>

              <td className="p-3">
                <DateCell date={industry.updatedAt} />
              </td>

              <td className="p-3 space-x-3">
                <Link
                  href={`/admin/industries-management/${industry.id}/edit`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>

                <button className="text-red-600 hover:underline">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
