import { httpClient } from "../lib/axious/httpClient";
import type { ApiResponse } from "../types/api.types";
import type { IUserManagementItem, IUserManagementQueryParams } from "../types/user.types";

export interface IUpdateClientPayload {
  fullName?: string;
  email?: string;
  profilePhoto?: string;
  phone?: string;
  address?: string;
}

const normalizeClients = (payload: IUserManagementItem[] | undefined): IUserManagementItem[] => {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((record) => ({
    ...record,
    name: record.fullName ?? record.name ?? record.user?.name ?? "Unknown client",
    fullName: record.fullName ?? record.name ?? record.user?.name ?? "",
    email: record.email ?? record.user?.email ?? "",
    phone: record.phone ?? "",
    address: record.address ?? "",
    profilePhoto: record.profilePhoto ?? null,
    userId: record.userId ?? record.user?.id ?? record.id,
    role: record.role ?? record.user?.role ?? "CLIENT",
    status:
      record.status ??
      record.user?.status ??
      (record.isDeleted ? "DELETED" : "ACTIVE"),
    emailVerified: record.emailVerified ?? record.user?.emailVerified ?? false,
    createdAt: record.createdAt ?? record.user?.createdAt,
    updatedAt: record.updatedAt ?? record.user?.updatedAt,
  }));
};

export const getAllClients = async (
  params: IUserManagementQueryParams = {},
): Promise<ApiResponse<IUserManagementItem[]>> => {
  const response = await httpClient.get<IUserManagementItem[]>("/clients", {
    params: params as Record<string, unknown>,
    silent: true,
  });

  return {
    ...response,
    data: normalizeClients(response.data),
  };
};

export const getClientById = async (clientId: string) => {
  const response = await httpClient.get<IUserManagementItem>(`/clients/${clientId}`, {
    silent: true,
  });

  const [client] = normalizeClients(response.data ? [response.data] : []);
  return client;
};

export const updateClientAction = async (clientId: string, payload: IUpdateClientPayload) => {
  const response = await httpClient.put<IUserManagementItem>(`/clients/${clientId}`, payload);
  return response.data;
};

export const deleteClientAction = async (clientId: string) => {
  const response = await httpClient.delete(`/clients/${clientId}`);
  return response.data;
};
