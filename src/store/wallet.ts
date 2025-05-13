import { create } from 'zustand';
import axios from 'axios';

interface JettonBalance {
  symbol: string;
  balance: string;
  address: string;
}

interface WalletState {
  address: string | null;
  tonBalance: string;
  jettonBalances: JettonBalance[];
  riskScore: number;
  isLoading: boolean;
  error: string | null;
  
  setAddress: (address: string | null) => void;
  fetchBalances: (address: string) => Promise<void>;
  fetchRiskScore: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  tonBalance: '0',
  jettonBalances: [],
  riskScore: 0,
  isLoading: false,
  error: null,

  setAddress: (address) => set({ address }),

  fetchBalances: async (address) => {
    set({ isLoading: true, error: null });
    try {
      const [tonResponse, jettonsResponse] = await Promise.all([
        axios.get(`https://tonapi.io/v2/accounts/${address}`),
        axios.get(`https://tonapi.io/v2/accounts/${address}/jettons`)
      ]);

      set({
        tonBalance: tonResponse.data.balance,
        jettonBalances: jettonsResponse.data.balances,
        isLoading: false
      });
    } catch (error) {
      set({ error: 'Failed to fetch balances', isLoading: false });
    }
  },

  fetchRiskScore: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('https://tonapi.io/v2/rates/toncoin');
      const prices = response.data.prices.slice(-30); // Last 30 days
      const volatility = calculateVolatility(prices);
      const riskScore = calculateRiskScore(volatility);
      
      set({ riskScore, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch risk score', isLoading: false });
    }
  }
}));