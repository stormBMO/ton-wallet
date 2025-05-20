import apiClient from './axios';
import { RiskMetrics, RiskV2Metrics } from '@/store/slices/risk/types';

export type RiskApiType = 'v1' | 'v2';

export async function fetchRiskV1(address: string): Promise<RiskMetrics> {
    const { data } = await apiClient.post<RiskMetrics>('/api/risk/calculate', { token_address: address });
    return data;
}

export async function fetchRiskV2(address: string): Promise<RiskV2Metrics> {
    const { data } = await apiClient.get<RiskV2Metrics>(`/api/risk_v2/${address}`);
    return data;
}

export async function fetchRisk(address: string, apiType: RiskApiType = 'v2') {
    if (apiType === 'v2') {
        return fetchRiskV2(address);
    }
    return fetchRiskV1(address);
} 