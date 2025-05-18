import { createSlice } from '@reduxjs/toolkit';
import { RiskMetrics } from './types';
import { fetchRiskMetrics } from '@/store/thunks/risk';
  
export interface RiskState {
  byToken: Record<string, RiskMetrics | undefined>;
  status: Record<string, 'idle' | 'loading' | 'succeeded' | 'failed'>;
  error: Record<string, string | null | undefined>;
}

const initialState: RiskState = {
  byToken: {},
  status: {},
  error: {},
};

const riskSlice = createSlice({
  name: 'risk', 
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRiskMetrics.pending, (state, action) => {
        const { address } = action.meta.arg;
        state.status[address] = 'loading';
        state.error[address] = null;
      })
      .addCase(fetchRiskMetrics.fulfilled, (state, action) => {
        const { address } = action.meta.arg;
        state.status[address] = 'succeeded';
        state.byToken[address] = action.payload;
      })
      .addCase(fetchRiskMetrics.rejected, (state, action) => {
        const { address } = action.meta.arg;
        state.status[address] = 'failed';
        state.error[address] = action.payload;
      });
  },
});

export const riskReducer = riskSlice.reducer; 