// import { ApiResponse } from "@/src/types/api.types";
// import axios from "axios";
// import { isTokenExpiringSoon } from "../tokenUtils";

// // ---------------------------------------------
// // Validate API Base URL
// // ---------------------------------------------
// const normalizeApiBaseUrl = (rawValue?: string) => {
//   const value = rawValue?.trim().replace(/\/+$/, "");

//   if (!value) {
//     return undefined;
//   }

//   return value.endsWith("/api/v1") ? value : `${value}/api/v1`;
// };

// const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

// if (!API_BASE_URL) {
//   throw new Error(
//     "NEXT_PUBLIC_API_URL is not defined in the environment variables"
//   );
// }

// type ServerRequestContext = {
//   cookieStore: any;
//   requestHeaders: Headers;
// };

// const getServerRequestContext = async (): Promise<ServerRequestContext | null> => {
//   if (typeof window !== "undefined") {
//     return null;
//   }

//   try {
//     const { cookies, headers } = await import("next/headers");
//     const cookieStore = await cookies();
//     const requestHeaders = await headers();

//     return { cookieStore, requestHeaders };
//   } catch {
//     return null;
//   }
// };

// async function tryRefreshToken(
//   accessToken: string,
//   refreshToken: string,
//   requestHeaders?: Headers
// ): Promise<void> {
//   if (!requestHeaders) {
//     return;
//   }

//   if (!(await isTokenExpiringSoon(accessToken))) {
//     return;
//   }

//   if (requestHeaders.get("x-token-refreshed") === "1") {
//     return; // avoid multiple refresh attempts in the same request lifecycle
//   }

//   try {
//     const { getNewTokensWithRefreshToken } = await import("@/src/services/auth.services");
//     await getNewTokensWithRefreshToken(refreshToken);
//   } catch (error: any) {
//     console.error("Error refreshing token in http client:", error);
//   }
// }

// // ---------------------------------------------
// // Create Axios Instance (Singleton Factory)
// // ---------------------------------------------
// // - baseURL: All requests will use this root URL
// // - timeout: Max wait time before request auto-fails
// // - headers: Default headers for all requests
// // ---------------------------------------------

const axiousInstance = async () => {
  let cookieHeader = "";
  let accessTokenHeader = "";

  if (typeof window === "undefined") {
    // SSR: use next/headers
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
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");
    }
  } else {
    // Client: read from document.cookie
    const getCookie = (name) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : undefined;
    };
    const accessToken = getCookie("accessToken");
    if (accessToken) {
      accessTokenHeader = `Bearer ${accessToken}`;
    }
    // Optionally, set cookieHeader if you want to send all cookies (rarely needed on client)
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




// // ---------------------------------------------
// // Optional Request Options Interface
// // ---------------------------------------------
// // params  → Query parameters (?page=1&limit=10)
// // headers → Custom headers per request
// // ---------------------------------------------
// export interface ApiRequestOptions {
//   params?: Record<string, unknown>;
//   headers?: Record<string, string>;
//   withCredentials?: boolean; // For cookie-based auth if needed
//   silent?: boolean;
// }



// // ---------------------------------------------
// // HTTP GET Request
// // ---------------------------------------------
// const httpGet = async <TData>(endpoint: string, options?: ApiRequestOptions):Promise<ApiResponse<TData>> => {
//   try {
//     const instance = await axiousInstance();
//     const response = await instance.get<ApiResponse<TData>>(endpoint, {
//       params: options?.params,
//       headers: options?.headers,
//     });

//     return response.data
//   } catch (error) {
//     if (!options?.silent) {
//       console.error(`GET request failed for endpoint ${endpoint}:`, error);
//     }
//     throw error;
//   }
// };



// // ---------------------------------------------
// // HTTP POST Request
// // ---------------------------------------------
// const httpPost = async <TData> (
//   endpoint: string,
//   data?: any,
//   options?: ApiRequestOptions
// ) : Promise<ApiResponse<TData>> => {
//   try {
//     const instance = await axiousInstance();
//     const response = await instance.post<ApiResponse<TData>>(endpoint, data, {
//       params: options?.params,
//       headers: options?.headers,
//     });

