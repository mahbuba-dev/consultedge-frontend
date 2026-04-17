// import { httpClient } from "../lib/axious/httpClient";
// import type { ApiResponse } from "../types/api.types";
// import type {
//   ConsultationStatus,
//   IConsultation,
//   IConsultationQueryParams,
// } from "../types/booking.types";

// type ConsultationCollection = IConsultation[] | undefined;

// const normalizeConsultations = (payload: ConsultationCollection): IConsultation[] => {
//   if (!Array.isArray(payload)) {
//     return [];
//   }

//   return payload.map((item) => ({
//     ...item,
//     client: item.client ?? null,
//     expert: item.expert ?? null,
//     payment: item.payment ?? null,
//   }));
// };




// const requestBookings = async (endpoint: string, params: IConsultationQueryParams = {}) => {
//   const response = await httpClient.get<IConsultation[]>(endpoint, {
//     params,
//     silent: true,
//   });

//   return {
//     ...response,
//     data: normalizeConsultations(response.data),
//   } as ApiResponse<IConsultation[]>;
// };

// export const getAllBookings = async (
//   params: IConsultationQueryParams = {},
// ): Promise<ApiResponse<IConsultation[]>> => {
//   try {
//     return await requestBookings("/consultations", params);
//   } catch (primaryError) {
//     try {
//       return await requestBookings("/consultations", params);
//     } catch {
//       throw primaryError;
//     }
//   }
// };

// export const updateBookingStatusAction = async (
//   consultationId: string,
//   status: ConsultationStatus,
// ) => {
//   const response = await httpClient.patch<IConsultation>(
//     `/consultations/${consultationId}/status`,
//     { status },
//   );

//   return response.data;
// };

// export const cancelUnpaidBookingsAction = async () => {
//   const response = await httpClient.post<null>("/consultations/cancel-unpaid");
//   return response.data;
// };



import { httpClient } from "../lib/axious/httpClient";
import type { ApiResponse } from "../types/api.types";
import type {
  IBookConsultationPayload,
  IBookConsultationResult,
  IConsultation,
  IConsultationQueryParams,
  IInitiateConsultationPaymentResult,
} from "../types/booking.types";

const isNotFoundError = (error: unknown) => {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as { response?: { status?: number } }).response?.status === 404
  );
};

const emptyBookingsResponse = (): ApiResponse<IConsultation[]> => ({
  success: true,
  message: "No consultations found.",
  data: [],
} as unknown as ApiResponse<IConsultation[]>);

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
  try {
    return await httpClient.get<IConsultation[]>("/consultations/me", {
      params,
      silent: true,
    });
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }

    try {
      return await httpClient.get<IConsultation[]>("/consultations/client/me", {
        params,
        silent: true,
      });
    } catch (fallbackError) {
      if (!isNotFoundError(fallbackError)) {
        throw fallbackError;
      }

      try {
        return await httpClient.get<IConsultation[]>("/consultations", {
          params,
          silent: true,
        });
      } catch (finalError) {
        if (isNotFoundError(finalError)) {
          return emptyBookingsResponse();
        }

        throw finalError;
      }
    }
  }
};

export const getMyExpertBookings = async (params?: IConsultationQueryParams) => {
  try {
    return await httpClient.get<IConsultation[]>("/consultations/expert/me", {
      params,
      silent: true,
    });
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }

    try {
      return await httpClient.get<IConsultation[]>("/consultations", {
        params,
        silent: true,
      });
    } catch (fallbackError) {
      if (isNotFoundError(fallbackError)) {
        return emptyBookingsResponse();
      }

      throw fallbackError;
    }
  }
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