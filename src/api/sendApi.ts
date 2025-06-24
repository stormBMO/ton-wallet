import { Address, beginCell, toNano } from '@ton/core';
import { TonConnectUI } from '@tonconnect/ui-react';
import { SendTransactionParams, SendResult } from './types';

export const validateTonAddress = (address: string): boolean => {
    try {
        Address.parse(address);
        return true;
    } catch {
        return false;
    }
};

const createCommentPayload = (comment: string) => {
    return beginCell()
        .storeUint(0, 32)
        .storeStringTail(comment)
        .endCell();
};

export const sendTonTransaction = async (
    params: SendTransactionParams,
    tonConnectUI: TonConnectUI
): Promise<SendResult> => {
    try {
        const { to, amount, comment } = params;

        if (!validateTonAddress(to)) {
            return {
                success: false,
                error: 'Неверный формат адреса'
            };
        }

        const message: {
      address: string;
      amount: string;
      payload?: string;
    } = {
        address: to,
        amount: toNano(amount).toString()
    };

        if (comment && comment.trim()) {
            message.payload = createCommentPayload(comment.trim()).toBoc().toString('base64');
        }

        const result = await tonConnectUI.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [message]
        });

        return {
            success: true,
            txHash: result.boc
        };

    } catch (error: unknown) {
        console.error('Ошибка отправки TON транзакции:', error);
    
        const errorMessage = error instanceof Error 
            ? error.message 
            : 'Неизвестная ошибка при отправке транзакции';
    
        return {
            success: false,
            error: errorMessage
        };
    }
};

export const estimateTransactionFee = (params: SendTransactionParams): string => {
    if (params.jettonAddress) {
        return '0.1';
    }
    return '0.01';
}; 