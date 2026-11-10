import { buildFormUrlEncodedPayload } from "../lib/axious/buildFormUrlEncodedPayload";
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

const EXPERT_SCHEDULE_BASE = "/expert-schedules";
const SCHEDULE_CATALOG_ENDPOINTS = ["/schedules"] as const;

const toArray = (value: unknown, nestedKeys: string[] = []): any[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object") {
    for (const nestedKey of nestedKeys) {
      const nestedValue = (value as Record<string, unknown>)[nestedKey];

      if (Array.isArray(nestedValue)) {
        return nestedValue;
      }
    }
  }

  return [];
};

const combineDateAndTime = (dateValue: unknown, timeValue: unknown) => {
  const dateText = typeof dateValue === "string" ? dateValue.trim() : "";
  const timeText = typeof timeValue === "string" ? timeValue.trim() : "";

  if (!dateText && !timeText) {
    return "";
  }

  // Already a full ISO string — pass through unchanged.
  if (dateText.includes("T")) {
    return dateText;
  }

  if (!dateText) {
    return timeText;
  }

  if (!timeText) {
    return dateText;
  }

  const normalizedTime = /^\d{2}:\d{2}$/.test(timeText) ? `${timeText}:00` : timeText;

  // Send a naive wall-clock value (no TZ). The backend stores exactly what the
  // expert typed and the display layer renders the same numbers back. This
  // avoids double timezone conversion when the backend doesn't preserve TZ.
  return `${dateText}T${normalizedTime}`;
};

const normalizeSlot = (value: any): IAvailabilitySlot => ({
  id: String(value?.id ?? value?.scheduleId ?? value?._id ?? ""),
  startDateTime:
    value?.startDateTime ??
    value?.start ??
    value?.start_date_time ??
    value?.startsAt ??
    combineDateAndTime(
      value?.date ?? value?.startDate ?? value?.availableDate,
      value?.startTime ?? value?.fromTime,
    ) ??
    "",
  endDateTime:
    value?.endDateTime ??
    value?.end ??
    value?.end_date_time ??
    value?.endsAt ??
    combineDateAndTime(
      value?.date ?? value?.endDate ?? value?.availableDate,
      value?.endTime ?? value?.toTime,
    ) ??
    null,
  isDeleted: Boolean(value?.isDeleted),
  deletedAt: value?.deletedAt ?? null,
  createdAt: value?.createdAt,
  updatedAt: value?.updatedAt,
});

const normalizeCreatedSlots = (value: unknown): IAvailabilitySlot[] => {
  const items = toArray(value, ["data", "items", "result", "rows", "schedules"]);
  const candidates = items.length
    ? items
    : value && typeof value === "object"
      ? [value]
      : [];

  return candidates
    .map((item) => normalizeSlot(item))
    .filter((slot) => Boolean(slot.id));
};

const normalizeExpertAvailability = (value: any): IExpertAvailability => {
  const raw = value?.expertSchedule ?? value?.availability ?? value?.data ?? value;
  const scheduleSource =
    raw?.schedule ??
    raw?.slot ??
    raw?.scheduleDetails ??
    raw?.availabilitySchedule ??
    (raw?.startDateTime || raw?.endDateTime ? raw : null);
  const schedule = scheduleSource ? normalizeSlot(scheduleSource) : null;
  const resolvedId = String(raw?.id ?? raw?.expertScheduleId ?? raw?._id ?? "");
  const resolvedScheduleId =
    typeof raw?.scheduleId === "string"
      ? raw.scheduleId
      : raw?.scheduleId?.id ?? raw?.schedule?.id ?? schedule?.id ?? "";

  return {
    id: resolvedId,
    expertId: String(raw?.expertId ?? raw?.expert?.id ?? ""),
    scheduleId: String(resolvedScheduleId),
    consultationId: raw?.consultationId ?? raw?.consultation?.id ?? null,
    isBooked: Boolean(raw?.isBooked ?? raw?.booked ?? raw?.consultationId),
    isPublished:
      typeof raw?.isPublished === "boolean" ? raw.isPublished : undefined,
    isDeleted: Boolean(raw?.isDeleted ?? raw?.deleted),
    deletedAt: raw?.deletedAt ?? null,
    createdAt: raw?.createdAt ?? schedule?.createdAt ?? new Date().toISOString(),
    updatedAt:
      raw?.updatedAt ?? raw?.createdAt ?? schedule?.updatedAt ?? new Date().toISOString(),
    schedule,
    expert: raw?.expert ?? null,
    consultation: raw?.consultation ?? null,
  };
};

