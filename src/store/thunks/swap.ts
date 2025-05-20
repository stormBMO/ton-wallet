import { createAsyncThunk } from "@reduxjs/toolkit";
import TonWeb from 'tonweb';
import { RootState } from "../index";
import { fetchQuoteFromAPI, fetchUserTokensFromAPI, sendSwapTransaction, convertAmount } from "@/api/swapApi";
import { TonConnectUI } from '@tonconnect/ui-react';

// Базовые функции
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
            const network = state.wallet.network;

            if (!userAddress) {
                return rejectWithValue('Кошелек не подключен');
            }

            const quote = await fetchQuoteFromAPI({ 
                fromToken, 
                toToken, 
                amount, 
                userAddress, 
                network 
            });

            return {
                ...quote,
                fromToken,
                toToken,
                amount,
                amountFormatted: amount
            };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Ошибка получения котировки');
        }
    }
);

export const calcFee = async ({ fromToken, toToken, amount, network = 'mainnet' }: { 
  fromToken: string; 
  toToken: string; 
  amount: string; 
  network?: 'testnet' | 'mainnet' 
}) => {
    const baseGasAmount = '0.05'; // Базовая комиссия TON в газе
    const swapGasAmount = '0.1'; // Комиссия для свопа
  
    // Преобразуем в наноTON (10^9)
    const baseGas = TonWeb.utils.toNano(baseGasAmount);
    const swapGas = TonWeb.utils.toNano(swapGasAmount);
  
    // Общая комиссия
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
            const network = state.wallet.network;
            const userTokens: any[] = (state.wallet.tokens || []) as any[];
      
            // Находим токен в списке токенов пользователя
            const userToken = userTokens.find((t: any) => t.symbol === token);
      
            if (!userToken) {
                return rejectWithValue(`Токен ${token} не найден в кошельке`);
            }
      
            // Проверяем, достаточно ли средств
            const hasEnoughBalance = BigInt(userToken.balance) >= BigInt(amount);
      
            return {
                hasEnoughBalance,
                token,
                amount,
                amountInNano: convertAmount.toNano(amount),
                balance: userToken.balance,
                balanceFormatted: convertAmount.fromNano(userToken.balance)
            };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Не удалось проверить баланс');
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
      
            // Форматируем балансы для отображения
            return tokens.map(token => ({
                ...token,
                balanceFormatted: convertAmount.fromNano(token.balance)
            }));
        } catch (error: any) {
            return rejectWithValue(error.message || 'Не удалось получить список токенов пользователя');
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
    } catch (e: any) {
        return rejectWithValue(e.message || 'Ошибка получения котировки');
    }
});

// Добавляю type guard для проверки структуры payload
function isCheckBalancePayload(payload: unknown): payload is { hasEnoughBalance: boolean } {
    return typeof payload === 'object' && payload !== null && 'hasEnoughBalance' in payload;
}

function getOriginalContract<T>(opened: any): T {
  return opened.contract || opened._contract || opened;
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
            // Проверяем баланс
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
            // Получаем маршрут и payload через MyTonSwap SDK
            const quote = await fetchQuoteFromAPI({
                fromToken,
                toToken,
                amount,
                userAddress
            });
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
        } catch (error: any) {
            return rejectWithValue(error.message || 'Ошибка свопа');
        }
    }
); 