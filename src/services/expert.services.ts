
import {
  type ExpertVerificationStatus,
  IApplyExpertPayload,
  IExpert,
  IVerifyExpertPayload,
} from "@/src/types/expert.types";
import { httpClient } from "../lib/axious/httpClient";
import type { ApiResponse } from "../types/api.types";
import axios from "axios";

export interface IExpertQueryParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortBy?: string;
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






export async function applyExpertAction(payload: IApplyExpertPayload | FormData) {
  const applyEndpoints = [
    "/experts/apply",
    "/experts/apply-expert",
    "/expert-verification/apply",
  ];

  for (let index = 0; index < applyEndpoints.length; index += 1) {
    const endpoint = applyEndpoints[index];

    try {
      const res = await httpClient.post(endpoint, payload, {
        silent: true,
        expectedStatuses: [400, 404, 401, 403, 413, 422],
      });

      const responseData = res.data as unknown;
      if (responseData && typeof responseData === "object" && !Array.isArray(responseData)) {
        return {
          ...(responseData as Record<string, unknown>),
          __debugApplyEndpoint: endpoint,
        };
      }

      return {
        data: responseData,
        __debugApplyEndpoint: endpoint,
      };
    } catch (error) {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;
      const hasNextFallback = index < applyEndpoints.length - 1;

      if (status === 404 && hasNextFallback) {
        continue;
      }

      throw error;
    }
  }

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
