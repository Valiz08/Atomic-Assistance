import { useDispatch } from 'react-redux';
import type { commonResponse } from "../services/interfaces/responses.interfaces";
import type { AuthTypes } from "../services/interfaces/auth.interfaces";
import { auth } from '../store/slices/app.slice';

export const useUser = () => {
    const dispatch = useDispatch()

    const getIAState = async (userId: string) => {
        try {
            const response = await fetch(`http://localhost:3088/api/user/${userId}`);
            if (!response.ok) throw new Error('Failed to get user state');
            return await response.json() as { ia: boolean; hasPdf: boolean; pdfName: string | null };
        } catch (error) {
            console.error('Get user state error:', error);
            return { ia: true, hasPdf: false, pdfName: null };
        }
    }

    const login = async (username: string, password: string) => {
        try {
            const response = await fetch("http://localhost:3088/api/login", {
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
            } as AuthTypes.login;
            dispatch(auth(aux));
            localStorage.setItem('session', JSON.stringify({ ...aux, loginTime: Date.now() }));
            return data.message;
        } catch (error) {
            console.error("Login error:", error);
        }
    }
    const ask = async (message: string, userId: string) => {
        try {
            const response = await fetch("http://localhost:3088/api/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, userId}),
            });
            if (!response.ok) throw new Error("Ask failed");
            const data = await response.json();
            console.log("Ask response:", data);
            return data.reply;
        } catch (error) {
            console.error("Ask error:", error);
            return "Error al conectar con la IA.";
        }
    }
    const uploadFile = async (id: string, file: any) => {
        const formData = new FormData();
        formData.append("archivo", file);
        formData.append("userId", id);
        try {
            const response = await fetch("http://localhost:3088/api/uploadFile", {
                method: "POST",
                body: formData,
            });
            const data: commonResponse<any> = await response.json();
            if (!response.ok) throw new Error(data.message || "Upload failed");
            return { ok: true, message: data.message };
        } catch (error: any) {
            console.error("Upload error:", error);
            return { ok: false, message: error.message };
        }
    }
    const toggleIA = async (userId: string) => {
        try {
            const response = await fetch("http://localhost:3088/api/toggleIA", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            if (!response.ok) throw new Error("Toggle IA failed");
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Toggle IA error:", error);
        }
    }
    const sendMessage = async (message: string, userId: string) => {
        try {
            const response = await fetch("http://localhost:3088/api/sendMessage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, userId }),
            });
            if (!response.ok) throw new Error("Send message failed");
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Send message error:", error);
        }
    }
    return{
        login,
        ask,
        uploadFile,
        toggleIA,
        sendMessage,
        getIAState
    }
}