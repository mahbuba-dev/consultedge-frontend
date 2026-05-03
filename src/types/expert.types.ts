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
  isSeeded?: boolean;
  profilePhoto: string | null;
  resumeUrl?: string | null;
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
  resume?: File | null;
}

export type ExpertVerificationStatus = "APPROVED" | "REJECTED" | "PENDING";

export type ExpertApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IExpertApplication {
  id: string;
  userId: string;
  industryId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  bio?: string | null;
  title?: string | null;
  experience: number;
  consultationFee: number;
  profilePhoto?: string | null;
  resumeUrl?: string | null;
  resumeFileName?: string | null;
  resumeFileType?: string | null;
  resumeFileSize?: number | null;
  status: ExpertApplicationStatus;
  reviewNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    status?: string;
    image?: string | null;
  } | null;
  industry?: {
    id: string;
    name: string;
    description?: string;
    icon?: string | null;
  } | null;
}

export interface IReviewExpertApplicationPayload {
  status: "APPROVED" | "REJECTED";
  notes?: string;
}

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
  isPublished?: boolean;
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
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
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