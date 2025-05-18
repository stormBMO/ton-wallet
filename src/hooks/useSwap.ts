import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { AppDispatch, RootState } from '../store/index';
import { swapSlice } from '../store/slices/swap/swapSlice';
import { UserToken } from '../store/slices/swap/swapSlice';
import { getQuote, getUserTokens, swapThunk } from '@/store/thunks/swap';

export const useSwap = () => {
  const dispatch = useDispatch<AppDispatch>();
  const swap = useSelector((state: RootState) => state.swap);
  const wallet = useSelector((state: RootState) => state.wallet);
  const [tonConnectUI] = useTonConnectUI();
  const [isLoading, setIsLoading] = useState(false);

  // Методы для работы с локальным состоянием свопа
  const setFromToken = (token: string) => dispatch(swapSlice.actions.setFromToken(token));
  const setToToken = (token: string) => dispatch(swapSlice.actions.setToToken(token));
  const setAmount = (amount: string) => dispatch(swapSlice.actions.setAmount(amount));
  const setRate = (rate: string) => dispatch(swapSlice.actions.setRate(rate));
  const setMinReceive = (min: string) => dispatch(swapSlice.actions.setMinReceive(min));
  const setFee = (fee: string) => dispatch(swapSlice.actions.setFee(fee));
  const setUserTokens = (tokens: UserToken[]) => dispatch(swapSlice.actions.setUserTokens(tokens));
  const setRateError = (err: string) => dispatch(swapSlice.actions.setRateError(err));
  const setShowModal = (show: boolean) => dispatch(swapSlice.actions.setShowModal(show));
  const setShowError = (show: boolean) => dispatch(swapSlice.actions.setShowError(show));
  const setErrorMsg = (msg: string) => dispatch(swapSlice.actions.setErrorMsg(msg));
  const setShowSuccess = (show: boolean) => dispatch(swapSlice.actions.setShowSuccess(show));
  const setWalletType = (type: 'tonconnect' | 'internal') => dispatch(swapSlice.actions.setWalletType(type));
  const resetSwap = () => dispatch(swapSlice.actions.resetSwap());
  
  // Загрузка токенов пользователя
  const loadUserTokens = useCallback(() => {
    if (wallet.address) {
      try {
        const resultAction = dispatch(getUserTokens());
        if (getUserTokens.fulfilled.match(resultAction)) {
          setUserTokens(resultAction.payload);
        }
      } catch (error) {
        console.error('Ошибка при загрузке токенов:', error);
      }
    }
  }, [dispatch, wallet.address, setUserTokens]);
  
  // Получение котировки
  const fetchQuote = useCallback(async () => {
    if (!wallet.address || !swap.fromToken || !swap.toToken || !swap.amount) {
      setRate('—');
      setMinReceive('—');
      setRateError('');
      return;
    }
    
    setIsLoading(true);
    setRateError('');
    
    try {
      const resultAction = await dispatch(getQuote({
        fromToken: swap.fromToken,
        toToken: swap.toToken,
        amount: swap.amount
      }));
      
      if (getQuote.fulfilled.match(resultAction)) {
        const quote = resultAction.payload;
        setRate(`${(parseFloat(quote.expectedAmount) / parseFloat(swap.amount)).toFixed(4)} ${swap.toToken} за 1 ${swap.fromToken}`);
        setMinReceive(quote.minAmountOut);
        setFee('0.1%');
      } else {
        setRate('—');
        setMinReceive('—');
        setRateError('Пара недоступна или нет ликвидности в выбранной сети.');
      }
    } catch (error) {
      setRate('—');
      setMinReceive('—');
      setRateError('Ошибка при получении котировки.');
    } finally {
      setIsLoading(false);
    }
  }, [
    dispatch, wallet.address, swap.fromToken, swap.toToken, swap.amount,
    setRate, setMinReceive, setRateError, setFee
  ]);
  
  // Выполнение свопа
  const performSwap = useCallback(async () => {
    if (!wallet.address || !tonConnectUI) {
      setErrorMsg('Кошелек не подключен');
      setShowError(true);
      return;
    }
    
    setIsLoading(true);

    try {
      const resultAction = await dispatch(swapThunk({
        fromToken: swap.fromToken,
        toToken: swap.toToken,
        amount: swap.amount,
        tonConnectUI
      }));

      if (swapThunk.fulfilled.match(resultAction)) {
        setShowSuccess(true);
        setAmount('');
        await loadUserTokens(); // Обновляем токены после свопа
      } else {
        setErrorMsg(resultAction.payload as string || 'Ошибка свопа');
        setShowError(true);
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Ошибка свопа');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  }, [
    dispatch, wallet.address, swap.fromToken, swap.toToken, swap.amount,
    tonConnectUI, setErrorMsg, setShowError, setShowSuccess, setAmount, loadUserTokens
  ]);
  
  // Загружаем токены пользователя при подключении кошелька
  useEffect(() => {
    if (wallet.address) {
      loadUserTokens();
    }
  }, [wallet.address, loadUserTokens]);
  
  // Обновляем котировку при изменении параметров свопа
  useEffect(() => {
    fetchQuote();
  }, [swap.fromToken, swap.toToken, swap.amount, fetchQuote]);
  
  return {
    ...swap,
    walletAddress: wallet.address,
    walletNetwork: wallet.network,
    isLoading,
    // Методы управления состоянием
    setFromToken, 
    setToToken, 
    setAmount, 
    setRate, 
    setMinReceive, 
    setFee,
    setUserTokens, 
    setRateError,
    setShowModal, 
    setShowError, 
    setErrorMsg,
    setShowSuccess, 
    setWalletType, 
    resetSwap,
    // Методы для операций
    loadUserTokens,
    fetchQuote,
    performSwap
  };
}; 