//     return response.data;
//   } catch (error) {
//     if (!options?.silent) {
//       console.error(`POST request failed for endpoint ${endpoint}:`, error);
//     }
//     throw error;
//   }
// };



// // ---------------------------------------------
// // HTTP PUT Request
// // ---------------------------------------------
// const httpPut = async <TData> (
//   endpoint: string,
//   data?: any,
//   options?: ApiRequestOptions
// ) : Promise<ApiResponse<TData>> => {
//   try {
//     const instance = await axiousInstance();
//     const response = await instance.put<ApiResponse<TData>>(endpoint, data, {
//       params: options?.params,
//       headers: options?.headers,
//     });

//     return response.data;
//   } catch (error) {
//     if (!options?.silent) {
//       console.error(`PUT request failed for endpoint ${endpoint}:`, error);
//     }
//     throw error;
//   }
// };



// // ---------------------------------------------
// // HTTP PATCH Request
// // ---------------------------------------------
// const httpPatch = async <TData> (
//   endpoint: string,
//   data?: any,
//   options?: ApiRequestOptions
// ) : Promise<ApiResponse<TData>> => {
//   try {
//     const instance = await axiousInstance();
//     const response = await instance.patch<ApiResponse<TData>>(endpoint, data, {
//       params: options?.params,
//       headers: options?.headers,
//     });

//     return response.data;
//   } catch (error) {
//     if (!options?.silent) {
//       console.error(`PATCH request failed for endpoint ${endpoint}:`, error);
//     }
//     throw error;
//   }
// };




// // ---------------------------------------------
// // HTTP DELETE Request
// // ---------------------------------------------
// const httpDelete = async <TData>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
//   try {
//     const instance = await axiousInstance();
//     const response = await instance.delete<ApiResponse<TData>>(endpoint, {
//       params: options?.params,
//       headers: options?.headers,
//     });

//     return response.data;
//   } catch (error) {
//     if (!options?.silent) {
//       console.error(`DELETE request failed for endpoint ${endpoint}:`, error);
//     }
//     throw error;
//   }
// };



// // ---------------------------------------------
// // Export Unified HTTP Client
// // ---------------------------------------------
// export const httpClient = {
//   get: httpGet,
//   post: httpPost,
//   put: httpPut,
//   patch: httpPatch,
//   delete: httpDelete,
// };





import { ApiResponse } from "@/src/types/api.types";
import axios, { AxiosError } from "axios";

// ---------------------------------------------
// Normalize API Base URL
// ---------------------------------------------
const normalizeApiBaseUrl = (rawValue?: string) => {
  const value = rawValue?.trim().replace(/\/+$/, "");
  if (!value) return undefined;
  return value.endsWith("/api/v1") ? value : `${value}/api/v1`;
};

const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in the environment variables");
}

// ---------------------------------------------
// Server Request Context (SSR Only)
// ---------------------------------------------
type ServerRequestContext = {
  cookieStore: any;
  requestHeaders: Headers;
};

const getServerRequestContext = async (): Promise<ServerRequestContext | null> => {
  if (typeof window !== "undefined") return null;

  try {
    const { cookies, headers } = await import("next/headers");
    const cookieStore = await cookies();
    const requestHeaders = await headers();
    return { cookieStore, requestHeaders };
  } catch {
    return null;
  }
};

// ---------------------------------------------
// Axios Instance Factory (SSR + Client Safe)
// ---------------------------------------------
const axiosInstance = async () => {
  let cookieHeader = "";
  let accessTokenHeader = "";

  const serverContext = await getServerRequestContext();

  if (serverContext) {
    const { cookieStore } = serverContext;

    const accessToken = cookieStore.get("accessToken")?.value;

    if (accessToken) {
      accessTokenHeader = `Bearer ${accessToken}`;
    }

    cookieHeader = cookieStore
      .getAll()
      .map((cookie: any) => `${cookie.name}=${cookie.value}`)
      .join("; ");
  }

  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(accessTokenHeader ? { Authorization: accessTokenHeader } : {}),
    },
    withCredentials: true,
  });
};

// ---------------------------------------------
// Request Options
// ---------------------------------------------
export interface ApiRequestOptions {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  silent?: boolean;
  expectedStatuses?: number[];
}

