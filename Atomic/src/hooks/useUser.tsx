import { useDispatch } from 'react-redux';
import type { commonResponse } from "../services/interfaces/responses.interfaces";
import type { AuthTypes } from "../services/interfaces/auth.interfaces";
import { auth } from '../store/slices/app.slice';

export const useUser = () => {
    const dispatch = useDispatch()

    const login = async (username: string, password: string) => {
        try {
            const response = await fetch("https://wscex.atomic-assistance.es/api/login", {
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
    const uploadFile= async (id: string, file: File) => {
        try {
            const response = await fetch("https://wscex.atomic-assistance.es/api/uploadFile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, file }),
            });
            if (!response.ok) throw new Error("Login failed");
            const data: commonResponse<any> = await response.json();
            return data.message;
        } catch (error) {
            console.error("Login error:", error);
        }
    }
    return{
        login,
        ask,
        uploadFile
    }
}