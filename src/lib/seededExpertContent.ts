import type { IExpert, IExpertAvailability } from "@/src/types/expert.types";
import type { ITestimonial } from "@/src/types/testimonial.types";

export const PLACEHOLDER_SLOT_PREFIX = "placeholder-slot-";
export const PLACEHOLDER_TESTIMONIAL_PREFIX = "placeholder-review-";

export const isPlaceholderSlotId = (id?: string | null) =>
  Boolean(id && id.startsWith(PLACEHOLDER_SLOT_PREFIX));

export const isPlaceholderTestimonialId = (id?: string | null) =>
  Boolean(id && id.startsWith(PLACEHOLDER_TESTIMONIAL_PREFIX));

const SLOT_PLAN: { dayOffset: number; hour: number; minute: number; durationMinutes: number }[] = [
  { dayOffset: 1, hour: 10, minute: 0, durationMinutes: 60 },
  { dayOffset: 1, hour: 14, minute: 30, durationMinutes: 60 },
  { dayOffset: 2, hour: 11, minute: 0, durationMinutes: 60 },
  { dayOffset: 3, hour: 9, minute: 30, durationMinutes: 60 },
  { dayOffset: 3, hour: 16, minute: 0, durationMinutes: 60 },
  { dayOffset: 5, hour: 13, minute: 0, durationMinutes: 60 },
];

const REVIEW_TEMPLATES: { name: string; rating: number; comment: string; daysAgo: number }[] = [
  {
    name: "Arjun Mehta",
    rating: 5,
    comment:
      "Incredibly clear, structured advice. Walked away with a concrete plan and renewed confidence in my next steps.",
    daysAgo: 6,
  },
  {
    name: "Priya Sharma",
    rating: 5,
    comment:
      "Exactly the kind of practical, no-fluff guidance I was looking for. The session felt tailored to my exact situation.",
    daysAgo: 14,
  },
  {
    name: "Daniel Carter",
    rating: 4,
    comment:
      "Sharp insights and a friendly tone. Made a complex topic feel approachable and gave me clear action items.",
    daysAgo: 23,
  },
];

const startOfTomorrow = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  today.setDate(today.getDate() + 1);
  return today;
};

const toIso = (date: Date) => date.toISOString();

export const buildSeededAvailability = (expert: Pick<IExpert, "id">): IExpertAvailability[] => {
  const baseDate = startOfTomorrow();
  const nowIso = new Date().toISOString();

  return SLOT_PLAN.map((plan, index) => {
    const start = new Date(baseDate);
    start.setDate(start.getDate() + plan.dayOffset);
    start.setHours(plan.hour, plan.minute, 0, 0);

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + plan.durationMinutes);

    const slotId = `${PLACEHOLDER_SLOT_PREFIX}${expert.id}-${index}`;
    const scheduleId = `${PLACEHOLDER_SLOT_PREFIX}schedule-${expert.id}-${index}`;

    return {
      id: slotId,
      expertId: expert.id,
      scheduleId,
      consultationId: null,
      isBooked: false,
      isPublished: true,
      isDeleted: false,
      deletedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
      schedule: {
        id: scheduleId,
        startDateTime: toIso(start),
        endDateTime: toIso(end),
        isDeleted: false,
        deletedAt: null,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      expert: null,
      consultation: null,
    };
  });
};

export const buildSeededTestimonials = (
  expert: Pick<IExpert, "id" | "fullName" | "title">,
): ITestimonial[] => {
  const now = new Date();

  return REVIEW_TEMPLATES.map((template, index) => {
    const created = new Date(now);
    created.setDate(created.getDate() - template.daysAgo);

    return {
      id: `${PLACEHOLDER_TESTIMONIAL_PREFIX}${expert.id}-${index}`,
      rating: template.rating,
      comment: template.comment,
      clientId: `${PLACEHOLDER_TESTIMONIAL_PREFIX}client-${index}`,
      expertId: expert.id,
      reviewerName: template.name,
      reviewerImage: null,
      consultationId: `${PLACEHOLDER_TESTIMONIAL_PREFIX}consultation-${expert.id}-${index}`,
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
      isHidden: false,
      status: "APPROVED",
      expertReply: null,
      moderationStatus: "APPROVED",
      client: {
        id: `${PLACEHOLDER_TESTIMONIAL_PREFIX}client-${index}`,
        fullName: template.name,
        email: undefined,
        user: { name: template.name },
      },
      expert: expert.fullName
        ? { id: expert.id, fullName: expert.fullName, title: expert.title }
        : null,
      consultation: null,
    } satisfies ITestimonial;
  });
};
