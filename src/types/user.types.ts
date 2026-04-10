import { UserRole } from "../lib/authUtilis";

export interface UserInfo {
    id : string;
    name : string,
    email : string,
    role : UserRole
}

export type UserRoleValue = UserRole;

export interface IUserManagementItem {
    id: string;
    userId?: string;
    name?: string;
    fullName?: string;
    email: string;
    phone?: string;
    address?: string;
    profilePhoto?: string | null;
    role?: UserRoleValue | string;
    status?: UserStatus | string;
    emailVerified?: boolean;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
    client?: {
      id?: string;
      fullName?: string | null;
    } | null;
    expert?: {
      id?: string;
      fullName?: string | null;
      title?: string | null;
      experience?: number | null;
      industry?: {
        id?: string;
        name?: string | null;
      } | null;
    } | null;
    user?: {
      id?: string;
      name?: string;
      email?: string;
      role?: UserRoleValue | string;
      status?: UserStatus | string;
      emailVerified?: boolean;
      createdAt?: string;
      updatedAt?: string;
    } | null;
}

export interface IUserManagementQueryParams {
    [key: string]: unknown;
    page?: number;
    limit?: number;
    searchTerm?: string;
    role?: UserRoleValue;
    status?: UserStatus | string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER"
}

export enum UserStatus {
    ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  DELETED = "DELETED",
}
