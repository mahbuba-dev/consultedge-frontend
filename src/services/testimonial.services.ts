import { httpClient } from "../lib/axious/httpClient";
import { ApiResponse } from "../types/api.types";
import { getAllClients } from "./client.service";

import type { ITestimonial } from "../types/testimonial.types";

type ApiPayload<TData> = ApiResponse<TData> | { data?: TData } | TData;

type TestimonialCollectionShape = {
  data?: unknown;
  testimonials?:unknown;
  items?: unknown;
  result?: unknown;
  results?:unknown;
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

const getReviewerEmail = (item: ITestimonial) =>
  item.client?.email ?? item.client?.user?.email ?? "";

const enrichTestimonialsWithClientDirectory = async (
  items: ITestimonial[],
): Promise<ITestimonial[]> => {
  const missingClientIds = [...new Set(
    items
      .filter((item) => !getReviewerEmail(item) && Boolean(item.clientId))
      .map((item) => item.clientId),
  )];

  if (missingClientIds.length === 0) {
    return items;
  }

  try {
    const clientsResponse = await getAllClients({
      page: 1,
      limit: 500,
    });

    const clients = Array.isArray(clientsResponse?.data) ? clientsResponse.data : [];
    if (clients.length === 0) {
      return items;
    }

    const clientsById = new Map(
      clients.map((client) => [String(client.id), client]),
    );

    return items.map((item) => {
      if (getReviewerEmail(item)) {
        return item;
      }

      const fallbackClient = clientsById.get(String(item.clientId));
      if (!fallbackClient) {
        return item;
      }

      return {
        ...item,
        client: {
          id: item.client?.id ?? String(fallbackClient.id),
          fullName:
            item.client?.fullName ??
            fallbackClient.fullName ??
            fallbackClient.name ??
            fallbackClient.user?.name ??
            undefined,
          email:
            item.client?.email ??
            fallbackClient.email ??
            fallbackClient.user?.email ??
            undefined,
          user: item.client?.user ?? fallbackClient.user,
        },
      };
    });
  } catch {
    return items;
  }
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

export interface ITestimonialAdminQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
  [key: string]: unknown;
}

export const getAllTestimonialsForAdmin = async (
  params: ITestimonialAdminQueryParams = {},
): Promise<ITestimonial[]> => {
  const includeRelations = ["client", "client.user", "expert", "consultation"];

  const requestParams = {
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...params,
    include: includeRelations.join(","),
    includes: includeRelations.join(","),
    populate: includeRelations.join(","),
    expand: includeRelations.join(","),
  };

  const testimonials = await requestTestimonials("/testimonials/admin", requestParams);
  return enrichTestimonialsWithClientDirectory(testimonials);
};

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

  // Only use the filtered path-based endpoint (`/testimonials/expert/:expertId`).
  // The generic `/testimonials` endpoint does not enforce the `expertId` /
  // `userId` query params on the backend, so falling back to it returns every
  // testimonial in the database — which leaks reviews across users.
  const collected: ITestimonial[] = [];

  for (const identifier of uniqueIdentifiers) {
    try {
      const byPath = await getTestimonialsByExpert(identifier);

      if (byPath.length > 0) {
        collected.push(...byPath);
      }
    } catch {
      // Identifier wasn't a valid expertId — skip it.
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

  // Different backends expose different shapes for this endpoint. Try the
  // common variants in sequence and return on the first success.
  const attempts: Array<() => Promise<ApiResponse<ITestimonial>>> = [
    () =>
      httpClient.patch<ITestimonial>(
        `/testimonials/${testimonialId}/reply`,
        payload,
        { silent: true },
      ),
    () =>
      httpClient.put<ITestimonial>(
        `/testimonials/${testimonialId}/reply`,
        payload,
        { silent: true },
      ),
    () =>
      httpClient.post<ITestimonial>(
        `/testimonials/${testimonialId}/reply`,
        payload,
        { silent: true },
      ),
    () =>
      httpClient.patch<ITestimonial>(
        `/testimonials/${testimonialId}`,
        payload,
        { silent: true },
      ),
    () =>
      httpClient.put<ITestimonial>(
        `/testimonials/${testimonialId}`,
        payload,
        { silent: true },
      ),
  ];

  let lastError: unknown;
  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (error: any) {
      const status = error?.response?.status;
      lastError = error;
      // Only fall through on 404/405 (route/method mismatch). Other errors are
      // real failures (validation, auth) and should surface immediately.
      if (status !== 404 && status !== 405) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("Reply endpoint unavailable.");
};










