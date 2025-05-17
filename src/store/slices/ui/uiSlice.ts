import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  theme: 'light' | 'dark' | 'system';
  isCreateWalletModalOpen: boolean;
  isConnectWalletModalOpen: boolean;
}

const initialState: UiState = {
  theme: 'system',
  isCreateWalletModalOpen: false,
  isConnectWalletModalOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<UiState['theme']>) => {
      state.theme = action.payload;
    },
    setCreateWalletModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateWalletModalOpen = action.payload;
    },
    setConnectWalletModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isConnectWalletModalOpen = action.payload;
    },
  },
});

export const {
  setTheme,
  setCreateWalletModalOpen,
  setConnectWalletModalOpen,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;

