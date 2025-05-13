import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWalletStore } from '../store/wallet';

describe('useTonBalance', () => {
  it('should fetch and update balance', async () => {
    const mockAddress = 'EQD...';
    const mockBalance = '100.5';
    
    // Mock axios
    vi.mock('axios', () => ({
      default: {
        get: vi.fn().mockResolvedValue({
          data: { balance: mockBalance }
        })
      }
    }));

    const { result } = renderHook(() => useWalletStore());

    await act(async () => {
      await result.current.fetchBalances(mockAddress);
    });

    expect(result.current.tonBalance).toBe(mockBalance);
  });
});