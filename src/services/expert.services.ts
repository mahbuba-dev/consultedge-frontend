
import {
  type IExpertApplication,
  type ExpertVerificationStatus,
  IApplyExpertPayload,
  IExpert,
  IReviewExpertApplicationPayload,
  IVerifyExpertPayload,
} from "@/src/types/expert.types";
import { httpClient } from "../lib/axious/httpClient";
import type { ApiResponse } from "../types/api.types";
import axios from "axios";

const getErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) return "";
  const data = error.response?.data as
    | { message?: string; error?: string; field?: string }
    | string
    | undefined;

  if (typeof data === "string") return data;
  return String(data?.message ?? data?.error ?? "");
};

const isUnexpectedFieldError = (error: unknown) => {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes("unexpected field") || message.includes("unknown field");
};

const getAllFormDataValues = (payload: FormData, key: string): FormDataEntryValue[] => {
  const values: FormDataEntryValue[] = [];
  payload.forEach((value, currentKey) => {
    if (currentKey === key) values.push(value);
  });
  return values;
};

const cloneWithFileKeyAliases = (
  payload: FormData,
  aliases: { profilePhoto?: string; resume?: string },
) => {
  const next = new FormData();
  const profileValues = getAllFormDataValues(payload, "profilePhoto");
  const resumeValues = getAllFormDataValues(payload, "resume");

  payload.forEach((value, key) => {
    if (key === "profilePhoto" || key === "resume") return;
    next.append(key, value);
  });

  if (aliases.profilePhoto) {
    profileValues.forEach((value) => next.append(aliases.profilePhoto!, value));
  }

  if (aliases.resume) {
    resumeValues.forEach((value) => next.append(aliases.resume!, value));
  }

  return next;
};

const getPayloadVariants = (payload: IApplyExpertPayload | FormData) => {
  if (!(payload instanceof FormData)) return [payload];

  return [
    payload,
    cloneWithFileKeyAliases(payload, { profilePhoto: "image", resume: "resume" }),
    cloneWithFileKeyAliases(payload, { profilePhoto: "photo", resume: "resume" }),
    cloneWithFileKeyAliases(payload, { profilePhoto: "profileImage", resume: "resume" }),
    cloneWithFileKeyAliases(payload, { profilePhoto: "profilePhoto", resume: "cv" }),
    cloneWithFileKeyAliases(payload, { profilePhoto: undefined, resume: "resume" }),
    cloneWithFileKeyAliases(payload, { profilePhoto: "profilePhoto", resume: undefined }),
  ];
};

export interface IExpertQueryParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: unknown;
}

export interface IExpertApplicationQueryParams {
  page?: number;
  limit?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  industryId?: string;
  reviewedBy?: string;
  searchTerm?: string;
  sortBy?: "createdAt" | "updatedAt" | "reviewedAt" | "fullName";
  sortOrder?: "asc" | "desc";
  [key: string]: unknown;
}

export const getExperts = async (params?: IExpertQueryParams | string): Promise<ApiResponse<IExpert[]>> => {
  // Support legacy string queryString as well as new object params
  if (typeof params === "string") {
    const res = await httpClient.get<IExpert[]>(
      params ? `/experts?${params}` : "/experts",
    );
    return res;
  }

  const res = await httpClient.get<IExpert[]>("/experts", {
    params: (params ?? {}) as Record<string, unknown>,
    silent: true,
  });
  return res;
};

export const getExpertById = async (id: string) => {
  const res = await httpClient.get<IExpert>(`/experts/${id}`);
  return res.data;
};

export const getExpertApplications = async (
  params: IExpertApplicationQueryParams = {},
): Promise<ApiResponse<IExpertApplication[]>> => {
  const res = await httpClient.get<IExpertApplication[]>("/expert-verification/applications", {
    params: params as Record<string, unknown>,
    silent: true,
  });

  return {
    ...res,
    data: Array.isArray(res.data) ? res.data : [],
  };
};

export const getNewApplicants = async (
  params: Omit<IExpertApplicationQueryParams, "status"> = {},
): Promise<ApiResponse<IExpertApplication[]>> => {
  try {
    const res = await httpClient.get<IExpertApplication[]>("/expert-verification/new-applicants", {
      params: params as Record<string, unknown>,
      silent: true,
    });

    return {
      ...res,
      data: Array.isArray(res.data) ? res.data : [],
    };
  } catch {
    return getExpertApplications({
      ...params,
      status: "PENDING",
    });
  }
};

export const reviewExpertApplicationAction = async (
  applicationId: string,
  payload: IReviewExpertApplicationPayload,
) => {
  const normalizedPayload: IReviewExpertApplicationPayload = {
    status: payload.status,
    ...(payload.notes?.trim() ? { notes: payload.notes.trim() } : {}),
  };

  const res = await httpClient.patch(
    `/expert-verification/applications/${applicationId}/review`,
    normalizedPayload,
  );

  return res.data;
};






export async function applyExpertAction(payload: IApplyExpertPayload | FormData) {
  const applyEndpoints = [
    "/expert-verification/applications",
    "/experts/apply",
    "/experts/apply-expert",
    "/expert-verification/apply",
  ];

  const payloadVariants = getPayloadVariants(payload);
  let lastError: unknown;

  for (let endpointIndex = 0; endpointIndex < applyEndpoints.length; endpointIndex += 1) {
    const endpoint = applyEndpoints[endpointIndex];

    for (let payloadIndex = 0; payloadIndex < payloadVariants.length; payloadIndex += 1) {
      const variant = payloadVariants[payloadIndex];

      try {
        const res = await httpClient.post(endpoint, variant, {
          silent: true,
          expectedStatuses: [400, 404, 401, 403, 413, 422],
        });

        const responseData = res.data as unknown;
        if (responseData && typeof responseData === "object" && !Array.isArray(responseData)) {
          return {
            ...(responseData as Record<string, unknown>),
            __debugApplyEndpoint: endpoint,
            __debugPayloadVariant: payloadIndex,
          };
        }

        return {
          data: responseData,
          __debugApplyEndpoint: endpoint,
          __debugPayloadVariant: payloadIndex,
        };
      } catch (error) {
        lastError = error;
        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;
        const hasNextPayloadVariant = payloadIndex < payloadVariants.length - 1;
        const hasNextEndpoint = endpointIndex < applyEndpoints.length - 1;

        if (status === 404 && hasNextEndpoint) {
          break;
        }

        if (isUnexpectedFieldError(error) && hasNextPayloadVariant) {
          continue;
        }

        if (status === 422 && hasNextPayloadVariant) {
          continue;
        }

        if (status === 404 && !hasNextEndpoint) {
          continue;
        }

        throw error;
      }
    }
  }

  if (lastError) throw lastError;
  throw new Error("Unable to submit expert application.");
}

export async function verifyExpertAction(expertId: string, payload: IVerifyExpertPayload) {
  const normalizedPayload: IVerifyExpertPayload = {
    status: String(payload.status).toUpperCase() as ExpertVerificationStatus,
    ...(payload.notes?.trim() ? { notes: payload.notes.trim() } : {}),
  };

  const res = await httpClient.patch(
    `/expert-verification/verify/${expertId}`,
    normalizedPayload,
  );

  return res.data;
}

export async function deleteExpertAction(expertId: string) {
  const res = await httpClient.delete(`/experts/${expertId}`);
  return res.data;
}
