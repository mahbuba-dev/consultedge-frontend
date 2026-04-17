"use client";

import { useState } from "react";
import BookSessionPanel from "@/components/modules/Bokings/BookSessionPanel";
import type { IExpert, IExpertAvailability } from "@/src/types/expert.types";
import type { ITestimonial } from "@/src/types/testimonial.types";

type ExpertDetailsProps = {
  expert: IExpert;
  availability?: IExpertAvailability[];
  testimonials?: ITestimonial[];
  isLoggedIn?: boolean;
  userRole?: string | null;
};

export default function BookConsultationButton({
  expert,
  availability = [],
  testimonials = [],
  isLoggedIn = false,
  userRole,
}: ExpertDetailsProps) {
  const [openBookingSignal, setOpenBookingSignal] = useState(0);

  const handleOpenBooking = () => {
    setOpenBookingSignal((prev) => prev + 1);
  };

  return (
    <div className="py-10 flex justify-center">
      {/* Only the button */}
      <button
        onClick={handleOpenBooking}
        className="px-5 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition"
      >
        Book Consultation
      </button>

      {/* Popup */}
      <BookSessionPanel
        expertId={expert.id}
        expertName={expert.fullName}
        expertTitle={expert.title}
        consultationFee={expert.consultationFee ?? expert.price}
        availability={availability}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        openSignal={openBookingSignal}
      />
    </div>
  );
}
