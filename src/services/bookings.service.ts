// // import { httpClient } from "../lib/axious/httpClient";
// // import type { ApiResponse } from "../types/api.types";
// // import type {
// //   ConsultationStatus,
// //   IConsultation,
// //   IConsultationQueryParams,
// // } from "../types/booking.types";

// // type ConsultationCollection = IConsultation[] | undefined;

// // const normalizeConsultations = (payload: ConsultationCollection): IConsultation[] => {
// //   if (!Array.isArray(payload)) {
// //     return [];
// //   }

// //   return payload.map((item) => ({
// //     ...item,
// //     client: item.client ?? null,
// //     expert: item.expert ?? null,
// //     payment: item.payment ?? null,
// //   }));
// // };




// // const requestBookings = async (endpoint: string, params: IConsultationQueryParams = {}) => {
// //   const response = await httpClient.get<IConsultation[]>(endpoint, {
// //     params,
// //     silent: true,
// //   });

// //   return {
// //     ...response,
// //     data: normalizeConsultations(response.data),
// //   } as ApiResponse<IConsultation[]>;
// // };

// // export const getAllBookings = async (
// //   params: IConsultationQueryParams = {},
// // ): Promise<ApiResponse<IConsultation[]>> => {
// //   try {
// //     return await requestBookings("/consultations", params);
// //   } catch (primaryError) {
// //     try {
// //       return await requestBookings("/consultations", params);
// //     } catch {
// //       throw primaryError;
// //     }
// //   }
// // };

// // export const updateBookingStatusAction = async (
// //   consultationId: string,
// //   status: ConsultationStatus,
// // ) => {
// //   const response = await httpClient.patch<IConsultation>(
// //     `/consultations/${consultationId}/status`,
// //     { status },
// //   );

// //   return response.data;
// // };

// // export const cancelUnpaidBookingsAction = async () => {
// //   const response = await httpClient.post<null>("/consultations/cancel-unpaid");
// //   return response.data;
// // };



// import { httpClient } from "../lib/axious/httpClient";
// import type { ApiResponse } from "../types/api.types";
// import type {
//   IBookConsultationPayload,
//   IBookConsultationResult,
//   IConsultation,
//   IConsultationQueryParams,
//   IInitiateConsultationPaymentResult,
// } from "../types/booking.types";

// const isNotFoundError = (error: unknown) => {
//   return (
//     typeof error === "object" &&
//     error !== null &&
//     "response" in error &&
//     (error as { response?: { status?: number } }).response?.status === 404
//   );
// };

// const emptyBookingsResponse = (): ApiResponse<IConsultation[]> => ({
//   success: true,
//   message: "No consultations found.",
//   data: [],
// } as unknown as ApiResponse<IConsultation[]>);

// export const bookConsultation = async (
//   payload: IBookConsultationPayload,
// ): Promise<IBookConsultationResult> => {
//   const response = await httpClient.post<IBookConsultationResult>(
//     "/consultations/book",
//     payload,
//   );

//   return response.data;
// };

// export const bookConsultationWithPayLater = async (
//   payload: IBookConsultationPayload,
// ): Promise<IBookConsultationResult> => {
//   const response = await httpClient.post<IBookConsultationResult>(
//     "/consultations/book/pay-later",
//     payload,
//   );

//   return response.data;
// };

// export const initiateConsultationPayment = async (
//   consultationId: string,
// ): Promise<IInitiateConsultationPaymentResult> => {
//   const response = await httpClient.post<IInitiateConsultationPaymentResult>(
//     `/consultations/${consultationId}/initiate-payment`,
//   );

//   return response.data;
// };









// export const getMyBookings = async (params?: IConsultationQueryParams) => {
//   try {
//     return await httpClient.get<IConsultation[]>("/consultations/me", {
//       params,
//       silent: true,
//     });
//   } catch (error) {
//     if (!isNotFoundError(error)) {
//       throw error;
//     }

//     try {
//       return await httpClient.get<IConsultation[]>("/consultations/client/me", {
//         params,
//         silent: true,
//       });
//     } catch (fallbackError) {
//       if (!isNotFoundError(fallbackError)) {
//         throw fallbackError;
//       }

//       try {
//         return await httpClient.get<IConsultation[]>("/consultations", {
//           params,
//           silent: true,
//         });
//       } catch (finalError) {
//         if (isNotFoundError(finalError)) {
//           return emptyBookingsResponse();
//         }

//         throw finalError;
//       }
//     }
//   }
// };

// export const getMyExpertBookings = async (params?: IConsultationQueryParams) => {
//   try {
//     return await httpClient.get<IConsultation[]>("/consultations/expert/me", {
//       params,
//       silent: true,
//     });
//   } catch (error) {
//     if (!isNotFoundError(error)) {
//       throw error;
//     }

//     try {
//       return await httpClient.get<IConsultation[]>("/consultations", {
//         params,
//         silent: true,
//       });
//     } catch (fallbackError) {
//       if (isNotFoundError(fallbackError)) {
//         return emptyBookingsResponse();
//       }

//       throw fallbackError;
//     }
//   }
// };

// export const updateConsultationStatus = async (
//   consultationId: string,
//   status: string,
// ) => {
//   const response = await httpClient.patch<IConsultation>(
//     `/consultations/${consultationId}/status`,
//     { status },
//   );

