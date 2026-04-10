export interface IExpert {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  title: string;
  bio: string;
  experience: number;
  price?: number;
  consultationFee?: number;
  isVerified?: boolean;
  profilePhoto: string | null;
  industryId: string;
  industry?: {
    id: string;
    name: string;
    description: string;
    icon: string | null;
  } | null;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}



export interface IApplyExpertPayload {
  fullName: string;
  email: string;
  phone?: string;
  bio?: string;
  title?: string;
  experience?: number;
  consultationFee: number;
  industryId: string;
  profilePhoto?: File | null;
}

export type ExpertVerificationStatus = "APPROVED" | "REJECTED" | "PENDING";

export interface IVerifyExpertPayload {
  status: ExpertVerificationStatus;
  notes?: string;
}

export interface IAvailabilitySlot {
  id: string;
  startDateTime: string;
  endDateTime?: string | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IExpertAvailability {
  id: string;
  expertId: string;
  scheduleId: string;
  consultationId?: string | null;
  isBooked: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  schedule?: IAvailabilitySlot | null;
  expert?: IExpert | null;
  consultation?: {
    id: string;
    status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
    paymentStatus: "UNPAID" | "PAID" | "FAILED" | "REFUNDED";
    date: string;
  } | null;
}

export interface ICreateAvailabilitySlotPayload {
  startDateTime: string;
  endDateTime: string;
}

export interface IAssignExpertAvailabilityPayload {
  scheduleIds: string[];
}

export interface IUpdateExpertAvailabilityPayload {
  scheduleIds: {
    id: string;
    shouldDelete: boolean;
  }[];
}

export interface IExpertAvailabilityQueryParams {
  [key: string]: unknown;
  page?: number;
  limit?: number;
  searchTerm?: string;
  expertId?: string;
  scheduleId?: string;
  isBooked?: boolean;
  isDeleted?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IExpertAvailabilityFormValues {
  scheduleIds: string[];
}