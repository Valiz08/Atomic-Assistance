import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthTypes } from "../../services/interfaces/auth.interfaces";
import type { ISession } from "../store.interface";

const initialState = {
    session: null as ISession | null | any,
}

export const appSlice = createSlice({
    name: 'app',
    initialState: initialState,
    reducers: {
        auth: (state, action: PayloadAction<AuthTypes.login>) => {
            const data: AuthTypes.login = action.payload;
            state.session = data;
        }
    }
})
export const { 
    auth 
} = appSlice.actions;
export default appSlice.reducer;