//   return response.data;
// };



// export const rescheduleConsultation = async (
//   consultationId: string,
//   newScheduleId: string
// ): Promise<IConsultation> => {
//   const response = await httpClient.patch<IConsultation>(
//     `/consultations/reschedule/${consultationId}`,
//     { scheduleId: newScheduleId }
//   );

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
  ConsultationStatus,
} from "../types/booking.types";

/* -------------------------------------------------------
 * Helpers
 * ----------------------------------------------------- */

const isNotFoundError = (error: unknown) => {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as { response?: { status?: number } }).response?.status === 404
  );
};

const emptyBookingsResponse = (): ApiResponse<IConsultation[]> =>
  ({
    success: true,
    message: "No consultations found.",
    data: [],
  } as unknown as ApiResponse<IConsultation[]>);

type ConsultationCollection = IConsultation[] | undefined;

const toArray = (value: unknown, nestedKeys: string[] = []): unknown[] => {
  if (Array.isArray(value)) return value;

  if (value && typeof value === "object") {
    for (const key of nestedKeys) {
      const nested = (value as Record<string, unknown>)[key];
      if (Array.isArray(nested)) return nested;
    }
  }

  return [];
};

const normalizeConsultations = (
  payload: ConsultationCollection,
): IConsultation[] => {
  if (!Array.isArray(payload)) return [];

  return payload.map((item) => ({
    ...item,
    client: item.client ?? null,
    expert: item.expert ?? null,
    payment: item.payment ?? null,
  }));
};

const asBookingsResponse = (
  response: ApiResponse<unknown>,
): ApiResponse<IConsultation[]> => {
  const items = toArray(response.data, [
    "data",
    "items",
    "result",
    "rows",
    "bookings",
  ]);

  return {
    ...response,
    data: normalizeConsultations(items as ConsultationCollection),
    meta:
      (response.data as { meta?: ApiResponse<IConsultation[]>["meta"] })
        ?.meta ?? response.meta,
  };
};

const requestBookings = async (
  endpoint: string,
  params: IConsultationQueryParams = {},
): Promise<ApiResponse<IConsultation[]>> => {
  const response = await httpClient.get<unknown>(endpoint, {
    params,
    silent: true,
  });

  return asBookingsResponse(response);
};

/* -------------------------------------------------------
 * Booking Actions (Client)
 * ----------------------------------------------------- */

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

/* -------------------------------------------------------
 * My Bookings (Client + Expert)
 * ----------------------------------------------------- */

export const getMyBookings = async (params?: IConsultationQueryParams) => {
  try {
    return await httpClient.get<IConsultation[]>("/consultations/me", {
      params,
      silent: true,
    });
  } catch (error) {
    if (!isNotFoundError(error)) throw error;

    try {
      return await httpClient.get<IConsultation[]>(
        "/consultations/client/me",
        { params, silent: true },
      );
    } catch (fallbackError) {
      if (!isNotFoundError(fallbackError)) throw fallbackError;

      try {
        return await httpClient.get<IConsultation[]>("/consultations", {
          params,
          silent: true,
        });
      } catch (finalError) {
        if (isNotFoundError(finalError)) return emptyBookingsResponse();
        throw finalError;
      }
    }
  }
};

export const getMyExpertBookings = async (
  params?: IConsultationQueryParams,
) => {
  try {
    return await httpClient.get<IConsultation[]>(
      "/consultations/expert/me",
      { params, silent: true },
    );
  } catch (error) {
    if (!isNotFoundError(error)) throw error;

    try {
      return await httpClient.get<IConsultation[]>("/consultations", {
        params,
        silent: true,
      });
    } catch (fallbackError) {
      if (isNotFoundError(fallbackError)) return emptyBookingsResponse();
      throw fallbackError;
    }
  }
};

/* -------------------------------------------------------
 * Admin Bookings
 * ----------------------------------------------------- */

export const getAllBookings = async (
  params: IConsultationQueryParams = {},
): Promise<ApiResponse<IConsultation[]>> => {
  try {
    const response = await requestBookings(
      "/consultations/admin/bookings",
      params,
    );
    return response.data ? response : { ...response, data: [] };
  } catch (primaryError) {
    try {
      const response = await requestBookings("/consultations", params);
      return response.data ? response : { ...response, data: [] };
    } catch {
      throw primaryError;
    }
  }
};

/* -------------------------------------------------------
 * Status + Reschedule + Cancel
 * ----------------------------------------------------- */

export const updateConsultationStatus = async (
  consultationId: string,
  status: ConsultationStatus,
) => {
  const response = await httpClient.patch<IConsultation>(
    `/consultations/${consultationId}/status`,
    { status },
  );
  return response.data;
};

export const rescheduleConsultation = async (
  consultationId: string,
  expertScheduleId: string,
): Promise<IConsultation> => {
  const response = await httpClient.patch<IConsultation>(
    `/consultations/reschedule/${consultationId}`,
    { newExpertScheduleId: expertScheduleId },
  );

  return response.data;
};

export const cancelUnpaidBookingsAction = async () => {
  const response = await httpClient.post<null>(
    "/consultations/cancel-unpaid",
  );
  return response.data;
};
