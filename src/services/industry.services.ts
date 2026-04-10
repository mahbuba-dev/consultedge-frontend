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
export const updateIndustry = async (id: string, formData: FormData) => {
  try {
    return await httpClient.patch<IIndustry>(`/industries/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    console.log("Error updating industry:", error);
    throw error;
  }
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
