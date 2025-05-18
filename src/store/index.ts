import { configureStore, Reducer } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { walletReducer, WalletState } from './slices/wallet/walletSlice';
import { uiReducer, UiState } from './slices/ui/uiSlice';
import { swapReducer } from './slices/swap/swapSlice';
import { authReducer } from './slices/auth/authSlice';
import { riskReducer } from './slices/risk/riskSlice';
import notificationsReducer from './slices/notifications/notificationsSlice';

const walletPersistConfig = {
  key: 'wallet',
  storage,
  whitelist: ['address', 'network', 'status']
};

const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['theme', 'language']
};

export const store = configureStore({
  reducer: {
    wallet: persistReducer<WalletState>(walletPersistConfig, walletReducer),
    ui: persistReducer<UiState>(uiPersistConfig, uiReducer),
    swap: swapReducer,
    auth: authReducer,
    risk: riskReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 