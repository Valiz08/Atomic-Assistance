export const request = {
    LOGIN: "login",
    LOGOUT: "logout",
    REGISTER: "register",
    ASK: "ask",
    DELETE_HISTORY: "deleteHistory",
    GET_HISTORY: "getHistory",
} as const;

export type request = typeof request[keyof typeof request];