import { httpClient } from "../lib/axious/httpClient";
import type { ApiResponse } from "../types/api.types";
import type {
  ConsultationStatus,
  IConsultation,
  IConsultationQueryParams,
} from "../types/booking.types";

type ConsultationCollection = IConsultation[] | undefined;

const normalizeConsultations = (payload: ConsultationCollection): IConsultation[] => {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((item) => ({
    ...item,
    client: item.client ?? null,
    expert: item.expert ?? null,
    payment: item.payment ?? null,
  }));
};




const requestBookings = async (endpoint: string, params: IConsultationQueryParams = {}) => {
  const response = await httpClient.get<IConsultation[]>(endpoint, {
    params,
    silent: true,
  });

  return {
    ...response,
    data: normalizeConsultations(response.data),
  } as ApiResponse<IConsultation[]>;
};

export const getAllBookings = async (
  params: IConsultationQueryParams = {},
): Promise<ApiResponse<IConsultation[]>> => {
  try {
    return await requestBookings("/consultations", params);
  } catch (primaryError) {
    try {
      return await requestBookings("/consultations", params);
    } catch {
      throw primaryError;
    }
  }
};

export const updateBookingStatusAction = async (
  consultationId: string,
  status: ConsultationStatus,
) => {
  const response = await httpClient.patch<IConsultation>(
    `/consultations/${consultationId}/status`,
    { status },
  );

  return response.data;
};

export const cancelUnpaidBookingsAction = async () => {
  const response = await httpClient.post<null>("/consultations/cancel-unpaid");
  return response.data;
};
