export interface commonResponse<T> {
    data: T;
    success: boolean;
    message: string;
}

export interface atomicResponse<M> {
    data: M;
    error?: string;
    statusCode?: number;
}