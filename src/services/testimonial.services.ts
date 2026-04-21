import { httpClient } from "../lib/axious/httpClient";
import { ApiResponse } from "../types/api.types";

import type { ITestimonial } from "../types/testimonial.types";

type ApiPayload<TData> = ApiResponse<TData> | { data?: TData } | TData;

type TestimonialCollectionShape = {
  data?: unknown;
  testimonials?: unknown;
  items?: unknown;
  result?: unknown;
  results?: unknown;
  rows?: unknown;
};

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

const extractTestimonialCollection = (payload: unknown): ITestimonial[] => {
  if (Array.isArray(payload)) {
    return payload as ITestimonial[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const candidate = payload as TestimonialCollectionShape;
  const pools = [
    candidate.data,
    candidate.testimonials,
    candidate.items,
    candidate.result,
    candidate.results,
    candidate.rows,
  ];

  for (const pool of pools) {
    if (Array.isArray(pool)) {
      return pool as ITestimonial[];
    }

    if (pool && typeof pool === "object") {
      const nested = pool as TestimonialCollectionShape;

      if (Array.isArray(nested.data)) return nested.data as ITestimonial[];
      if (Array.isArray(nested.testimonials)) return nested.testimonials as ITestimonial[];
      if (Array.isArray(nested.items)) return nested.items as ITestimonial[];
      if (Array.isArray(nested.result)) return nested.result as ITestimonial[];
      if (Array.isArray(nested.results)) return nested.results as ITestimonial[];
      if (Array.isArray(nested.rows)) return nested.rows as ITestimonial[];
    }
  }

  return [];
};

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

  return normalizeTestimonials(
    extractTestimonialCollection(extractData<unknown>(response) ?? response),
  );
};

const mergeTestimonialsById = (items: ITestimonial[]) => {
  const unique = new Map<string, ITestimonial>();

  items.forEach((item) => {
    if (item?.id) {
      unique.set(item.id, item);
    }
  });

  return [...unique.values()];
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
  if (!expertId) {
    return [];
  }

  try {
    return await requestTestimonials(`/testimonials/expert/${expertId}`);
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return [];
    }

    throw error;
  }
};

export const getTestimonialsForExpertContext = async (
  identifiers: Array<string | null | undefined>,
): Promise<ITestimonial[]> => {
  const uniqueIdentifiers = [...new Set(identifiers.filter(Boolean) as string[])];

  if (uniqueIdentifiers.length === 0) {
    return [];
  }

  const collected: ITestimonial[] = [];

  for (const identifier of uniqueIdentifiers) {
    try {
      const byPath = await getTestimonialsByExpert(identifier);

      if (byPath.length > 0) {
        collected.push(...byPath);
      }
    } catch {
      // Try query-param based lookup next.
    }

    try {
      const byExpertId = await requestTestimonials("/testimonials", {
        expertId: identifier,
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (byExpertId.length > 0) {
        collected.push(...byExpertId);
      }
    } catch {
      // Try userId-based lookup next.
    }

    try {
      const byUserId = await requestTestimonials("/testimonials", {
        userId: identifier,
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (byUserId.length > 0) {
        collected.push(...byUserId);
      }
    } catch {
      // Ignore unsupported filter variants.
    }
  }

  return mergeTestimonialsById(collected);
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










