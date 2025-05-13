import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CHAIN } from '@tonconnect/sdk';

export type Network = 'testnet' | 'mainnet';

interface WalletState {
  address: string | null;
  mnemonic: string | null;
  network: Network;
  status: 'idle' | 'loading' | 'connected' | 'error';
  error: string | null;
}

const initialState: WalletState = {
  address: null,
  mnemonic: null,
  network: 'testnet',
  status: 'idle',
  error: null,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setAddress: (state, action: PayloadAction<string | null>) => {
      state.address = action.payload;
      state.status = action.payload ? 'connected' : 'idle';
    },
    setMnemonic: (state, action: PayloadAction<string | null>) => {
      state.mnemonic = action.payload;
    },
    setNetwork: (state, action: PayloadAction<Network>) => {
      state.network = action.payload;
      // При смене сети отключаем кошелек
      state.address = null;
      state.status = 'idle';
    },
    setStatus: (state, action: PayloadAction<WalletState['status']>) => {
      state.status = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.status = 'error';
    },
    resetWallet: (state) => {
      return initialState;
    },
  },
});

export const {
  setAddress,
  setMnemonic,
  setNetwork,
  setStatus,
  setError,
  resetWallet,
} = walletSlice.actions;

export default walletSlice.reducer; 