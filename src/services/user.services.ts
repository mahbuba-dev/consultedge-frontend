import { httpClient } from "../lib/axious/httpClient";
import type {
  IUserManagementItem,
  IUserManagementQueryParams,
} from "../types/user.types";

type UserCollection =
  | IUserManagementItem[]
  | {
      data?: IUserManagementItem[];
      items?: IUserManagementItem[];
      users?: IUserManagementItem[];
    }
  | undefined;

const normalizeUsers = (payload: UserCollection): IUserManagementItem[] => {
  if (!payload) {
    return [];
  }

  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(payload.users)
          ? payload.users
          : [];

  return records.map((record) => ({
    ...record,
    userId: record.userId ?? record.user?.id ?? record.id,
    name:
      record.name ??
      record.fullName ??
      record.client?.fullName ??
      record.expert?.fullName ??
      record.user?.name ??
      "Unknown user",
    email: record.email ?? record.user?.email ?? "",
    role:
      record.role ??
      record.user?.role ??
      (record.expert ? "EXPERT" : record.client ? "CLIENT" : "CLIENT"),
    status:
      record.status ??
      record.user?.status ??
      (record.isDeleted ? "DELETED" : "ACTIVE"),
    emailVerified: record.emailVerified ?? record.user?.emailVerified ?? false,
    createdAt: record.createdAt ?? record.user?.createdAt,
    updatedAt: record.updatedAt ?? record.user?.updatedAt,
  }));
};

const requestUsers = async (
  endpoint: string,
  params?: IUserManagementQueryParams,
) => {
  const response = await httpClient.get<IUserManagementItem[]>(endpoint, {
    params,
    silent: true,
  });

  return normalizeUsers(response.data);
};

export const getUsers = async (params: IUserManagementQueryParams = {}) => {
  try {
    return await requestUsers("/users", params);
  } catch (primaryError) {
    if (params.role === "CLIENT") {
      try {
        return await requestUsers("/clients", params);
      } catch {
        // fall through to the original error below
      }
    }

    throw primaryError;
  }
};

export const getClients = async () => getUsers({ role: "CLIENT" });

export const updateUserStatus = async (userId: string, status: string) => {
  try {
    const response = await httpClient.patch(`/users/${userId}/status`, { status });
    return response.data;
  } catch (primaryError) {
    try {
      const response = await httpClient.patch(`/users/${userId}`, { status });
      return response.data;
    } catch {
      throw primaryError;
    }
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const response = await httpClient.delete(`/users/${userId}`);
    return response.data;
  } catch (primaryError) {
    try {
      const response = await httpClient.delete(`/clients/${userId}`);
      return response.data;
    } catch {
      throw primaryError;
    }
  }
};
