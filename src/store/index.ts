import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import walletReducer from './slices/walletSlice';
import uiReducer from './slices/uiSlice';

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
    wallet: persistReducer(walletPersistConfig, walletReducer),
    ui: persistReducer(uiPersistConfig, uiReducer),
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