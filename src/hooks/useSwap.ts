import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/index';
import { swapSlice } from '../store/slices/swap/swapSlice';

export const useSwap = () => {
  const dispatch = useDispatch();
  const swap = useSelector((state: RootState) => state.swap);

  const setFromToken = (token: string) => dispatch(swapSlice.actions.setFromToken(token));
  const setToToken = (token: string) => dispatch(swapSlice.actions.setToToken(token));
  const setAmount = (amount: string) => dispatch(swapSlice.actions.setAmount(amount));
  const setRate = (rate: string) => dispatch(swapSlice.actions.setRate(rate));
  const setMinReceive = (min: string) => dispatch(swapSlice.actions.setMinReceive(min));
  const setFee = (fee: string) => dispatch(swapSlice.actions.setFee(fee));
  const setUserTokens = (tokens: any[]) => dispatch(swapSlice.actions.setUserTokens(tokens));
  const setRateError = (err: string) => dispatch(swapSlice.actions.setRateError(err));
  const setShowModal = (show: boolean) => dispatch(swapSlice.actions.setShowModal(show));
  const setShowError = (show: boolean) => dispatch(swapSlice.actions.setShowError(show));
  const setErrorMsg = (msg: string) => dispatch(swapSlice.actions.setErrorMsg(msg));
  const setShowSuccess = (show: boolean) => dispatch(swapSlice.actions.setShowSuccess(show));
  const setWalletType = (type: 'tonconnect' | 'internal') => dispatch(swapSlice.actions.setWalletType(type));
  const resetSwap = () => dispatch(swapSlice.actions.resetSwap());

  return {
    ...swap,
    setFromToken, setToToken, setAmount, setRate, setMinReceive, setFee,
    setUserTokens, setRateError, setShowModal, setShowError, setErrorMsg,
    setShowSuccess, setWalletType, resetSwap
  };
}; 