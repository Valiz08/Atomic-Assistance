import { configureStore } from '@reduxjs/toolkit';
import appSlice from './slices/app.slice';
// importa más reducers si los tienes

const store = configureStore({
    reducer: {
        user: appSlice,
        // agrega más reducers aquí
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;