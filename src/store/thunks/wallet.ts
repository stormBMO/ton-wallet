import { fetchTonBalance } from "@/api/tonApi";
import { fetchJettons } from "@/api/tonApi";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchRiskMetrics } from "./risk";
import { Network, Token } from "@/store/slices/wallet/types";
import { TON_API_BASE_URL } from "@/constants";
import axios from "axios";
import { setTokens, updateRates } from "../slices/wallet/walletSlice";

export const loadWalletData = createAsyncThunk(
  'wallet/load',
  async (
    { address, network }: { address: string; network: Network },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const [ton, jettons] = await Promise.all([
        fetchTonBalance(address, network),
        fetchJettons(address, network),
      ]);
      const tokens = [ton, ...jettons];

      // Запрашиваем риск-метрики для всех токенов
      tokens.forEach(t => dispatch(fetchRiskMetrics({ address: t.address })));
      
      // Возвращаем массив токенов
      dispatch(setTokens(tokens));
      
      return tokens;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchTonRates = createAsyncThunk<
  { address: string; priceTon: string }[],
  { network: 'mainnet'|'testnet' }
>(
  'wallet/fetchRates',
  async ({ network }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const tokens = state.wallet.tokens as Token[];
      
      if (!tokens.length) return [];
      
      // Получаем курсы для всех токенов
      const ratesPromises = tokens.map(async (token) => {
        if (token.symbol === 'TON') {
          // Для TON курс всегда равен 1
          return { address: token.address, priceTon: '1' };
        }
        
        try {
          const { data } = await axios.get(
            `${TON_API_BASE_URL[network]}/v2/rates/${token.address}?currencies=TON`
          );
          
          return {
            address: token.address,
            priceTon: data.rates?.TON?.toString() || '0'
          };
        } catch (error) {
          console.error(`Error fetching rate for ${token.symbol}:`, error);
          return { address: token.address, priceTon: '0' };
        }
      });
      
      const rates = await Promise.all(ratesPromises);
      
      // Обновляем курсы в состоянии
      dispatch(updateRates(rates));
      
      return rates;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch token rates');
    }
  }
);