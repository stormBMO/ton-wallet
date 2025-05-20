import { walletReducer, setTokens, WalletState } from '../store/slices/wallet/walletSlice';
import { Token, Network } from '../store/slices/wallet/types';
import { updateRates } from '../store/slices/wallet/walletSlice';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';

describe('walletSlice', () => {
    it('should set tokens with setTokens action', () => {
        const initialState: WalletState = {
            address: null,
            mnemonic: null,
            network: 'testnet' as Network,
            status: 'idle',
            error: null,
            tokens: [],
            totalTonValue: '0',
            riskScore: 0,
            isLoading: false,
        };

        const tokens: Token[] = [
            { address: 'addr1', symbol: 'TON', name: 'Toncoin', balance: '10.5' },
            { address: 'addr2', symbol: 'JETTON1', name: 'Test Jetton 1', balance: '100' },
            { address: 'addr3', symbol: 'JETTON2', name: 'Test Jetton 2', balance: '200' }
        ];

        const newState = walletReducer(initialState, setTokens(tokens));

        expect(newState.tokens.length).toBe(3);
        expect(newState.tokens[0].symbol).toBe('TON');
        expect(newState.tokens[1].symbol).toBe('JETTON1');
        expect(newState.tokens[2].symbol).toBe('JETTON2');
    });

    it('should update token rates and recalculate totalTonValue', () => {
        const initialState: WalletState = {
            address: null,
            mnemonic: null,
            network: 'testnet' as Network,
            status: 'idle',
            error: null,
            tokens: [
                { address: 'addr1', symbol: 'TON', name: 'Toncoin', balance: '10.5' },
                { address: 'addr2', symbol: 'JETTON1', name: 'Test Jetton 1', balance: '100' },
                { address: 'addr3', symbol: 'JETTON2', name: 'Test Jetton 2', balance: '200' }
            ],
            totalTonValue: '0',
            riskScore: 0,
            isLoading: false,
        };

        const rates = [
            { address: 'addr1', priceTon: '1' },  // TON
            { address: 'addr2', priceTon: '0.05' }, // 1 JETTON1 = 0.05 TON
            { address: 'addr3', priceTon: '0.1' },  // 1 JETTON2 = 0.1 TON
        ];

        const newState = walletReducer(initialState, updateRates(rates));

        // Проверяем, что курсы обновились
        expect(newState.tokens[0].priceTon).toBe('1');
        expect(newState.tokens[1].priceTon).toBe('0.05');
        expect(newState.tokens[2].priceTon).toBe('0.1');

        // Проверяем, что totalTonValue пересчитан
        // 10.5 TON + (100 * 0.05) TON + (200 * 0.1) TON = 10.5 + 5 + 20 = 35.5 TON
        expect(newState.totalTonValue).toBe('35.5000');
    });
}); 