import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  theme: 'light' | 'dark' | 'system';
  isCreateWalletModalOpen: boolean;
  isConnectWalletModalOpen: boolean;
  isImportWalletModalOpen: boolean;
  isMenuOpen: boolean;
}

const initialState: UiState = {
    theme: 'system',
    isCreateWalletModalOpen: false,
    isConnectWalletModalOpen: false,
    isImportWalletModalOpen: false,
    isMenuOpen: false,
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
        setImportWalletModalOpen: (state, action: PayloadAction<boolean>) => {
            state.isImportWalletModalOpen = action.payload;
        },
        setMenuOpen: (state, action: PayloadAction<boolean>) => {
            state.isMenuOpen = action.payload;
        },
    },
});

export const {
    setTheme,
    setCreateWalletModalOpen,
    setConnectWalletModalOpen,
    setImportWalletModalOpen,
    setMenuOpen,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;

