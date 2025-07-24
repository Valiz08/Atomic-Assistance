export interface commonResponse<T> {
    data: T;
    success: boolean;
    message: string;
    userId?: string; // Optional user ID for login responses
}

export interface atomicResponse<M> {
    data: M;
    error?: string;
    statusCode?: number;
}