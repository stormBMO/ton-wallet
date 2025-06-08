import { Address, beginCell, toNano } from '@ton/core';
import { TonConnectUI } from '@tonconnect/ui-react';

export interface SendTransactionParams {
  to: string;
  amount: string; // В TON (человекочитаемый формат)
  comment?: string;
  jettonAddress?: string; // Для jetton transfers
}

export interface SendResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

/**
 * Валидирует TON адрес
 */
export const validateTonAddress = (address: string): boolean => {
    try {
        Address.parse(address);
        return true;
    } catch {
        return false;
    }
};

/**
 * Создает payload для комментария
 */
const createCommentPayload = (comment: string) => {
    return beginCell()
        .storeUint(0, 32) // op code для комментария
        .storeStringTail(comment)
        .endCell();
};

/**
 * Отправляет TON транзакцию
 */
export const sendTonTransaction = async (
    params: SendTransactionParams,
    tonConnectUI: TonConnectUI
): Promise<SendResult> => {
    try {
        const { to, amount, comment } = params;

        // Валидация адреса
        if (!validateTonAddress(to)) {
            return {
                success: false,
                error: 'Неверный формат адреса'
            };
        }

        // Подготавливаем сообщение
        const message: {
      address: string;
      amount: string;
      payload?: string;
    } = {
        address: to,
        amount: toNano(amount).toString()
    };

        // Добавляем комментарий если есть
        if (comment && comment.trim()) {
            message.payload = createCommentPayload(comment.trim()).toBoc().toString('base64');
        }

        // Отправляем транзакцию
        const result = await tonConnectUI.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 600, // 10 минут
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

/**
 * Рассчитывает примерную комиссию для транзакции
 */
export const estimateTransactionFee = (params: SendTransactionParams): string => {
    // Простая оценка комиссий
    if (params.jettonAddress) {
        return '0.1'; // Jetton transfer
    }
    return '0.01'; // TON transfer
}; 