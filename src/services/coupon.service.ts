import { httpClient } from "../lib/axious/httpClient";

export interface ICouponValidationResult {
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

export const validateCoupon = async (
  code: string,
  amount: number,
): Promise<ICouponValidationResult> => {
  const response = await httpClient.post<ICouponValidationResult>(
    "/coupons/validate",
    { code: code.trim().toUpperCase(), amount },
    { silent: true },
  );
  return response.data;
};
