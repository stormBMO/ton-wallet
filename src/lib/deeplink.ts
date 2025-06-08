import { Address } from '@ton/core';
import { Network } from '@/store/slices/wallet/types';

export interface TokenForLink {
  symbol: string;
  address?: string; // Адрес контракта токена, если это не TON (jetton master address)
}

/**
 * Правильно конвертирует адрес в non-bounceable формат для указанной сети.
 * Использует @ton/core для корректной конвертации с правильным checksum.
 */
function normalizeAddress(addressString: string, network: Network): string {
    try {
        // Парсим адрес с помощью @ton/core
        const address = Address.parse(addressString);
        
        // Конвертируем в non-bounceable формат для нужной сети
        const normalizedAddress = address.toString({
            urlSafe: true,
            bounceable: false,
            testOnly: network === 'testnet'
        });
        
        return normalizedAddress;
    } catch {
        return addressString;
    }
}

/**
 * Генерирует TON-deeplink для пополнения кошелька.
 * @param userWalletAddress Адрес кошелька пользователя.
 * @param network Сеть (mainnet или testnet).
 * @param token Информация о токене. Если undefined или symbol === 'TON', генерируется ссылка для TON.
 *              Для jetton-ов используется адрес контракта из token.address.
 * @returns Сформированная TON-deeplink строка.
 */
export const getTonLink = (userWalletAddress: string, network: Network, token?: TokenForLink): string => {
    if (!userWalletAddress) {
        return '';
    }

    // Правильно конвертируем адрес для указанной сети
    const normalizedAddress = normalizeAddress(userWalletAddress, network);

    if (!token || token.symbol === 'TON') {
        return `ton://transfer/${normalizedAddress}`;
    }
  
    // Для jetton transfers
    if (token.address) {
        return `ton://transfer/${normalizedAddress}?jetton=${token.address}`;
    }
    
    // Fallback
    return `ton://transfer/${normalizedAddress}`;
}; 