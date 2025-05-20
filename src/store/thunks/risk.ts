import { createAsyncThunk } from "@reduxjs/toolkit";
import { RiskMetrics, RiskV2Metrics } from "../slices/risk/types";
import { RootState } from "..";
import { fetchRisk, RiskApiType } from "@/api/riskApi";

export type RiskThunkResult = RiskMetrics | RiskV2Metrics;

export const fetchRiskMetrics = createAsyncThunk<
  RiskThunkResult,
  { address: string; apiType?: RiskApiType },
  { rejectValue: string }
>(
  'risk/fetchRiskMetrics',
  async ({ address, apiType = 'v2' }, { rejectWithValue }) => {
    try {
      const data = await fetchRisk(address, apiType);
      return data;
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