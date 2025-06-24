const fs = require('fs');
const path = require('path');

const APP_URL = process.env.URL || 'https://38d7-79-127-224-13.ngrok-free.app';

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

console.log('Манифест обновлен!');
console.log(' Manifest URL:', `${APP_URL}/tonconnect-manifest.json`);
console.log('App URL:', APP_URL);
console.log(' Domain:', extractDomain(APP_URL));
console.log('');
console.log('!!! ВАЖНО: После смены ngrok URL нужно: !!!');
console.log('1. Обновить APP_URL в src/config/constants.ts');
console.log('2. Перезапустить сервер: npm run dev');
console.log('3. Очистить кэш TON Connect (Full Reset в Debug панели)');