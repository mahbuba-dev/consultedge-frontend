import { httpClient } from "../lib/axious/httpClient";
import type {
  IAssignExpertAvailabilityPayload,
  IExpertAvailability,
  IExpertAvailabilityQueryParams,
  IUpdateExpertAvailabilityPayload,
} from "../types/expert.types";

export const assignExpertSchedules = async (
  payload: IAssignExpertAvailabilityPayload,
): Promise<IExpertAvailability[]> => {
  const response = await httpClient.post<IExpertAvailability[]>(
    "/expert-schedules/assign",
    payload,
  );

  return Array.isArray(response.data) ? response.data : [];
};

export const getMyExpertSchedules = async (params?: IExpertAvailabilityQueryParams) => {
  return httpClient.get<IExpertAvailability[]>("/expert-schedules/my", {
    params,
  });
};

export const getAllExpertSchedules = async (
  params?: IExpertAvailabilityQueryParams,
) => {
  return httpClient.get<IExpertAvailability[]>("/expert-schedules", {
    params,
  });
};

export const getExpertScheduleById = async (
  expertId: string,
  scheduleId: string,
): Promise<IExpertAvailability> => {
  const response = await httpClient.get<IExpertAvailability>(
    `/expert-schedules/${expertId}/${scheduleId}`,
  );

  return response.data;
};

export const updateMyExpertSchedules = async (
  payload: IUpdateExpertAvailabilityPayload,
): Promise<{ success: boolean }> => {
  const response = await httpClient.put<{ success: boolean }>(
    "/expert-schedules/my",
    payload,
  );

  return response.data;
};

export const deleteMyExpertSchedule = async (
  scheduleId: string,
): Promise<{ success: boolean }> => {
  const response = await httpClient.delete<{ success: boolean }>(
    `/expert-schedules/my/${scheduleId}`,
  );

  return response.data;
};
