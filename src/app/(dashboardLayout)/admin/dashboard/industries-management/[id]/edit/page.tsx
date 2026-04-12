import Link from "next/link";

import IndustryEditForm from "@/components/modules/dashboard/Industry/IndustryEditForm";

type EditIndustryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditIndustryPage({ params }: EditIndustryPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Industry</h1>

        <Link
          href="/admin/dashboard/industries-management"
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium transition hover:bg-gray-300"
        >
          Back to industries
        </Link>
      </div>

      <IndustryEditForm industryId={id} />
    </div>
  );
}
