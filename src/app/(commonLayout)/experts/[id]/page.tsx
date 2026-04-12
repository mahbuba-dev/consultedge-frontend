import { notFound } from "next/navigation";

import ExpertDetails from "@/components/modules/Experts/ExpertDetails";
import { getUserInfo } from "@/src/services/auth.services";
import { getExpertById } from "@/src/services/expert.services";

import { getTestimonialsByExpert } from "@/src/services/testimonial.services";
import { getPublishedExpertAvailability, getScheduleCatalog } from "@/src/services/expertAvailability";

const ExpertDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  try {
    const [expert, currentUser, testimonials, availabilityResponse, scheduleCatalog] = await Promise.all([
      getExpertById(id),
      getUserInfo(),
      getTestimonialsByExpert(id).catch(() => []),
      getPublishedExpertAvailability(id, {
        limit: 500,
        sortBy: "createdAt",
        sortOrder: "desc",
      }).catch(() => ({ data: [] })),
      getScheduleCatalog({
        limit: 2000,
        sortBy: "createdAt",
        sortOrder: "desc",
      }).catch(() => []),
    ]);

    const availabilityRaw = Array.isArray(availabilityResponse?.data)
      ? availabilityResponse.data
      : [];

    const scheduleLookup = new Map(
      (scheduleCatalog ?? [])
        .filter((slot) => slot?.id)
        .map((slot) => [slot.id, slot]),
    );

    const availability = availabilityRaw.map((slot) => {
      if (slot?.schedule?.startDateTime) {
        return slot;
      }

      const fallback = slot?.scheduleId ? scheduleLookup.get(slot.scheduleId) : undefined;
      if (!fallback) {
        return slot;
      }

      return {
        ...slot,
        schedule: {
          id: fallback.id,
          startDateTime: fallback.startDateTime,
          endDateTime: fallback.endDateTime ?? null,
          isDeleted: fallback.isDeleted,
          deletedAt: fallback.deletedAt,
          createdAt: fallback.createdAt,
          updatedAt: fallback.updatedAt,
        },
      };
    });

    return (
      <ExpertDetails
        expert={expert}
        availability={availability}
        testimonials={testimonials}
        isLoggedIn={Boolean(currentUser)}
        userRole={currentUser?.role ?? null}
      />
    );
  } catch {
    notFound();
  }
};

export default ExpertDetailsPage;