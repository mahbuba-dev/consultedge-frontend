// import { getExpertById } from "../_actions";

// export default async function ExpertDetails({
//   params,
// }: {
//   params: { id: string };
// }) {
//   const expert = await getExpertById(params.id);

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold">{expert.fullName}</h1>
//       <p className="text-gray-600">{expert.title}</p>

//       <div className="mt-4">
//         <p className="text-lg">{expert.bio}</p>
//       </div>

//       <div className="mt-6">
//         <p className="font-semibold">Industry: {expert.industry?.name}</p>
//         <p className="font-semibold">Experience: {expert.experience} years</p>
//         <p className="font-semibold">
//           Consultation Fee: ${expert.consultationFee}
//         </p>
//       </div>
//     </div>
//   );
// }


export default function details() {
  return (
    <div>details</div>
  )
}