import { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { AppDispatch, RootState } from '../store/index';
import { swapSlice } from '../store/slices/swap/swapSlice';
import { getQuote, swapThunk } from '@/store/thunks/swap';
import { loadWalletData } from '@/store/thunks/wallet';
import { useWalletAuth } from './useWalletAuth';

export const useSwap = () => {
    const dispatch = useDispatch<AppDispatch>();
    const swap = useSelector((state: RootState) => state.swap);
    const wallet = useSelector((state: RootState) => state.wallet);
    const [tonConnectUI] = useTonConnectUI();
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated, address: walletAddress } = useWalletAuth();
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const userTokens = wallet.tokens || [];

    // Методы для работы с локальным состоянием свопа
    const setFromToken = (token: string) => dispatch(swapSlice.actions.setFromToken(token));
    const setToToken = (token: string) => dispatch(swapSlice.actions.setToToken(token));
    const setAmount = (amount: string) => dispatch(swapSlice.actions.setAmount(amount));
    const setRate = (rate: string) => dispatch(swapSlice.actions.setRate(rate));
    const setMinReceive = (min: string) => dispatch(swapSlice.actions.setMinReceive(min));
    const setFee = (fee: string) => dispatch(swapSlice.actions.setFee(fee));
    const setRateError = (err: string) => dispatch(swapSlice.actions.setRateError(err));
    const setShowModal = (show: boolean) => dispatch(swapSlice.actions.setShowModal(show));
    const setShowError = (show: boolean) => dispatch(swapSlice.actions.setShowError(show));
    const setErrorMsg = (msg: string) => dispatch(swapSlice.actions.setErrorMsg(msg));
    const setShowSuccess = (show: boolean) => dispatch(swapSlice.actions.setShowSuccess(show));
    const setWalletType = (type: 'tonconnect' | 'internal') => dispatch(swapSlice.actions.setWalletType(type));
    const resetSwap = () => dispatch(swapSlice.actions.resetSwap());

    // Получение котировки с правильной обработкой ошибок и отсутствия ликвидности
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
                const quote = resultAction.payload as any;
                // Если есть ошибка или нет ликвидности — не обновляем котировку и не делаем повторных запросов
                if (quote?.error || quote?.rate === '—' || quote?.expectedAmount === '0') {
                    setRate('—');
                    setMinReceive('—');
                    let errorMsg = quote?.error || 'Нет котировки для выбранной пары';
                    
                    // Улучшенные сообщения об ошибках
                    if (errorMsg.includes('Asset not found')) {
                        errorMsg = `Токены ${swap.fromToken} или ${swap.toToken} не поддерживаются MyTonSwap в testnet. Попробуйте виджет или другие токены.`;
                    } else if (errorMsg.includes('No route found')) {
                        errorMsg = 'Нет маршрута для обмена этих токенов. Попробуйте другую пару или виджет MyTonSwap.';
                    } else if (errorMsg.includes('No liquidity')) {
                        errorMsg = 'Недостаточная ликвидность для обмена. Попробуйте меньшую сумму или виджет MyTonSwap.';
                    }
                    
                    setRateError(errorMsg);
                    return;
                }
                setRate(`${(parseFloat(quote.expectedAmount) / parseFloat(swap.amount)).toFixed(4)} ${swap.toToken} за 1 ${swap.fromToken}`);
                setMinReceive(quote.minAmountOut);
                setFee('0.1%');
            } else {
                setRate('—');
                setMinReceive('—');
                setRateError(resultAction.payload as string || 'Пара недоступна или нет ликвидности. Попробуйте виджет MyTonSwap.');
            }
        } catch (error: any) {
            setRate('—');
            setMinReceive('—');
            setRateError('Ошибка получения котировки. Попробуйте виджет MyTonSwap.');
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, wallet.address, swap.fromToken, swap.toToken, swap.amount, setRate, setMinReceive, setRateError, setFee, swap.toToken, swap.fromToken]);

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
    }, [dispatch, wallet.address, swap.fromToken, swap.toToken, swap.amount, tonConnectUI, setErrorMsg, setShowError, setShowSuccess, setAmount]);

    // Обновляем котировку при изменении параметров свопа с debounce
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchQuote();
        }, 1000);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [swap.fromToken, swap.toToken, swap.amount, fetchQuote]);

    // Автоматическая загрузка токенов при заходе на своп
    useEffect(() => {
        if (isAuthenticated && walletAddress && wallet.network) {
            dispatch(loadWalletData({ address: walletAddress, network: wallet.network }));
        }
    }, [isAuthenticated, walletAddress, wallet.network, dispatch]);

    return {
        ...swap,
        walletAddress: wallet.address,
        walletNetwork: wallet.network,
        isLoading,
        userTokens: userTokens || [],
        setFromToken, 
        setToToken, 
        setAmount, 
        setRate, 
        setMinReceive, 
        setFee,
        setRateError,
        setShowModal, 
        setShowError, 
        setErrorMsg,
        setShowSuccess, 
        setWalletType, 
        resetSwap,
        fetchQuote,
        performSwap
    };
}; 