export interface IRegisterResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    isDeleted: boolean;
    emailVerified: boolean;
  };
  session: any; // BetterAuth session
  token: string; // better-auth.session_token
  accessToken: string; // your JWT
  refreshToken: string; // your JWT
  client: {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    createdAt: string;
  };
}



export interface ILOginResponse{
    token: string;
    accessToken: string;
    refreshToken: string;
    user: {
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerified: boolean;
        name: string;
        image?: string | null | undefined;
        role: string;
        status: string;
        needPasswordChange: boolean;
        isDeleted: boolean;
        deletedAt?: Date | null | undefined;
    }
}
export interface IUserProfile {
  status: string;
  id: string;
  name: string;
  email: string;
  role: string;

  client?: {
    id: string;
    fullName: string;
  } | null;

  expert?: {
    id: string;
    fullName: string;
    title: string;
    experience: number;
    industry: {
      id: string;
      name: string;
    } | null;
  } | null;

  admin?: {
    name: string;
    id: string;
  } | null;
}



export interface IUpdateProfilePayload {
  // Common fields for all users
  name?: string;
  email?: string;
  image?: string | null;

  // Expert-only fields
  title?: string;
  experience?: number;
  industryId?: string;

  // Client-only fields
  fullName?: string;

  // Admin-only fields (if needed)
  adminName?: string;
}



export interface IUpdateProfileResponse {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  status: string;
  needPasswordChange: boolean;
  emailVerified: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}