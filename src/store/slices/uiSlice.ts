import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  isCreateWalletModalOpen: boolean;
}

const initialState: UiState = {
  theme: 'system',
  language: 'en',
  isCreateWalletModalOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<UiState['theme']>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setCreateWalletModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateWalletModalOpen = action.payload;
    },
  },
});

export const {
  setTheme,
  setLanguage,
  setCreateWalletModalOpen,
} = uiSlice.actions;

export default uiSlice.reducer; 