import { createSlice } from '@reduxjs/toolkit';
import { RiskMetrics, RiskV2Metrics } from './types';
import { fetchRiskMetrics } from '@/store/thunks/risk';
  
export interface RiskState {
  byToken: Record<string, RiskMetrics | RiskV2Metrics | undefined>;
  status: Record<string, 'idle' | 'loading' | 'succeeded' | 'failed'>;
  error: Record<string, string | null | undefined>;
  apiType: 'v1' | 'v2';
}

const initialState: RiskState = {
    byToken: {},
    status: {},
    error: {},
    apiType: 'v2',
};

const riskSlice = createSlice({
    name: 'risk', 
    initialState,
    reducers: {
        setApiType(state, action) {
            state.apiType = action.payload;
        },
    },
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

export const { setApiType } = riskSlice.actions;
export const riskReducer = riskSlice.reducer; 