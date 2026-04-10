/* eslint-disable @typescript-eslint/no-explicit-any */

import { httpClient } from "../lib/axious/httpClient";
import { ApiResponse } from "../types/api.types";

export async function getDashboardData<TDashboardStats = unknown>(): Promise<
  ApiResponse<TDashboardStats>
> {
  try {
    const response = await httpClient.get<TDashboardStats>("/stats");
    return response;
  } catch (error: any) {
    console.log(error, "From dashboard service");
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "An error occurred while fetching dashboard data.",
      data: null as TDashboardStats,
      meta: undefined,
    } as ApiResponse<TDashboardStats>;
  }
}