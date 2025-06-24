import apiClient from './axios';
import { RiskMetrics, RiskV2Metrics } from '@/store/slices/risk/types';
import { RiskApiType } from './types';
import { Network } from '@/store/types';

function convertHexToBase64Address(hexAddress: string): string {
    if (!hexAddress.startsWith('0:')) {
        return hexAddress;
    }
    
    try {
        const hexPart = hexAddress.slice(2);
        const buffer = new Uint8Array(hexPart.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []);
        
        const base64 = btoa(String.fromCharCode(...buffer));
        return `EQ${base64}`;
    } catch (error) {
        console.warn(`Failed to convert hex address: ${hexAddress}`, error);
        return hexAddress;
    }
}

function isValidTokenAddress(address: string): boolean {
    if (address === "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c") {
        return true;
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(address)) {
        return false;
    }
    
    return true;
}

export async function fetchRiskV1(address: string): Promise<RiskMetrics> {
    if (!isValidTokenAddress(address)) {
        throw new Error(`Invalid token address: ${address}`);
    }
    
    const convertedAddress = convertHexToBase64Address(address);
    
    const { data } = await apiClient.get<RiskMetrics>(`/api/risk_v1/${convertedAddress}`);
    return data;
}

export async function fetchRiskV2(address: string, network: Network = 'mainnet'): Promise<RiskV2Metrics> {
    if (!isValidTokenAddress(address)) {
        throw new Error(`Invalid token address: ${address}`);
    }
    
    const convertedAddress = convertHexToBase64Address(address);
    
    const { data } = await apiClient.get<RiskV2Metrics>(`/api/risk_v2/`, {
        params: { 
            token_address: convertedAddress,
            network: network
        }
    });
    return data;
}

export async function fetchRisk(address: string, apiType: RiskApiType = 'v2', network: Network = 'mainnet') {
    if (apiType === 'v2') {
        return fetchRiskV2(address, network);
    }
    return fetchRiskV1(address);
} 