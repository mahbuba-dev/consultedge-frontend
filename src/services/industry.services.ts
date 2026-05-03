import type {
  IIndustry,
  IIndustryCreatePayload,
  IIndustryUpdatePayload,
} from "@/src/types/industry.types";
import { httpClient } from "../lib/axious/httpClient";

type IndustryQueryParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: unknown;
};

// GET ALL
export const getAllIndustries = async (
  params?: IndustryQueryParams | string,
) => {
  try {
    if (typeof params === "string") {
      const res = await httpClient.get<IIndustry[]>(
        params ? `/industries?${params}` : "/industries",
      );

      return {
        ...res,
        data: Array.isArray(res.data) ? res.data : [],
      };
    }

    const res = await httpClient.get<IIndustry[]>("/industries", {
      params: (params ?? {}) as Record<string, unknown>,
      silent: true,
    });

    return {
      ...res,
      data: Array.isArray(res.data) ? res.data : [],
    };
  } catch (error) {
    console.log("Error fetching industries:", error);
    throw error;
  }
};

export const getIndustries = async (): Promise<IIndustry[]> => {
  const res = await getAllIndustries();
  console.log("industries:", res.data);
  return Array.isArray(res.data) ? res.data : [];
};

// CREATE
export const createIndustry = async (formData: FormData) => {
  try {
    const res = await httpClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>("/industries", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      silent: true,
    });
    return res;
  } catch (error: any) {
    // Normalize error so UI can handle gracefully and terminal never crashes
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error?.message || "Failed to create industry";
    return {
      success: false,
      message,
      status,
      data: null,
      error,
    };
  }
};
// UPDATE
export const updateIndustry = async (id: string, payload: IIndustryUpdatePayload) => {
  const trimmedName = payload.name?.trim();
  const trimmedDescription = payload.description?.trim();

  const hasFile = Boolean(payload.file);
  const jsonBody = {
    ...(trimmedName ? { name: trimmedName } : {}),
    ...(typeof trimmedDescription === "string" ? { description: trimmedDescription } : {}),
  };

  const formData = new FormData();
  if (trimmedName) formData.append("name", trimmedName);
  if (typeof trimmedDescription === "string") formData.append("description", trimmedDescription);
  if (payload.file) formData.append("file", payload.file);

  const jsonOptions = { silent: true };
  const multipartOptions = {
    headers: { "Content-Type": "multipart/form-data" },
    silent: true,
  };

  const attempts: Array<() => Promise<unknown>> = hasFile
    ? [
        () => httpClient.patch<IIndustry>(`/industries/${id}`, formData, multipartOptions),
        () => httpClient.put<IIndustry>(`/industries/${id}`, formData, multipartOptions),
        () => httpClient.patch<IIndustry>(`/industry/${id}`, formData, multipartOptions),
        () => httpClient.put<IIndustry>(`/industry/${id}`, formData, multipartOptions),
        () => httpClient.patch<IIndustry>(`/industries/update/${id}`, formData, multipartOptions),
        () => httpClient.put<IIndustry>(`/industries/update/${id}`, formData, multipartOptions),
      ]
    : [
        () => httpClient.patch<IIndustry>(`/industries/${id}`, jsonBody, jsonOptions),
        () => httpClient.put<IIndustry>(`/industries/${id}`, jsonBody, jsonOptions),
        () => httpClient.patch<IIndustry>(`/industry/${id}`, jsonBody, jsonOptions),
        () => httpClient.put<IIndustry>(`/industry/${id}`, jsonBody, jsonOptions),
        () => httpClient.patch<IIndustry>(`/industries/update/${id}`, jsonBody, jsonOptions),
        () => httpClient.put<IIndustry>(`/industries/update/${id}`, jsonBody, jsonOptions),
      ];

  for (let index = 0; index < attempts.length; index += 1) {
    try {
      const result = await attempts[index]();
      return result;
    } catch (error: any) {
      const status = error?.response?.status;
      const isLastAttempt = index === attempts.length - 1;

      if (status !== 404 || isLastAttempt) {
        console.log("Error updating industry:", error);
        throw error;
      }
    }
  }

  throw new Error("Failed to update industry");
};

// DELETE
export const deleteIndustry = async (id: string) => {
  try {
    return await httpClient.delete<boolean>(`/industries/${id}`);
  } catch (error) {
    console.log("Error deleting industry:", error);
    throw error;
  }
};

// GET BY ID
export const getIndustryById = async (id: string) => {
  try {
    return await httpClient.get<IIndustry>(`/industries/${id}`);
  } catch (error) {
    console.log("Error fetching industry by id:", error);
    throw error;
  }
};
