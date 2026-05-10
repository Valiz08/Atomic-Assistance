export interface commonResponse<T> {
    data: T;
    success: boolean;
    message: string;
    userId?: string;
    role?: 'user' | 'superroot';
    businessType?: 'taller' | 'clinica';
    businessName?: string;
    pdfId?: string;
    name?: string;
}

export interface atomicResponse<M> {
    data: M;
    error?: string;
    statusCode?: number;
}