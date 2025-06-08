import { Address } from '@ton/core';

export interface TokenForLink {
  symbol: string;
  address?: string; // Адрес контракта токена, если это не TON (jetton master address)
}

/**
 * Правильно конвертирует адрес в testnet non-bounceable формат.
 * Использует @ton/core для корректной конвертации с правильным checksum.
 */
function normalizeForTestnet(addressString: string): string {
    try {
        // Парсим адрес с помощью @ton/core
        const address = Address.parse(addressString);
        
        // Конвертируем в testnet non-bounceable формат
        const testnetAddress = address.toString({
            urlSafe: true,
            bounceable: false,
            testOnly: true
        });
        
        console.log('🔄 Converted to testnet non-bounceable:', testnetAddress);
        return testnetAddress;
    } catch (error) {
        console.error('❌ Failed to parse address:', error);
        console.log('📍 Using original address:', addressString);
        return addressString;
    }
}

/**
 * Генерирует TON-deeplink для пополнения кошелька.
 * @param userWalletAddress Адрес кошелька пользователя.
 * @param token Информация о токене. Если undefined или symbol === 'TON', генерируется ссылка для TON.
 *              Для jetton-ов используется адрес контракта из token.address.
 * @returns Сформированная TON-deeplink строка.
 */
export const getTonLink = (userWalletAddress: string, token?: TokenForLink): string => {
    if (!userWalletAddress) {
    // В реальном приложении здесь может быть выброс ошибки или возврат значения по умолчанию
        console.error('User wallet address is required to generate a deeplink.');
        return ''; // Или какая-то заглушка
    }

    // Правильно конвертируем адрес для testnet
    const normalizedAddress = normalizeForTestnet(userWalletAddress);
    
    console.log('🔗 Original address:', userWalletAddress);
    console.log('📍 Normalized for testnet:', normalizedAddress);
    console.log('🪙 Token info:', token);

    if (!token || token.symbol === 'TON') {
        const deeplink = `ton://transfer/${normalizedAddress}`;
        console.log('✅ Generated TON deeplink:', deeplink);
        return deeplink;
    }
  
    // Для jetton transfers
    if (token.address) {
        const deeplink = `ton://transfer/${normalizedAddress}?jetton=${token.address}`;
        console.log('✅ Generated Jetton deeplink:', deeplink);
        return deeplink;
    }
    
    // Fallback
    const deeplink = `ton://transfer/${normalizedAddress}`;
    console.log('⚠️ Fallback TON deeplink:', deeplink);
    return deeplink;
}; 