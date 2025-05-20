import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserToken {
  symbol: string;
  name: string;
  balance: string;
}

interface SwapState {
  fromToken: string;
  toToken: string;
  amount: string;
  rate: string;
  minReceive: string;
  fee: string;
  rateError: string;
  showModal: boolean;
  showError: boolean;
  errorMsg: string;
  showSuccess: boolean;
  walletType: 'tonconnect' | 'internal';
}

const initialState: SwapState = {
    fromToken: 'TON',
    toToken: 'jUSDT',
    amount: '',
    rate: '',
    minReceive: '',
    fee: '',
    rateError: '',
    showModal: false,
    showError: false,
    errorMsg: '',
    showSuccess: false,
    walletType: 'tonconnect',
};

export const swapSlice = createSlice({
    name: 'swap',
    initialState,
    reducers: {
        setFromToken: (state, action: PayloadAction<string>) => { state.fromToken = action.payload; },
        setToToken: (state, action: PayloadAction<string>) => { state.toToken = action.payload; },
        setAmount: (state, action: PayloadAction<string>) => { state.amount = action.payload; },
        setRate: (state, action: PayloadAction<string>) => { state.rate = action.payload; },
        setMinReceive: (state, action: PayloadAction<string>) => { state.minReceive = action.payload; },
        setFee: (state, action: PayloadAction<string>) => { state.fee = action.payload; },
        setRateError: (state, action: PayloadAction<string>) => { state.rateError = action.payload; },
        setShowModal: (state, action: PayloadAction<boolean>) => { state.showModal = action.payload; },
        setShowError: (state, action: PayloadAction<boolean>) => { state.showError = action.payload; },
        setErrorMsg: (state, action: PayloadAction<string>) => { state.errorMsg = action.payload; },
        setShowSuccess: (state, action: PayloadAction<boolean>) => { state.showSuccess = action.payload; },
        setWalletType: (state, action: PayloadAction<'tonconnect' | 'internal'>) => { state.walletType = action.payload; },
        resetSwap: () => initialState,
    },
});

export const {
    setFromToken, setToToken, setAmount, setRate, setMinReceive, setFee,
    setRateError, setShowModal, setShowError, setErrorMsg,
    setShowSuccess, setWalletType, resetSwap
} = swapSlice.actions;

export const swapReducer = swapSlice.reducer; 