const asAvailabilityResponse = (
  response: ApiResponse<any>,
  payload: unknown,
): ApiResponse<IExpertAvailability[]> => {
  const items = toArray(payload, ["data", "items", "result", "rows"]);

  return {
    ...response,
    data: items.map(normalizeExpertAvailability),
    meta: (payload as { meta?: ApiResponse<IExpertAvailability[]>["meta"] } | undefined)?.meta ?? response.meta,
  };
};

const requestAvailabilityList = async (
  endpoint: string,
  params: IExpertAvailabilityQueryParams = {},
): Promise<ApiResponse<IExpertAvailability[]>> => {
  const response = await httpClient.get<any>(endpoint, {
    params,
    silent: true,
  });

  return asAvailabilityResponse(response, response.data);
};

export const getMyExpertAvailability = async (
  params: IExpertAvailabilityQueryParams = {},
): Promise<ApiResponse<IExpertAvailability[]>> => {
  try {
    return await requestAvailabilityList(`${EXPERT_SCHEDULE_BASE}/my`, params);
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return {
        success: true,
        message: "No schedules found.",
        data: [],
      } as unknown as ApiResponse<IExpertAvailability[]>;
    }

    throw error;
  }
};

export const getPublishedExpertAvailability = async (
  expertId: string,
  params: IExpertAvailabilityQueryParams = {},
): Promise<ApiResponse<IExpertAvailability[]>> => {
  if (!expertId) {
    return {
      success: true,
      message: "No expert selected.",
      data: [],
    } as unknown as ApiResponse<IExpertAvailability[]>;
  }

  const publishedResponse = await requestAvailabilityList(
    `${EXPERT_SCHEDULE_BASE}/published/`,
    {
      ...params,
      expertId,
      // Avoid stale availability immediately after an expert publishes a slot.
      _t: Date.now(),
    },
  );

  //test
  console.log(
    "PUBLISHED SCHEDULES:",
    publishedResponse.data.map((item) => ({
      id: item.id,
      scheduleId: item.scheduleId,
      isBooked: item.isBooked,
      consultationId: item.consultationId,
    })),
  );

  return publishedResponse;
};

export const createScheduleSlot = async (
  payload: ICreateAvailabilitySlotPayload,
): Promise<IAvailabilitySlot[]> => {
  let lastError: unknown;
  const encodedPayload = buildFormUrlEncodedPayload({
    ...payload,
    startDateTime: combineDateAndTime(payload.startDate, payload.startTime),
    endDateTime: combineDateAndTime(payload.endDate, payload.endTime),
  });

  for (const endpoint of SCHEDULE_CATALOG_ENDPOINTS) {
    try {
      const response = await httpClient.post<any>(endpoint, encodedPayload, {
        silent: true,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const createdSlots = normalizeCreatedSlots(response.data);

      if (!createdSlots.length) {
        throw new Error("Schedule creation did not return a valid schedule id.");
      }

      return createdSlots;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

export const getScheduleCatalog = async (
  params: Record<string, unknown> = {},
): Promise<IAvailabilitySlot[]> => {
  for (const endpoint of SCHEDULE_CATALOG_ENDPOINTS) {
    try {
      const response = await httpClient.get<any>(endpoint, {
        params,
        silent: true,
      });

      const items = toArray(response.data, ["data", "items", "result", "rows"]);
      return items.map(normalizeSlot);
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        throw error;
      }
    }
  }

  return [];
};

export const assignExpertSchedules = async (
  payload: IAssignExpertAvailabilityPayload,
) => {
  const response = await httpClient.post<IExpertAvailability[]>(
    `${EXPERT_SCHEDULE_BASE}/assign`,
    buildFormUrlEncodedPayload(payload),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return response.data;
};

export const updateExpertAvailability = async (
  payload: IUpdateExpertAvailabilityPayload,
) => {
  const response = await httpClient.put<{ success: boolean }>(
    `${EXPERT_SCHEDULE_BASE}/my`,
    buildFormUrlEncodedPayload(payload),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return response.data;
};

export const deleteExpertAvailability = async (scheduleId: string) => {
  const response = await httpClient.delete<{ success: boolean }>(
    `${EXPERT_SCHEDULE_BASE}/my/${scheduleId}`,
  );

  return response.data;
};
