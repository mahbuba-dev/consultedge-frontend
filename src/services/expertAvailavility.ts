import { httpClient } from "../lib/axious/httpClient";
import type { ApiResponse } from "../types/api.types";
import type {
  IAssignExpertAvailabilityPayload,
  IAvailabilitySlot,
  ICreateAvailabilitySlotPayload,
  IExpertAvailability,
  IExpertAvailabilityQueryParams,
  IUpdateExpertAvailabilityPayload,
} from "../types/expert.types";

const createFallbackResponse = <TData,>(
  data: TData,
  message: string,
): ApiResponse<TData> => ({
  success: false,
  message,
  data,
  meta: undefined,
  admin: false,
  name: "",
  role: null,
  expert: null as never,
  client: null as never,
  email: "",
});

const normalizeCreatedSlot = (
  data: IAvailabilitySlot | IAvailabilitySlot[] | null | undefined,
): IAvailabilitySlot => {
  const slot = Array.isArray(data) ? data[0] : data;

  if (!slot?.id) {
    throw new Error("Schedule slot creation failed. Please try again.");
  }

  return slot;
};

export const createScheduleSlot = async (
  payload: ICreateAvailabilitySlotPayload,
): Promise<IAvailabilitySlot> => {
  try {
    const response = await httpClient.post<IAvailabilitySlot | IAvailabilitySlot[]>(
      "/schedules",
      payload,
      { silent: true },
    );

    return normalizeCreatedSlot(response.data);
  } catch (error: any) {
    if (error?.response?.status === 404) {
      try {
        const fallbackResponse = await httpClient.post<
          IAvailabilitySlot | IAvailabilitySlot[]
        >("/schedule", payload, { silent: true });

        return normalizeCreatedSlot(fallbackResponse.data);
      } catch (fallbackError: any) {
        if ([401, 403, 404].includes(fallbackError?.response?.status)) {
          throw new Error(
            "Schedule creation endpoint is not available for expert accounts yet.",
          );
        }

        throw fallbackError;
      }
    }

    if ([401, 403].includes(error?.response?.status)) {
      throw new Error("You need an expert account to create availability.");
    }

    throw error;
  }
};

export const getScheduleCatalog = async (params?: Record<string, unknown>) => {
  try {
    return await httpClient.get<IAvailabilitySlot[]>("/schedules", {
      params,
      silent: true,
    });
  } catch (error: any) {
    if (error?.response?.status === 404) {
      try {
        return await httpClient.get<IAvailabilitySlot[]>("/schedule", {
          params,
          silent: true,
        });
      } catch (fallbackError: any) {
        if ([401, 403, 404].includes(fallbackError?.response?.status)) {
          return createFallbackResponse<IAvailabilitySlot[]>(
            [],
            "Schedule catalog is not available yet for this account.",
          );
        }

        throw fallbackError;
      }
    }

    if ([401, 403].includes(error?.response?.status)) {
      return createFallbackResponse<IAvailabilitySlot[]>(
        [],
        "Schedule catalog is not available yet for this account.",
      );
    }

    throw error;
  }
};

export const getMyExpertAvailability = async (
  params?: IExpertAvailabilityQueryParams,
) => {
  try {
    return await httpClient.get<IExpertAvailability[]>("/expert-schedules/my", {
      params,
      silent: true,
    });
  } catch (error: any) {
    if ([401, 403, 404].includes(error?.response?.status)) {
      return createFallbackResponse<IExpertAvailability[]>(
        [],
        "Expert access is required to manage availability. Please sign in again with an expert account.",
      );
    }

    throw error;
  }
};

export const publishExpertAvailability = async (
  payload: IAssignExpertAvailabilityPayload,
): Promise<IExpertAvailability[]> => {
  const response = await httpClient.post<IExpertAvailability[]>(
    "/expert-schedules/assign",
    payload,
  );

  return Array.isArray(response.data) ? response.data : [];
};

export const updateExpertAvailability = async (
  payload: IUpdateExpertAvailabilityPayload,
): Promise<{ success: boolean }> => {
  const response = await httpClient.put<{ success: boolean }>(
    "/expert-schedules/my",
    payload,
  );

  return response.data;
};

export const deleteExpertAvailability = async (
  scheduleId: string,
): Promise<{ success: boolean }> => {
  const response = await httpClient.delete<{ success: boolean }>(
    `/expert-schedules/my/${scheduleId}`,
  );

  return response.data;
};
