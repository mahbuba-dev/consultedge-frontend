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

      <div className="flex justify-center pt-2">
        <Link
          href="/admin/dashboard/industries-management"
          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-violet-500/40 dark:hover:text-violet-300"
        >
          View all industries
        </Link>
      </div>
    </div>
  );
}
