import { useDispatch } from 'react-redux';
import type { commonResponse } from "../services/interfaces/responses.interfaces";
import type { AuthTypes } from "../services/interfaces/auth.interfaces";
import { auth } from '../store/slices/app.slice';

export interface PdfEntry {
    id: string;
    name: string;
    uploadedAt?: string;
}

export const useUser = () => {
    const dispatch = useDispatch()

    const getIAState = async (userId: string) => {
        try {
            const response = await fetch(`/api/user/${userId}`);
            if (!response.ok) throw new Error('Failed to get user state');
            return await response.json() as { ia: boolean; pdfs: PdfEntry[] };
        } catch (error) {
            console.error('Get user state error:', error);
            return { ia: true, pdfs: [] };
        }
    }

    const login = async (username: string, password: string) => {
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            if (!response.ok) throw new Error("Login failed");
            const data: commonResponse<any> = await response.json();
            const aux = {
                id: data.userId,
                username: username,
                password: password,
                role: data.role || 'user',
                businessType: data.businessType || 'taller',
                businessName: data.businessName || '',
            } as AuthTypes.login;
            dispatch(auth(aux));
            localStorage.setItem('session', JSON.stringify({ ...aux, loginTime: Date.now() }));
            return data.role === 'superroot' ? '__superroot__' : data.message;
        } catch (error) {
            console.error("Login error:", error);
        }
    }

    const ask = async (message: string, userId: string) => {
        try {
            const response = await fetch("/api/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, userId }),
            });
            if (!response.ok) throw new Error("Ask failed");
            const data = await response.json();
            return data.reply;
        } catch (error) {
            console.error("Ask error:", error);
            return "Error al conectar con la IA.";
        }
    }

    const uploadFile = async (userId: string, file: File) => {
        const formData = new FormData();
        formData.append("archivo", file);
        formData.append("userId", userId);
        try {
            const response = await fetch("/api/uploadFile", {
                method: "POST",
                body: formData,
            });
            const data: commonResponse<any> = await response.json();
            if (!response.ok) throw new Error(data.message || "Upload failed");
            return { ok: true, message: data.message, pdfId: data.pdfId as string, name: data.name as string };
        } catch (error: any) {
            console.error("Upload error:", error);
            return { ok: false, message: error.message, pdfId: null, name: null };
        }
    }

    const deletePdf = async (userId: string, pdfId: string) => {
        try {
            const response = await fetch(`/api/user/${userId}/pdf/${pdfId}`, { method: 'DELETE' });
            return response.ok;
        } catch (error) {
            console.error("Delete PDF error:", error);
            return false;
        }
    }

    const toggleIA = async (userId: string) => {
        try {
            const response = await fetch("/api/toggleIA", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            if (!response.ok) throw new Error("Toggle IA failed");
            return await response.json();
        } catch (error) {
            console.error("Toggle IA error:", error);
        }
    }

    const sendMessage = async (message: string, userId: string) => {
        try {
            const response = await fetch("/api/sendMessage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, userId }),
            });
            if (!response.ok) throw new Error("Send message failed");
            return await response.json();
        } catch (error) {
            console.error("Send message error:", error);
        }
    }

    return { login, ask, uploadFile, deletePdf, toggleIA, sendMessage, getIAState }
}
