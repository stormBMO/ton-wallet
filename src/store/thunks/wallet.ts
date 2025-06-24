import { fetchTonBalance } from "@/api/tonApi";
import { fetchJettons } from "@/api/tonApi";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchRiskMetrics } from "./risk";
import { Token } from "@/store/slices/wallet/types";
import { TON_API_BASE_URL } from "@/constants";
import axios from "axios";
import { setTokens, updateRates } from "../slices/wallet/walletSlice";
import { Network } from "../types";

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
            
            let tokens = parseFloat(ton.balance) > 0 ? [ton, ...jettons] : jettons;

            tokens = tokens.filter((token: Token) => {
                try {
                    return Number(token.balance) > 0;
                } catch {
                    return false;
                }
            });

            tokens.forEach((token: Token) => dispatch(fetchRiskMetrics({ address: token.address, network })));
      
            dispatch(setTokens(tokens));
      
            return tokens;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : 'Failed to load wallet data');
        }
    }
);

export const fetchTonRates = createAsyncThunk<
  { address: string; priceTon: string }[],
  { network: Network }
>(
    'wallet/fetchRates',
    async ({ network }, { getState, dispatch, rejectWithValue }) => {
        try {
            const state = getState() as { wallet: { tokens: Token[] } };
            const tokens = state.wallet.tokens;
      
            if (!tokens.length) return [];
      
            const ratesPromises = tokens.map(async (token) => {
                if (token.symbol === 'TON') {
                    return { address: token.address, priceTon: '1' };
                }
        
                try {
                    const url = `${TON_API_BASE_URL[network]}/v2/jettons/${token.address}`;
                    
                    const { data } = await axios.get(url);
          
                    let priceTon = '0';
                    
                    if (data.verification && data.verification.ton_price) {
                        priceTon = data.verification.ton_price.toString();
                    } else if (data.metadata && data.metadata.price) {
                        priceTon = data.metadata.price.toString();
                    } else {
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
                                'USDT': '0.15',    
                                'USDC': '0.15',    
                                'NOT': '0.0001',   
                                'DOGS': '0.00001', 
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
                        'USDT': '0.15',    
                        'USDC': '0.15',    
                        'NOT': '0.0001',   
                        'DOGS': '0.00001', 
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