import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/api/axios';
import { RiskMetrics } from './types';
  
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

export const fetchRiskMetrics = createAsyncThunk<
  RiskMetrics, // Тип возвращаемого значения при успехе
  { address: string }, // Тип аргумента thunk
  { rejectValue: string } // Тип значения при ошибке (от rejectWithValue)
>(
  'risk/fetchRiskMetrics',
  async ({ address }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<RiskMetrics>('/api/risk/calculate', {
        address,
        period: 30,
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.detail) {
        return rejectWithValue(error.response.data.detail as string);
      }
      if (error.message) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch risk metrics');
    }
  }
);

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