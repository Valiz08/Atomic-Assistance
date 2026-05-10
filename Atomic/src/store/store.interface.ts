export interface ISession {
    id: string;
    user: string;
    token: string;
    history: string[];
    role: 'user' | 'superroot';
    businessType: 'taller' | 'clinica';
    businessName: string;
}