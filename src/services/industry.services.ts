import type {
  IIndustry,
  IIndustryCreatePayload,
  IIndustryUpdatePayload,
} from "@/src/types/industry.types";
import { httpClient } from "../lib/axious/httpClient";

// GET ALL
export const getAllIndustries = async () => {
  try {
    const res = await httpClient.get<IIndustry[]>("/industries");

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
  return Array.isArray(res?.data) ? res.data : [];
};

// CREATE
export const createIndustry = async (formData: FormData) => {
  try {
    return await httpClient.post<IIndustry>("/industries", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    console.log("Error creating industry:", error);
    throw error;
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
