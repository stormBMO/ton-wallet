import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { JettonBalance, Network } from './types';
import { fetchBalances, fetchRiskScore } from '@/store/thunks/wallet';

export interface WalletState {
  address: string | null;
  mnemonic: string | null;
  network: Network;
  status: 'idle' | 'loading' | 'connected' | 'error';
  error: string | null;
  tonBalance: string;
  jettonBalances: JettonBalance[];
  riskScore: number;
  isLoading: boolean;
}

const initialState: WalletState = {
  address: null,
  mnemonic: null,
  network: 'testnet',
  status: 'idle',
  error: null,
  tonBalance: '0',
  jettonBalances: [],
  riskScore: 0,
  isLoading: false,
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
    resetWallet: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBalances.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBalances.fulfilled, (state, action) => {
        state.tonBalance = action.payload.tonBalance;
        state.jettonBalances = action.payload.jettonBalances;
        state.isLoading = false;
      })
      .addCase(fetchBalances.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to fetch balances';
        state.isLoading = false;
      })
      .addCase(fetchRiskScore.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRiskScore.fulfilled, (state, action) => {
        state.riskScore = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchRiskScore.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to fetch risk score';
        state.isLoading = false;
      });
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

export const walletReducer = walletSlice.reducer; 