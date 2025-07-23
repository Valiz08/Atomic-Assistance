import { useDispatch } from 'react-redux';
import type { atomicResponse, commonResponse } from "../services/interfaces/responses.interfaces";
import type { AuthTypes } from "../services/interfaces/auth.interfaces";
import { auth } from '../store/slices/app.slice';

export const useUser = () => {
    const dispatch = useDispatch()

    const login = async (username: string, password: string) => {
        try {
            const response = await fetch("http://localhost:3088/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            if (!response.ok) throw new Error("Login failed");
            const data: commonResponse<atomicResponse<AuthTypes.login>> = await response.json();
            const aux = data.data.data;
            dispatch(auth(aux));
            return data;
        } catch (error) {
            console.error("Login error:", error);
        }
    }
    const ask = async (message: string) => {
        try {
            const response = await fetch("http://localhost:3088/api/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });
            if (!response.ok) throw new Error("Ask failed");
            const data = await response.json();
            return data.reply;
        } catch (error) {
            console.error("Ask error:", error);
            return "Error al conectar con la IA.";
        }
    }
    return{
        login,
        ask
    }
}