
import ConsultationsMain from "@/components/modules/Bokings/ConsultationMain";
import { getMyBookings } from "@/src/services/bookings.service";
import { IConsultation } from "@/src/types/booking.types";

export default async function ConsultationsPage() {
 const response = await getMyBookings();
const consultations: IConsultation[] = response.data;
  return (
    <div className="px-4 py-6 md:px-6">
      <ConsultationsMain consultations={consultations} />
    </div>
  );
}
