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

      const amountInNano = convertAmount.toNano(amount);
      const quote = await fetchQuoteFromAPI({ 
        fromToken, 
        toToken, 
        amount: amountInNano, 
        userAddress, 
        network 
      });

      return {
        ...quote,
        fromToken,
        toToken,
        amount: amountInNano,
        amountFormatted: amount,
        expectedAmount: convertAmount.fromNano(quote.expected_amount),
        minAmountOut: convertAmount.fromNano(quote.min_amount_out),
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
      const userTokens = state.swap.userTokens;
      
      // Находим токен в списке токенов пользователя
      const userToken = userTokens.find(t => t.symbol === token);
      
      if (!userToken) {
        return rejectWithValue(`Токен ${token} не найден в кошельке`);
      }
      
      // Преобразуем сумму в нано для сравнения
      const amountInNano = convertAmount.toNano(amount);
      
      // Проверяем, достаточно ли средств
      const hasEnoughBalance = BigInt(userToken.balance) >= BigInt(amountInNano);
      
      return {
        hasEnoughBalance,
        token,
        amount,
        amountInNano,
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
  any,
  { fromToken: string; toToken: string; amount: string; userAddress: string; network?: 'testnet' | 'mainnet' },
  { rejectValue: string }
>('swap/fetchQuote', async (params, { rejectWithValue }) => {
  try {
    return await getQuote(params);
  } catch (e: any) {
    return rejectWithValue(e.message || 'Ошибка получения котировки');
  }
});

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
      const network = state.wallet.network;
      const walletType = state.swap.walletType;

      if (!userAddress) {
        return rejectWithValue('Кошелек не подключен');
      }

      // Конвертируем в нано
      const amountInNano = convertAmount.toNano(amount);
      
      // Получаем котировку
      const quote = await fetchQuoteFromAPI({ 
        fromToken, 
        toToken, 
        amount: amountInNano, 
        userAddress, 
        network 
      });
      
      // Проверяем баланс через наш thunk
      const checkBalanceResult = await dispatch(checkBalance({ 
        token: fromToken, 
        amount 
      }));
      
      // Обрабатываем результат проверки баланса
      if (checkBalanceResult.type === 'swap/checkBalance/fulfilled') {
        if (!checkBalanceResult.payload.hasEnoughBalance) {
          return rejectWithValue('Недостаточно средств для свопа');
        }
      } else {
        return rejectWithValue('Не удалось проверить баланс');
      }
      
      // Подготовка транзакции
      let transactionData;
      
      if (fromToken === 'TON') {
        // Своп TON на Jetton
        transactionData = {
          to: quote.pool_address,
          amount: amountInNano,
          payload: quote.message_body,
        };
      } else {
        // Своп Jetton на TON или другой Jetton
        transactionData = {
          to: quote.pool_address,
          amount: convertAmount.toNano('0.1'), // минимальная сумма для покрытия gas fee
          payload: quote.message_body,
          stateInit: quote.state_init
        };
      }
      
      // Отправка транзакции
      let result;
      
      if (walletType === 'tonconnect') {
        if (!tonConnectUI) {
          return rejectWithValue('TonConnect UI не инициализирован');
        }
        result = await sendSwapTransaction(transactionData, tonConnectUI);
      } else {
        return rejectWithValue('В данный момент поддерживается только TonConnect');
      }
      
      return {
        success: true,
        txHash: typeof result === 'object' ? (result.boc || result.txHash || result) : result,
        fromToken,
        toToken,
        amount: amountInNano,
        amountFormatted: amount,
        expectedAmount: convertAmount.fromNano(quote.expected_amount),
        minAmountOut: convertAmount.fromNano(quote.min_amount_out),
        userAddress
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка свопа');
    }
  }
); 