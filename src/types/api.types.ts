export interface ApiResponse<TData=unknown> {
    admin: boolean;
    name: string;
    role: any;
    expert: import("react/jsx-runtime").JSX.Element;
    client: import("react/jsx-runtime").JSX.Element;
    email: string;
    message: string;
    success: boolean;
    data: TData;
    meta?:paginationMeta
    
}


export interface paginationMeta{
     page: number;
    limit: number;
    total: number;
     totalPages: number;
}


export interface ApiErrorResponse {
  success: boolean;
  message: string;
}