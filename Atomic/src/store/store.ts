import { configureStore } from '@reduxjs/toolkit';
import appSlice from './slices/app.slice';

const TWO_HOURS = 2 * 60 * 60 * 1000;

const loadSession = () => {
    try {
        const raw = localStorage.getItem('session');
        if (!raw) return undefined;
        const session = JSON.parse(raw);
        if (Date.now() - session.loginTime > TWO_HOURS) {
            localStorage.removeItem('session');
            return undefined;
        }
        return { user: { session } };
    } catch {
        return undefined;
    }
};

const store = configureStore({
    reducer: {
        user: appSlice,
    },
    preloadedState: loadSession(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;