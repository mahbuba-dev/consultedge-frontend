import { ApiResponse } from "@/src/types/api.types";
import axios from "axios";
import { isTokenExpiringSoon } from "../tokenUtils";

// ---------------------------------------------
// Validate API Base URL
// ---------------------------------------------
const normalizeApiBaseUrl = (rawValue?: string) => {
  const value = rawValue?.trim().replace(/\/+$/, "");

  if (!value) {
    return undefined;
  }

  return value.endsWith("/api/v1") ? value : `${value}/api/v1`;
};

const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not defined in the environment variables"
  );
}

type ServerRequestContext = {
  cookieStore: any;
  requestHeaders: Headers;
};

const getServerRequestContext = async (): Promise<ServerRequestContext | null> => {
  if (typeof window !== "undefined") {
    return null;
  }

  try {
    const { cookies, headers } = await import("next/headers");
    const cookieStore = await cookies();
    const requestHeaders = await headers();

    return { cookieStore, requestHeaders };
  } catch {
    return null;
  }
};

async function tryRefreshToken(
  accessToken: string,
  refreshToken: string,
  requestHeaders?: Headers
): Promise<void> {
  if (!requestHeaders) {
    return;
  }

  if (!(await isTokenExpiringSoon(accessToken))) {
    return;
  }

  if (requestHeaders.get("x-token-refreshed") === "1") {
    return; // avoid multiple refresh attempts in the same request lifecycle
  }

  try {
    const { getNewTokensWithRefreshToken } = await import("@/src/services/auth.services");
    await getNewTokensWithRefreshToken(refreshToken);
  } catch (error: any) {
    console.error("Error refreshing token in http client:", error);
  }
}

// ---------------------------------------------
// Create Axios Instance (Singleton Factory)
// ---------------------------------------------
// - baseURL: All requests will use this root URL
// - timeout: Max wait time before request auto-fails
// - headers: Default headers for all requests
// ---------------------------------------------
const axiousInstance = async () => {
  let cookieHeader = "";
  let accessTokenHeader = "";
  const serverContext = await getServerRequestContext();

  if (serverContext) {
    const { cookieStore, requestHeaders } = serverContext;
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (accessToken && refreshToken) {
      await tryRefreshToken(accessToken, refreshToken, requestHeaders);
    }

    if (accessToken) {
      accessTokenHeader = `Bearer ${accessToken}`;
    }

    cookieHeader = cookieStore
      .getAll()
      .map((cookie: any) => `${cookie.name}=${cookie.value}`)
      .join("; ");
  }

  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(accessTokenHeader ? { Authorization: accessTokenHeader } : {}),
    },
    withCredentials: true,
  });

  return instance;
};




// ---------------------------------------------
// Optional Request Options Interface
// ---------------------------------------------
// params  → Query parameters (?page=1&limit=10)
// headers → Custom headers per request
// ---------------------------------------------
export interface ApiRequestOptions {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  withCredentials?: boolean; // For cookie-based auth if needed
  silent?: boolean;
}



// ---------------------------------------------
// HTTP GET Request
// ---------------------------------------------
const httpGet = async <TData>(endpoint: string, options?: ApiRequestOptions):Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiousInstance();
    const response = await instance.get<ApiResponse<TData>>(endpoint, {
      params: options?.params,
      headers: options?.headers,
    });

    return response.data
  } catch (error) {
    if (!options?.silent) {
      console.error(`GET request failed for endpoint ${endpoint}:`, error);
    }
    throw error;
  }
};



// ---------------------------------------------
// HTTP POST Request
// ---------------------------------------------
const httpPost = async <TData> (
  endpoint: string,
  data?: any,
  options?: ApiRequestOptions
) : Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiousInstance();
    const response = await instance.post<ApiResponse<TData>>(endpoint, data, {
      params: options?.params,
      headers: options?.headers,
    });

    return response.data;
  } catch (error) {
    if (!options?.silent) {
      console.error(`POST request failed for endpoint ${endpoint}:`, error);
    }
    throw error;
  }
};



// ---------------------------------------------
// HTTP PUT Request
// ---------------------------------------------
const httpPut = async <TData> (
  endpoint: string,
  data?: any,
  options?: ApiRequestOptions
) : Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiousInstance();
    const response = await instance.put<ApiResponse<TData>>(endpoint, data, {
      params: options?.params,
      headers: options?.headers,
    });

    return response.data;
  } catch (error) {
    if (!options?.silent) {
      console.error(`PUT request failed for endpoint ${endpoint}:`, error);
    }
    throw error;
  }
};



// ---------------------------------------------
// HTTP PATCH Request
// ---------------------------------------------
const httpPatch = async <TData> (
  endpoint: string,
  data?: any,
  options?: ApiRequestOptions
) : Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiousInstance();
    const response = await instance.patch<ApiResponse<TData>>(endpoint, data, {
      params: options?.params,
      headers: options?.headers,
    });

    return response.data;
  } catch (error) {
    if (!options?.silent) {
      console.error(`PATCH request failed for endpoint ${endpoint}:`, error);
    }
    throw error;
  }
};




// ---------------------------------------------
// HTTP DELETE Request
// ---------------------------------------------
const httpDelete = async <TData>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiousInstance();
    const response = await instance.delete<ApiResponse<TData>>(endpoint, {
      params: options?.params,
      headers: options?.headers,
    });

    return response.data;
  } catch (error) {
    if (!options?.silent) {
      console.error(`DELETE request failed for endpoint ${endpoint}:`, error);
    }
    throw error;
  }
};



// ---------------------------------------------
// Export Unified HTTP Client
// ---------------------------------------------
export const httpClient = {
  get: httpGet,
  post: httpPost,
  put: httpPut,
  patch: httpPatch,
  delete: httpDelete,
};