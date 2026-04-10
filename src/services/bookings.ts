import { httpClient } from "../lib/axious/httpClient";
import type {
  IBookConsultationPayload,
  IBookConsultationResult,
  IConsultation,
  IConsultationQueryParams,
  IInitiateConsultationPaymentResult,
} from "../types/booking.types";

export const bookConsultation = async (
  payload: IBookConsultationPayload,
): Promise<IBookConsultationResult> => {
  const response = await httpClient.post<IBookConsultationResult>(
    "/consultations/book",
    payload,
  );

  return response.data;
};

export const bookConsultationWithPayLater = async (
  payload: IBookConsultationPayload,
): Promise<IBookConsultationResult> => {
  const response = await httpClient.post<IBookConsultationResult>(
    "/consultations/book/pay-later",
    payload,
  );

  return response.data;
};

export const initiateConsultationPayment = async (
  consultationId: string,
): Promise<IInitiateConsultationPaymentResult> => {
  const response = await httpClient.post<IInitiateConsultationPaymentResult>(
    `/consultations/${consultationId}/initiate-payment`,
  );

  return response.data;
};

export const getMyBookings = async (params?: IConsultationQueryParams) => {
  return httpClient.get<IConsultation[]>("/consultations/me", {
    params,
  });
};

export const getMyExpertBookings = async (params?: IConsultationQueryParams) => {
  return httpClient.get<IConsultation[]>("/consultations/expert/me", {
    params,
  });
};

export const updateConsultationStatus = async (
  consultationId: string,
  status: string,
) => {
  const response = await httpClient.patch<IConsultation>(
    `/consultations/${consultationId}/status`,
    { status },
  );

  return response.data;
};
