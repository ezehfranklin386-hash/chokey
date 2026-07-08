// JSEND response envelope
export interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  status: 'error';
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  requestId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  cursor?: string;
}
