import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface NotificationsState {
  toasts: Toast[];
}

const initialState: NotificationsState = {
    toasts: [],
};

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        notify: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
            const id = Math.random().toString(36).substring(2, 9);
            state.toasts.push({ ...action.payload, id });
        },
        removeToast: (state, action: PayloadAction<string>) => {
            state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
        },
    },
});

export const { notify, removeToast } = notificationsSlice.actions;
export default notificationsSlice.reducer; 