import { configureStore } from '@reduxjs/toolkit';
import appSlice from './slices/app.slice';

const store = configureStore({
    reducer: {
        user: appSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;