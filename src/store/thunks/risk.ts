import { createAsyncThunk } from "@reduxjs/toolkit";
import { RiskMetrics } from "../slices/risk/types";
import { RootState } from "..";
import apiClient from "@/api/axios";

export const fetchRiskMetrics = createAsyncThunk<
  RiskMetrics,
  { address: string },
  { rejectValue: string }
>(
  'risk/fetchRiskMetrics',
  async ({ address }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<RiskMetrics>('/api/risk/calculate', {        
            token_address: address,
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