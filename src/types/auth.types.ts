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