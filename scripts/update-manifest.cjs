const fs = require('fs');
const path = require('path');

// Обновите здесь свой ngrok URL
const APP_URL = 'https://9b27-169-150-228-23.ngrok-free.app';

// Извлекаем домен для проверки
const extractDomain = (url) => {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
};

const manifest = {
    url: APP_URL,
    name: "TON Wallet Dashboard",
    iconUrl: `${APP_URL}/vite.svg`,
    termsOfUseUrl: `${APP_URL}/terms.html`,
    privacyPolicyUrl: `${APP_URL}/privacy.html`
};

const manifestPath = path.join(__dirname, '../public/tonconnect-manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 4));

console.log('✅ Манифест обновлен!');
console.log('📄 Manifest URL:', `${APP_URL}/tonconnect-manifest.json`);
console.log('🔗 App URL:', APP_URL);
console.log('🌐 Domain:', extractDomain(APP_URL));
console.log('');
console.log('⚠️  ВАЖНО: После смены ngrok URL нужно:');
console.log('1️⃣  Обновить APP_URL в src/config/constants.ts');
console.log('2️⃣  Перезапустить сервер: npm run dev');
console.log('3️⃣  Очистить кэш TON Connect (Full Reset в Debug панели)');