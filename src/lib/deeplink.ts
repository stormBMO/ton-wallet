export interface TokenForLink {
  symbol: string;
  address?: string; // Адрес контракта токена, если это не TON (jetton master address)
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

  if (!token || token.symbol === 'TON') {
    return `ton://transfer/${userWalletAddress}`;
  }
  
  // Для jetton-ов. По условию amount=0 и адрес токена передается в bin.
  // bin - это base64url encoded строка (обычно это cell), но для простоты тут может быть просто адрес контракта.
  // Однако, стандартные кошельки ожидают cell в base64url. Для простого текстового комментария (как адрес контракта)
  // его нужно было бы предварительно закодировать в BOC (Bag of Cells) и затем в base64url.
  // Здесь мы используем упрощенный вариант, где в bin передается просто адрес.
  // Некоторые кошельки могут неверно интерпретировать это, если ожидают BOC.
  // Для более строгого соответствия, нужно будет создать cell с комментарием (адресом токена)
  // и сериализовать его. Для данной задачи, я следую описанию: &bin=${token.address}
  return `ton://transfer/${userWalletAddress}?amount=0&bin=${token.address || ''}`;
}; 