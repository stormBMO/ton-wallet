import apiClient from './axios';
import { RiskMetrics, RiskV2Metrics } from '@/store/slices/risk/types';

export type RiskApiType = 'v1' | 'v2';

// Конвертация hex-адреса TON в base64 (EQ-формат)
function convertHexToBase64Address(hexAddress: string): string {
    if (!hexAddress.startsWith('0:')) {
        return hexAddress; // Уже в правильном формате
    }
    
    try {
        // Удаляем "0:" и конвертируем hex в buffer
        const hexPart = hexAddress.slice(2);
        const buffer = new Uint8Array(hexPart.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []);
        
        // Конвертируем в base64 и добавляем префикс EQ
        const base64 = btoa(String.fromCharCode(...buffer));
        return `EQ${base64}`;
    } catch (error) {
        console.warn(`Failed to convert hex address: ${hexAddress}`, error);
        return hexAddress; // Возвращаем оригинал при ошибке
    }
}

// Проверка валидности адреса
function isValidTokenAddress(address: string): boolean {
    // Нулевой адрес TON
    if (address === "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c") {
        return false;
    }
    
    // UUID токены
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(address)) {
        return false;
    }
    
    // Разрешаем hex-адреса - они будут конвертированы
    // if (address.startsWith('0:') && address.length > 60) {
    //     return false;
    // }
    
    return true;
}

export async function fetchRiskV1(address: string): Promise<RiskMetrics> {
    if (!isValidTokenAddress(address)) {
        throw new Error(`Invalid token address: ${address}`);
    }
    
    // Конвертируем hex-адрес если нужно
    const convertedAddress = convertHexToBase64Address(address);
    
    const { data } = await apiClient.get<RiskMetrics>(`/api/risk_v1/${convertedAddress}`);
    return data;
}

export async function fetchRiskV2(address: string): Promise<RiskV2Metrics> {
    if (!isValidTokenAddress(address)) {
        throw new Error(`Invalid token address: ${address}`);
    }
    
    // Конвертируем hex-адрес если нужно
    const convertedAddress = convertHexToBase64Address(address);
    
    // Используем query параметр вместо path параметра для решения проблемы с URL encoding
    const { data } = await apiClient.get<RiskV2Metrics>(`/api/risk_v2/`, {
        params: { token_address: convertedAddress }
    });
    return data;
}

export async function fetchRisk(address: string, apiType: RiskApiType = 'v2') {
    if (apiType === 'v2') {
        return fetchRiskV2(address);
    }
    return fetchRiskV1(address);
} 