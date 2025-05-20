import { getTonLink, TokenForLink } from '../lib/deeplink';

describe('getTonLink', () => {
    const userAddress = 'EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xoBHR';

    test('should generate a TON link for native TON token', () => {
        expect(getTonLink(userAddress, undefined)).toBe(`ton://transfer/${userAddress}`);
    });

    test('should generate a TON link for native TON token when symbol is TON', () => {
        const token: TokenForLink = { symbol: 'TON' };
        expect(getTonLink(userAddress, token)).toBe(`ton://transfer/${userAddress}`);
    });

    test('should generate a TON link for a jetton with address', () => {
        const jettonAddress = 'EQAvlWFDxGF2lXm67y4K2ex9_eP6wRpda5S16HPUiZmyhP_j';
        const token: TokenForLink = { symbol: 'jUSDT', address: jettonAddress };
        const expectedLink = `ton://transfer/${userAddress}?amount=0&bin=${jettonAddress}`;
        expect(getTonLink(userAddress, token)).toBe(expectedLink);
    });

    test('should generate a TON link for a jetton and match with regex for bin parameter', () => {
        const jettonAddress = '0:abc123xyz789'; // Пример адреса
        const token: TokenForLink = { symbol: 'MyJetton', address: jettonAddress };
        // Проверяем, что ссылка содержит amount=0 и параметр bin с адресом токена
        expect(getTonLink(userAddress, token)).toMatch(/^ton:\/\/transfer\/EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xoBHR\?amount=0&bin=0:abc123xyz789$/);
    });

    test('should handle jetton with undefined address by setting bin to empty string', () => {
        const token: TokenForLink = { symbol: 'jUSDT', address: undefined };
        const expectedLink = `ton://transfer/${userAddress}?amount=0&bin=`;
        expect(getTonLink(userAddress, token)).toBe(expectedLink);
    });

    test('should handle jetton with empty string address by setting bin to empty string', () => {
        const token: TokenForLink = { symbol: 'jUSDT', address: '' };
        const expectedLink = `ton://transfer/${userAddress}?amount=0&bin=`;
        expect(getTonLink(userAddress, token)).toBe(expectedLink);
    });

    test('should return an empty string or handle error if userWalletAddress is empty', () => {
    // В текущей реализации getTonLink выводит ошибку в консоль и возвращает пустую строку
    // Можно адаптировать тест, если логика обработки ошибок изменится.
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        expect(getTonLink('', undefined)).toBe('');
        expect(consoleErrorSpy).toHaveBeenCalledWith('User wallet address is required to generate a deeplink.');
        consoleErrorSpy.mockRestore();
    });
}); 