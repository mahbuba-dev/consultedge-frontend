import IndustryCreateForm from "@/components/modules/dashboard/Industry/IndustryCreateForm";
import Link from "next/link";

export default function CreateIndustryPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create Industry</h1>

        <Link
          href="/admin/dashboard/industries-management"
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium transition hover:bg-gray-300"
        >
          Back to industries
        </Link>
      </div>

      <IndustryCreateForm />

      <div className="pt-4">
        <Link
          href="/admin/dashboard/industries-management"
          className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View All Created Industries
        </Link>
      </div>
    </div>
  );
}
