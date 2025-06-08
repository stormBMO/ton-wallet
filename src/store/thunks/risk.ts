import { createAsyncThunk } from "@reduxjs/toolkit";
import { RiskMetrics, RiskV2Metrics } from "../slices/risk/types";
import { fetchRisk, RiskApiType } from "@/api/riskApi";

export type RiskThunkResult = RiskMetrics | RiskV2Metrics;

export const fetchRiskMetrics = createAsyncThunk<
  RiskThunkResult,
  { address: string; apiType?: RiskApiType; network?: 'mainnet' | 'testnet' },
  { rejectValue: string }
>(
    'risk/fetchRiskMetrics',
    async ({ address, apiType = 'v2', network = 'mainnet' }, { rejectWithValue }) => {
        try {
            const data = await fetchRisk(address, apiType, network);
            return data;
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const httpError = error as { response?: { data?: { detail?: string } } };
                if (httpError?.response?.data?.detail) {
                    return rejectWithValue(httpError.response.data.detail);
                }
            }
            if (error && typeof error === 'object' && 'message' in error) {
                const messageError = error as { message: string };
                return rejectWithValue(messageError.message);
            }
            return rejectWithValue('Failed to fetch risk metrics');
        }
    }
);