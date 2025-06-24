import { createAsyncThunk } from "@reduxjs/toolkit";
import TonWeb from 'tonweb';
import { RootState } from "../index";
import { fetchQuoteFromAPI, fetchUserTokensFromAPI, sendSwapTransaction, convertAmount } from "@/api/swapApi";
import { TonConnectUI } from '@tonconnect/ui-react';

const getTokenAddress = (symbol: string, userTokens: any[]): string => {
    if (symbol === 'TON') return 'TON'; 
    const token = userTokens.find((t: any) => t.symbol === symbol);
    return token ? token.address : symbol;
};

export const getQuote = createAsyncThunk(
    'swap/getQuote',
    async ({ 
        fromToken, 
        toToken, 
        amount
    }: { 
    fromToken: string; 
    toToken: string; 
    amount: string; 
  }, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const userAddress = state.wallet.address;
            const userTokens = state.wallet.tokens || [];

            if (!userAddress) {
                return rejectWithValue('Кошелек не подключен');
            }

            const fromTokenAddress = getTokenAddress(fromToken, userTokens);
            const toTokenAddress = getTokenAddress(toToken, userTokens);

            const quote = await fetchQuoteFromAPI({ 
                fromToken: fromTokenAddress, 
                toToken: toTokenAddress, 
                amount
            });

            return {
                ...quote,
                fromToken,
                toToken,
                amount,
                amountFormatted: amount
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Ошибка получения котировки';
            return rejectWithValue(errorMessage);
        }
    }
);

export const calcFee = async ({ fromToken, toToken, amount, _network = 'mainnet' }: { 
  fromToken: string; 
  toToken: string; 
  amount: string; 
  _network?: 'testnet' | 'mainnet' 
}) => {
    const baseGasAmount = '0.05'; 
    const swapGasAmount = '0.1'; 
  
    const baseGas = TonWeb.utils.toNano(baseGasAmount);
    const swapGas = TonWeb.utils.toNano(swapGasAmount);
  
    const totalFee = (BigInt(baseGas) + BigInt(swapGas)).toString();
  
    return {
        feeInTon: TonWeb.utils.fromNano(totalFee),
        feeInNano: totalFee,
        fromToken,
        toToken,
        amount
    };
};

export const checkBalance = createAsyncThunk(
    'swap/checkBalance',
    async ({ 
        token, 
        amount 
    }: { 
    token: string; 
    amount: string;
  }, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const userTokens = (state.wallet.tokens || []);
      
            const userToken = userTokens.find((t) => t.address === token);
      
            if (!userToken) {
                return rejectWithValue(`Токен ${token} не найден в кошельке`);
            }
      
            const hasEnoughBalance = BigInt(userToken.balance) >= BigInt(amount);
      
            return {
                hasEnoughBalance,
                token,
                amount,
                amountInNano: convertAmount.toNano(amount),
                balance: userToken.balance,
                balanceFormatted: convertAmount.fromNano(userToken.balance)
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Не удалось проверить баланс';
            return rejectWithValue(errorMessage);
        }
    }
);

export const getUserTokens = createAsyncThunk(
    'swap/getUserTokens',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const address = state.wallet.address;
            const network = state.wallet.network;

            if (!address) {
                return rejectWithValue('Кошелек не подключен');
            }

            const tokens = await fetchUserTokensFromAPI(address, network);
      
            return tokens.map(token => ({
                ...token,
                balanceFormatted: convertAmount.fromNano(token.balance)
            }));
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Не удалось получить список токенов пользователя';
            return rejectWithValue(errorMessage);
        }
    }
);

// Thunks
export const fetchQuote = createAsyncThunk<
  unknown,
  { fromToken: string; toToken: string; amount: string; userAddress: string; network?: 'testnet' | 'mainnet' },
  { rejectValue: string }
>('swap/fetchQuote', async (params, { rejectWithValue }) => {
    try {
        return await getQuote(params);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Ошибка получения котировки';
        return rejectWithValue(errorMessage);
    }
});

function isCheckBalancePayload(payload: unknown): payload is { hasEnoughBalance: boolean } {
    return typeof payload === 'object' && payload !== null && 'hasEnoughBalance' in payload;
}

export const swapThunk = createAsyncThunk(
    'swap/perform',
    async ({ 
        fromToken,
        toToken,
        amount,
        tonConnectUI
    }: {
    fromToken: string;
    toToken: string;
    amount: string;
    tonConnectUI: TonConnectUI;
  }, { getState, dispatch, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const userAddress = state.wallet.address;
            const walletType = state.swap.walletType;
            if (!userAddress) {
                return rejectWithValue('Кошелек не подключен');
            }
            const checkBalanceResult = await dispatch(checkBalance({ 
                token: fromToken, 
                amount 
            }));
            if (checkBalanceResult.type === 'swap/checkBalance/fulfilled') {
                if (!isCheckBalancePayload(checkBalanceResult.payload) || !checkBalanceResult.payload.hasEnoughBalance) {
                    return rejectWithValue('Недостаточно средств для свопа');
                }
            } else {
                return rejectWithValue('Не удалось проверить баланс');
            }
            const userTokens = state.wallet.tokens || [];
            const fromTokenAddress = getTokenAddress(fromToken, userTokens);
            const toTokenAddress = getTokenAddress(toToken, userTokens);
            
            const quote = await fetchQuoteFromAPI({
                fromToken: fromTokenAddress,
                toToken: toTokenAddress,
                amount
            });

            if (quote.error || !quote.bestRoute) {
                return rejectWithValue(quote.error || 'Не удалось получить маршрут для свопа');
            }
            let result;
            if (walletType === 'tonconnect') {
                if (!tonConnectUI) {
                    return rejectWithValue('TonConnect UI не инициализирован');
                }
                result = await sendSwapTransaction({ bestRoute: quote.bestRoute, userAddress }, tonConnectUI);
            } else {
                return rejectWithValue('В данный момент поддерживается только TonConnect');
            }
            return {
                success: true,
                txHash: typeof result === 'object' ? (result.boc || result.txHash || result) : result,
                fromToken,
                toToken,
                amount,
                amountFormatted: amount,
                expectedAmount: quote.expectedAmount,
                minAmountOut: quote.minAmountOut,
                userAddress
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Ошибка свопа';
            return rejectWithValue(errorMessage);
        }
    }
); 