
import {
  type ExpertVerificationStatus,
  IApplyExpertPayload,
  IExpert,
  IVerifyExpertPayload,
} from "@/src/types/expert.types";
import { httpClient } from "../lib/axious/httpClient";

export const getExperts = async (queryString?: string) => {
  const res = await httpClient.get<IExpert[]>(
    queryString ? `/experts?${queryString}` : "/experts"
  );
  return res;
};

export const getExpertById = async (id: string) => {
  const res = await httpClient.get<IExpert>(`/experts/${id}`);
  return res.data;
};






export async function applyExpertAction(payload: IApplyExpertPayload | FormData) {
  const isMultipartPayload = payload instanceof FormData;

  const res = await httpClient.post(
    "/experts/apply",
    payload,
    isMultipartPayload
      ? {
          headers: { "Content-Type": "multipart/form-data" },
        }
      : undefined
  );

  return res.data;
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
