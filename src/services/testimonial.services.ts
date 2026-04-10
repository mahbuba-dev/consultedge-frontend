import { httpClient } from "../lib/axious/httpClient";
import type { ITestimonial } from "../types/testimonial.types";

export const getAllTestimonials = async (
  limit = 6
): Promise<ITestimonial[]> => {
  const response = await httpClient.get<ITestimonial[]>("/testimonials", {
    params: {
      limit,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
  });

  return Array.isArray(response.data) ? response.data : [];
};

export const getTestimonialsByExpert = async (
  expertId: string
): Promise<ITestimonial[]> => {
  const response = await httpClient.get<ITestimonial[]>(
    `/testimonials/expert/${expertId}`
  );

  return Array.isArray(response.data) ? response.data : [];
};
