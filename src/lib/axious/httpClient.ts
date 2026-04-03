import { ApiResponse } from "@/src/types/api.types";
import axios from "axios";

// ---------------------------------------------
// Validate API Base URL
// ---------------------------------------------
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not defined in the environment variables"
  );
}



// ---------------------------------------------
// Create Axios Instance (Singleton Factory)
// ---------------------------------------------
// - baseURL: All requests will use this root URL
// - timeout: Max wait time before request auto-fails
// - headers: Default headers for all requests
// ---------------------------------------------
const axiousInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds timeout
    headers: {
      "Content-Type": "application/json",
    },
    // withCredentials: true, // Enable if backend uses cookies
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
}



// ---------------------------------------------
// HTTP GET Request
// ---------------------------------------------
const httpGet = async <TData>(endpoint: string, options?: ApiRequestOptions):Promise<ApiResponse<TData>> => {
  try {
    const instance = axiousInstance();
    const response = await instance.get<ApiResponse<TData>>(endpoint, {
      params: options?.params,
      headers: options?.headers,
    });

    return response.data
  } catch (error) {
    console.error(`GET request failed for endpoint ${endpoint}:`, error);
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
    const instance = axiousInstance();
    const response = await instance.post<ApiResponse<TData>>(endpoint, data, {
      params: options?.params,
      headers: options?.headers,
    });

    return response.data;
  } catch (error) {
    console.error(`POST request failed for endpoint ${endpoint}:`, error);
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
    const instance = axiousInstance();
    const response = await instance.put<ApiResponse<TData>>(endpoint, data, {
      params: options?.params,
      headers: options?.headers,
    });

    return response.data;
  } catch (error) {
    console.error(`PUT request failed for endpoint ${endpoint}:`, error);
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
    const instance = axiousInstance();
    const response = await instance.patch<ApiResponse<TData>>(endpoint, data, {
      params: options?.params,
      headers: options?.headers,
    });

    return response.data;
  } catch (error) {
    console.error(`PATCH request failed for endpoint ${endpoint}:`, error);
    throw error;
  }
};




// ---------------------------------------------
// HTTP DELETE Request
// ---------------------------------------------
const httpDelete = async <TData>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
  try {
    const instance = axiousInstance();
    const response = await instance.delete<ApiResponse<TData>>(endpoint, {
      params: options?.params,
      headers: options?.headers,
    });

    return response.data;
  } catch (error) {
    console.error(`DELETE request failed for endpoint ${endpoint}:`, error);
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