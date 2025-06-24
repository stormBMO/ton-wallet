export const APP_CONFIG = {
    APP_URL: 'https://personal-ton-wallet.vercel.app/',
    
    BACKEND_URL: import.meta.env.VITE_APP_BACKEND_URL || process.env.VITE_APP_BACKEND_URL || 'http://127.0.0.1:8000',
    
    get MANIFEST_URL() {
        return `${this.APP_URL}/tonconnect-manifest.json`;
    },
    
    get ICON_URL() {
        return `${this.APP_URL}/vite.svg`;
    },
    
    get TERMS_URL() {
        return `${this.APP_URL}/terms.html`;
    },
    
    get PRIVACY_URL() {
        return `${this.APP_URL}/privacy.html`;
    }
};

export const TON_CONNECT_CONFIG = {
    MANIFEST_URL: APP_CONFIG.MANIFEST_URL
};