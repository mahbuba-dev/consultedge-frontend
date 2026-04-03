export interface ApiResponse<TData=unknown> {
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