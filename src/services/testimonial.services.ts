import { httpClient } from "../lib/axious/httpClient";
import { ApiResponse } from "../types/api.types";

import type { ITestimonial } from "../types/testimonial.types";

type ApiPayload<TData> = ApiResponse<TData> | { data?: TData } | TData;

// ------------------------------
// ADMIN UPDATE REVIEW STATUS
// ------------------------------
export const updateTestimonialStatus = async (
  testimonialId: string,
  status: "APPROVED" | "HIDDEN"
) => {
  if (!testimonialId) throw new Error("A valid review ID is required.");
  const response = await httpClient.patch<ITestimonial>(`/testimonials/${testimonialId}/status`, { status });
  return extractData(response) ?? response;
};

// ------------------------------
// HELPERS
// ------------------------------
const normalizeTestimonials = (payload: ITestimonial[] | undefined) =>
  Array.isArray(payload) ? payload : [];

// Extract actual data from backend response
const extractData = <TData>(response: ApiPayload<TData> | undefined): TData | undefined => {
  if (!response) {
    return undefined;
  }

  if (typeof response === "object" && response !== null && "data" in response) {
    const payload = response as { data?: TData | { data?: TData } };

    if (
      typeof payload.data === "object" &&
      payload.data !== null &&
      "data" in payload.data
    ) {
      return (payload.data as { data?: TData }).data;
    }

    return payload.data as TData | undefined;
  }

  return response as TData;
};

// ------------------------------
// GENERIC REQUEST HANDLER
// ------------------------------
const requestTestimonials = async (
  endpoint: string,
  params?: Record<string, unknown>
): Promise<ITestimonial[]> => {
  const response = await httpClient.get<ITestimonial[]>(endpoint, {
    params,
    silent: true,
  });

  return normalizeTestimonials(extractData<ITestimonial[]>(response));
};

// ------------------------------
// CREATE TESTIMONIAL ✅ (FIXED)
// ------------------------------
export const createTestimonial = async (payload: {
  rating: number;
  comment: string;
  consultationId: string;
}): Promise<ITestimonial> => {
  const response = await httpClient.post<ITestimonial>("/testimonials", payload);

  const testimonial = extractData<ITestimonial>(response);

  if (!testimonial) {
    throw new Error("Invalid testimonial response from the server.");
  }

  return testimonial;
};

// ------------------------------
// GET ALL TESTIMONIALS
// ------------------------------
export const getAllTestimonials = async (
  limit = 6
): Promise<ITestimonial[]> => {
  const params = {
    limit,
    sortBy: "createdAt",
    sortOrder: "desc",
  };

  try {
    return await requestTestimonials("/testimonials", params);
  } catch (error: any) {
    if (error?.response?.status === 404) {
      try {
        return await requestTestimonials("/testimonials", params);
      } catch (fallbackError: any) {
        if (fallbackError?.response?.status === 404) {
          return [];
        }
        throw fallbackError;
      }
    }
    throw error;
  }
};

export const getAllTestimonialsForAdmin = async (
  limit = 100
): Promise<ITestimonial[]> => {
  const params = {
    limit,
    sortBy: "createdAt",
    sortOrder: "desc",
  };
const res=  await requestTestimonials("/testimonials/admin", params);
console.log(res);
return res;
};

// ------------------------------
// GET TESTIMONIALS BY EXPERT
// ------------------------------
// export const getTestimonialsByExpert = async (
//   expertId: string
// ): Promise<ITestimonial[]> => {
//   if (!expertId) return [];

//   try {
//     return await requestTestimonials(`/testimonials/expert/${expertId}`);
//   } catch (error: any) {
//     const status = error?.response?.status;

//     // ✅ treat "not found" as empty list (normal case)
//     if (status === 404) {
//       return [];
//     }

//     // ❌ everything else is a real error
//     throw error;
//   }
// };


export const getTestimonialsByExpert = async (
  expertId: string
): Promise<ITestimonial[]> => {
  const response = await httpClient.get<ITestimonial[]>(
    `/testimonials/expert/${expertId}`
  );

  const data = extractData<ITestimonial[]>(response);

  return Array.isArray(data) ? data : [];
};



// ------------------------------
// REPLY TO TESTIMONIAL
export const replyToTestimonial = async (
  testimonialId: string,
  payload: { expertReply: string }
): Promise<ApiResponse<ITestimonial>> => {
  if (!testimonialId) {
    throw new Error("Testimonial ID is required.");
  }

  const response = await httpClient.patch<ITestimonial>(
    `/testimonials/${testimonialId}/reply`,
    payload
  );

  return response;
};










