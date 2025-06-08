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
            
            // Включаем TON только если баланс больше 0
            const tokens = parseFloat(ton.balance) > 0 ? [ton, ...jettons] : jettons;

            // Запрашиваем риск-метрики для всех токенов
            tokens.forEach((token: Token) => dispatch(fetchRiskMetrics({ address: token.address, network })));
      
            // Возвращаем массив токенов
            dispatch(setTokens(tokens));
      
            return tokens;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : 'Failed to load wallet data');
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
            const state = getState() as { wallet: { tokens: Token[] } };
            const tokens = state.wallet.tokens;
      
            if (!tokens.length) return [];
      
            // Получаем курсы для всех токенов
            const ratesPromises = tokens.map(async (token) => {
                if (token.symbol === 'TON') {
                    // Для TON курс всегда равен 1
                    return { address: token.address, priceTon: '1' };
                }
        
                try {
                    // Используем правильный TonAPI endpoint для получения курсов токенов
                    const url = `${TON_API_BASE_URL[network]}/v2/jettons/${token.address}`;
                    
                    const { data } = await axios.get(url);
          
                    // Пытаемся получить курс из jetton info
                    let priceTon = '0';
                    
                    // Проверяем различные поля в ответе TonAPI где может быть цена
                    if (data.verification && data.verification.ton_price) {
                        priceTon = data.verification.ton_price.toString();
                    } else if (data.metadata && data.metadata.price) {
                        priceTon = data.metadata.price.toString();
                    } else {
                        // Если TonAPI не предоставляет цену, используем альтернативный метод
                        // Пробуем получить курс через rates endpoint (может работать для некоторых токенов)
                        try {
                            const rateUrl = `${TON_API_BASE_URL[network]}/v2/rates?tokens=${token.address}&currencies=ton`;
                            const rateResponse = await axios.get(rateUrl);
                            
                            if (rateResponse.data && rateResponse.data.rates && rateResponse.data.rates[token.address]) {
                                const tokenRates = rateResponse.data.rates[token.address];
                                priceTon = tokenRates.prices?.TON?.toString() || tokenRates.TON?.toString() || '0';
                            }
                        } catch {
                            
                            // Fallback: hardcoded курсы для популярных токенов
                            const knownRates: { [symbol: string]: string } = {
                                'USDT': '0.15',    // Примерный курс USDT к TON
                                'USDC': '0.15',    // Примерный курс USDC к TON
                                'NOT': '0.0001',   // Примерный курс NOT к TON
                                'HMSTR': '0.00001', // Примерный курс HMSTR к TON
                                'DOGS': '0.00001', // Примерный курс DOGS к TON
                            };
                            
                            priceTon = knownRates[token.symbol] || '0';
                        }
                    }
                    
                    return {
                        address: token.address,
                        priceTon
                    };
                } catch {
                    // Fallback: hardcoded курсы для популярных токенов
                    const knownRates: { [symbol: string]: string } = {
                        'USDT': '0.15',    // Примерный курс USDT к TON
                        'USDC': '0.15',    // Примерный курс USDC к TON  
                        'NOT': '0.0001',   // Примерный курс NOT к TON
                        'HMSTR': '0.00001', // Примерный курс HMSTR к TON
                        'DOGS': '0.00001', // Примерный курс DOGS к TON
                    };
                    
                    const fallbackRate = knownRates[token.symbol] || '0';
                    
                    return { address: token.address, priceTon: fallbackRate };
                }
            });
      
            const rates = await Promise.all(ratesPromises);
      
            // Обновляем курсы в состоянии
            dispatch(updateRates(rates));
      
            return rates;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch token rates');
        }
    }
);