const fs = require('fs');
const path = require('path');

// Импортируем константы (мы симулируем их здесь, так как это Node.js)
const APP_URL = 'https://1b48-77-243-81-136.ngrok-free.app'; // Обновите здесь свой ngrok URL

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