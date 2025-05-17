import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { JettonBalance, WalletAdapter } from '../slices/wallet/types';
import { calculateRiskScore, calculateVolatility } from '@/lib';

export const fetchBalances = createAsyncThunk<
  { tonBalance: string; jettonBalances: JettonBalance[] },
  string,
  { rejectValue: string }
>('wallet/fetchBalances', async (address, { rejectWithValue }) => {
  try {
    const [tonResponse, jettonsResponse] = await Promise.all([
      axios.get(`https://tonapi.io/v2/accounts/${address}`),
      axios.get(`https://tonapi.io/v2/accounts/${address}/jettons`)
    ]);
    return {
      tonBalance: tonResponse.data.balance,
      jettonBalances: jettonsResponse.data.balances,
    };
  } catch (error: any) {
    return rejectWithValue('Failed to fetch balances');
  }
});

export const fetchRiskScore = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>('wallet/fetchRiskScore', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('https://tonapi.io/v2/rates/toncoin');
    const prices = response.data.prices.slice(-30).map((p: any) => p.price || p); // поддержка разных форматов
    const volatility = calculateVolatility(prices);
    const riskScore = calculateRiskScore(volatility);
    return riskScore;
  } catch (error: any) {
    return rejectWithValue('Failed to fetch risk score');
  }
});

export const getWalletAddress = createAsyncThunk<
  string | null,
  { adapter: WalletAdapter },
  { rejectValue: string }
>('wallet/getAddress', async ({ adapter }, { rejectWithValue }) => {
  try {
    return await adapter.getAddress();
  } catch (e: any) {
    return rejectWithValue(e.message || 'Ошибка получения адреса');
  }
});

export const getWalletBalance = createAsyncThunk<
  string,
  { adapter: WalletAdapter; token?: string },
  { rejectValue: string }
>('wallet/getBalance', async ({ adapter, token }, { rejectWithValue }) => {
  try {
    return await adapter.getBalance(token);
  } catch (e: any) {
    return rejectWithValue(e.message || 'Ошибка получения баланса');
  }
});

export const sendWalletTx = createAsyncThunk<
  any,
  { adapter: WalletAdapter; tx: any },
  { rejectValue: string }
>('wallet/sendTx', async ({ adapter, tx }, { rejectWithValue }) => {
  try {
    return await adapter.sendTx(tx);
  } catch (e: any) {
    return rejectWithValue(e.message || 'Ошибка отправки транзакции');
  }
});

export const signWalletMsg = createAsyncThunk<
  string,
  { adapter: WalletAdapter; msg: string | Uint8Array },
  { rejectValue: string }
>('wallet/signMsg', async ({ adapter, msg }, { rejectWithValue }) => {
  try {
    return await adapter.signMsg(msg);
  } catch (e: any) {
    return rejectWithValue(e.message || 'Ошибка подписи сообщения');
  }
}); 