import { ApiResponse } from "./api.types";

export interface IIndustry {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface IIndustryCreatePayload {
  name: string;
  description?: string | null;
  file?: File | null; // MUST be "file" because backend uses multerUpload.single("file")
}

export interface IIndustryUpdatePayload {
  name?: string;
  description?: string | null;
  file?: File | null; // MUST be "file" because backend uses multerUpload.single("file")
}

export type IIndustryListResponse = ApiResponse<IIndustry[]>;