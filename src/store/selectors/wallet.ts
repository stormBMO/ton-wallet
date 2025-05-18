import { RootState } from '@/store';

export const selectTokens = (state: RootState) => state.wallet.tokens;
export const selectTotalTonValue = (state: RootState) => state.wallet.totalTonValue; 