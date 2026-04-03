"use client";

import { getExperts } from "@/src/app/(commonLayout)/experts/_actions";
import { IExpert } from "@/src/types/expert.types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";


const ExpertList = () => {
     const router = useRouter();
 const { data, isLoading } = useQuery({
    queryKey: ["experts"],
    queryFn: () => getExperts(),
  });

  console.log("Experts:", data?.data); // <-- correct

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Experts List</h1>

      <div className="mt-4 space-y-4">
        {data?.data?.map((expert:IExpert) => (
          <div key={expert.id} className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold">{expert.fullName}</h2>
            <p className="text-gray-600">{expert.title}</p>
            <p className="text-sm">{expert.industry?.name}</p>
            <button
  onClick={() => router.push(`/experts/${expert.id}`)}
  className="mt-3 rounded-md bg-[#5624d0] text-white px-3 py-1.5 text-sm font-semibold hover:bg-[#3b1a99] transition"
>
  View Details
</button>

          </div>
          
        ))}
      </div>
    </div>
  );
};

export default ExpertList;