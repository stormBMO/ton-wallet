import { describe, it, expect } from 'vitest';
import { calculateVolatility, calculateRiskScore } from '../lib/ton';

describe('Volatility Calculation', () => {
    it('should calculate volatility correctly', () => {
        const prices = [100, 105, 98, 102, 107, 103, 101, 104, 106, 105];
        const volatility = calculateVolatility(prices);
    
        // Проверяем, что волатильность положительная и имеет разумное значение
        expect(volatility).toBeGreaterThan(0);
        expect(volatility).toBeLessThan(1);
    });

    it('should calculate risk score correctly', () => {
        const volatility = 0.1; // 10% волатильность
        const riskScore = calculateRiskScore(volatility);
    
        // Risk Score = min(100, round(0.1 * 800)) = 80
        expect(riskScore).toBe(80);
    });

    it('should cap risk score at 100', () => {
        const volatility = 0.2; // 20% волатильность
        const riskScore = calculateRiskScore(volatility);
    
        // Risk Score = min(100, round(0.2 * 800)) = 100
        expect(riskScore).toBe(100);
    });
});