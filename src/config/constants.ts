// Основные URL конфигурации
export const APP_CONFIG = {
    // Основной URL приложения (ngrok или localhost)
    APP_URL: 'https://9b27-169-150-228-23.ngrok-free.app',
    
    // URL бэкенда
    BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000',
    
    // Генерируемые URL на основе основного
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

// TON Connect конфигурация
export const TON_CONNECT_CONFIG = {
    MANIFEST_URL: APP_CONFIG.MANIFEST_URL
};