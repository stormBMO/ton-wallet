import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Network, Token } from './types';
import { fetchRiskMetrics } from '@/store/thunks/risk';
import { loadWalletData } from '@/store/thunks/wallet';

export interface WalletState {
  address: string | null;
  mnemonic: string | null;
  network: Network;
  status: 'idle' | 'loading' | 'connected' | 'error';
  error: string | null;
  tokens: Token[];              // [{ address,symbol,name,balance, priceTon? }]
  totalTonValue: string;        // суммарная стоимость всех токенов в TON
  riskScore: number;
  isLoading: boolean;
}

const initialState: WalletState = {
  address: null,
  mnemonic: null,
  network: 'testnet',
  status: 'idle',
  error: null,
  tokens: [],
  totalTonValue: '0',
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
    setTokens: (state, action: PayloadAction<Token[]>) => {
      state.tokens = action.payload;
    },
    updateRates: (state, action: PayloadAction<{ address: string; priceTon: string }[]>) => {
      // Обновляем курсы и пересчитываем общую стоимость
      let totalValue = 0;
      
      state.tokens = state.tokens.map(token => {
        const rateInfo = action.payload.find(rate => rate.address === token.address);
        if (rateInfo) {
          token.priceTon = rateInfo.priceTon;
          
          // Добавляем к общей стоимости
          if (token.balance && token.priceTon) {
            totalValue += parseFloat(token.balance) * parseFloat(token.priceTon);
          }
        }
        return token;
      });
      
      state.totalTonValue = totalValue.toFixed(4);
    },
    resetWallet: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadWalletData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadWalletData.fulfilled, (state, action) => {
        state.tokens = action.payload;
        state.isLoading = false;
      })
      .addCase(loadWalletData.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to fetch balances';
        state.isLoading = false;
      })
      .addCase(fetchRiskMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRiskMetrics.fulfilled, (state, action) => {
        state.riskScore = action.payload.contract_risk;
        state.isLoading = false;
      })
      .addCase(fetchRiskMetrics.rejected, (state, action) => {
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
  setTokens,
  updateRates
} = walletSlice.actions;

export const walletReducer = walletSlice.reducer; 