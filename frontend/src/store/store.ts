import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import authReducer, { setCredentials, logout } from './slices/authSlice';
import profileReducer from './slices/profileSlice';

const authMiddleware = createListenerMiddleware();

authMiddleware.startListening({
    matcher: isAnyOf(setCredentials),
    effect: (action) => {
        const payload = action.payload as any;
        if (payload?.access_token) {
            localStorage.setItem('access_token', payload.access_token);
            localStorage.setItem('refresh_token', payload.refresh_token);
        }
    }
});

authMiddleware.startListening({
    actionCreator: logout,
    effect: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
});

export const store = configureStore({
    reducer: {
        auth: authReducer,
        profile: profileReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(authMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