const getErrorStatus = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }

  return undefined;
};

const shouldLogRequestError = (
  error: unknown,
  options?: ApiRequestOptions,
) => {
  if (options?.silent) {
    return false;
  }

  const status = getErrorStatus(error);

  if (
    typeof status === "number" &&
    options?.expectedStatuses?.includes(status)
  ) {
    return false;
  }

  return true;
};

// ---------------------------------------------
// HTTP GET
// ---------------------------------------------
const httpGet = async <TData>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiosInstance();
    const response = await instance.get<ApiResponse<TData>>(endpoint, {
      params: options?.params,
      headers: options?.headers,
      withCredentials: options?.withCredentials,
    });
    return response.data;
  } catch (error) {
    if (shouldLogRequestError(error, options)) {
      console.error(`GET ${endpoint} failed:`, error);
    }
    throw error;
  }
};

// ---------------------------------------------
// HTTP POST
// ---------------------------------------------
const httpPost = async <TData>(
  endpoint: string,
  data?: any,
  options?: ApiRequestOptions
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiosInstance();
    const response = await instance.post<ApiResponse<TData>>(endpoint, data, {
      params: options?.params,
      headers: options?.headers,
      withCredentials: options?.withCredentials,
    });
    return response.data;
  } catch (error) {
    if (shouldLogRequestError(error, options)) {
      console.error(`POST ${endpoint} failed:`, error);
    }
    throw error;
  }
};

// ---------------------------------------------
// HTTP PUT
// ---------------------------------------------
const httpPut = async <TData>(
  endpoint: string,
  data?: any,
  options?: ApiRequestOptions
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiosInstance();
    const response = await instance.put<ApiResponse<TData>>(endpoint, data, {
      params: options?.params,
      headers: options?.headers,
      withCredentials: options?.withCredentials,
    });
    return response.data;
  } catch (error) {
    if (shouldLogRequestError(error, options)) {
      console.error(`PUT ${endpoint} failed:`, error);
    }
    throw error;
  }
};

// ---------------------------------------------
// HTTP PATCH
// ---------------------------------------------
const httpPatch = async <TData>(
  endpoint: string,
  data?: any,
  options?: ApiRequestOptions
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiosInstance();
    const response = await instance.patch<ApiResponse<TData>>(endpoint, data, {
      params: options?.params,
      headers: options?.headers,
      withCredentials: options?.withCredentials,
    });
    return response.data;
  } catch (error) {
    if (shouldLogRequestError(error, options)) {
      console.error(`PATCH ${endpoint} failed:`, error);
    }
    throw error;
  }
};

// ---------------------------------------------
// HTTP DELETE
// ---------------------------------------------
const httpDelete = async <TData>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiosInstance();
    const response = await instance.delete<ApiResponse<TData>>(endpoint, {
      params: options?.params,
      headers: options?.headers,
      withCredentials: options?.withCredentials,
    });
    return response.data;
  } catch (error) {
    if (shouldLogRequestError(error, options)) {
      console.error(`DELETE ${endpoint} failed:`, error);
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












// import axios from "axios";
// import { isTokenExpiringSoon } from "../tokenUtils";

// // ---------------------------------------------
// // Validate API Base URL
// // ---------------------------------------------
// const normalizeApiBaseUrl = (rawValue?: string) => {
//   const value = rawValue?.trim().replace(/\/+$/, "");

//   if (!value) return undefined;

//   return value.endsWith("/api/v1") ? value : `${value}/api/v1`;
// };

// const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

// if (!API_BASE_URL) {
//   throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
// };

// // ---------------------------------------------
// // Server Context (SSR support)
// // ---------------------------------------------
// type ServerRequestContext = {
//   cookieStore: any;
//   requestHeaders: Headers;
// };

// const getServerRequestContext = async (): Promise<ServerRequestContext | null> => {
//   if (typeof window !== "undefined") return null;

//   try {
//     const { cookies, headers } = await import("next/headers");
//     return {
//       cookieStore: await cookies(),
//       requestHeaders: await headers(),
//     };
//   } catch {
//     return null;
//   }
// };

// // ---------------------------------------------
// // Token refresh (safe best-effort)
// // ---------------------------------------------
// async function tryRefreshToken(
//   accessToken: string,
//   refreshToken: string,
//   requestHeaders?: Headers
// ) {
//   if (!requestHeaders) return;

//   const expiring = await isTokenExpiringSoon(accessToken);
//   if (!expiring) return;

//   if (requestHeaders.get("x-token-refreshed") === "1") return;

//   try {
//     const { getNewTokensWithRefreshToken } = await import(
//       "@/src/services/auth.services"
//     );

//     await getNewTokensWithRefreshToken(refreshToken);
//   } catch (error) {
//     console.error("Token refresh failed:", error);
//   }
// }

// // ---------------------------------------------
// // Axios factory
// // ---------------------------------------------
// const createAxiosInstance = async () => {
//   let cookieHeader = "";
//   let accessTokenHeader = "";

//   const serverContext = await getServerRequestContext();

//   if (serverContext) {
//     const { cookieStore, requestHeaders } = serverContext;

//     const accessToken = cookieStore.get("accessToken")?.value;
//     const refreshToken = cookieStore.get("refreshToken")?.value;

//     if (accessToken && refreshToken) {
//       await tryRefreshToken(accessToken, refreshToken, requestHeaders);
//     }

//     if (accessToken) {
//       accessTokenHeader = `Bearer ${accessToken}`;
//     }

//     cookieHeader = cookieStore
//       .getAll()
//       .map((c: any) => `${c.name}=${c.value}`)
//       .join("; ");
//   }

//   return axios.create({
//     baseURL: API_BASE_URL,
//     timeout: 30000,
//     withCredentials: true,
//     headers: {
//       "Content-Type": "application/json",
//       ...(cookieHeader ? { Cookie: cookieHeader } : {}),
//       ...(accessTokenHeader ? { Authorization: accessTokenHeader } : {}),
//     },
//   });
// };

// // ---------------------------------------------
// // Request options
// // ---------------------------------------------
// export interface ApiRequestOptions {
//   params?: Record<string, unknown>;
//   headers?: Record<string, string>;
//   silent?: boolean;
// }

// // ---------------------------------------------
// // HTTP METHODS
// // ---------------------------------------------
// const get = async <T>(
//   endpoint: string,
//   options?: ApiRequestOptions
// ): Promise<T> => {
//   try {
//     const instance = await createAxiosInstance();

//     const res = await instance.get<T>(endpoint, {
//       params: options?.params,
//       headers: options?.headers,
//     });

//     return res.data;
//   } catch (err) {
//     if (!options?.silent) {
//       console.error("GET error:", endpoint, err);
//     }
//     throw err;
//   }
// };

// const post = async <T>(
//   endpoint: string,
//   data?: any,
//   options?: ApiRequestOptions
// ): Promise<T> => {
//   try {
//     const instance = await createAxiosInstance();

//     const res = await instance.post<T>(endpoint, data, {
//       params: options?.params,
//       headers: options?.headers,
//     });

//     return res.data;
//   } catch (err) {
//     if (!options?.silent) {
//       console.error("POST error:", endpoint, err);
//     }
//     throw err;
//   }
// };

// const put = async <T>(
//   endpoint: string,
//   data?: any,
//   options?: ApiRequestOptions
// ): Promise<T> => {
//   const instance = await createAxiosInstance();

//   const res = await instance.put<T>(endpoint, data, {
//     params: options?.params,
//     headers: options?.headers,
//   });

//   return res.data;
// };

// const patch = async <T>(
//   endpoint: string,
//   data?: any,
//   options?: ApiRequestOptions
// ): Promise<T> => {
//   const instance = await createAxiosInstance();

//   const res = await instance.patch<T>(endpoint, data, {
//     params: options?.params,
//     headers: options?.headers,
//   });

//   return res.data;
// };

// const del = async <T>(
//   endpoint: string,
//   options?: ApiRequestOptions
// ): Promise<T> => {
//   const instance = await createAxiosInstance();

//   const res = await instance.delete<T>(endpoint, {
//     params: options?.params,
//     headers: options?.headers,
//   });

//   return res.data;
// };

// export const httpClient = {
//   get,
//   post,
//   put,
//   patch,
//   delete: del,
// };