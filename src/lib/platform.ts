
export function isTelegram(): boolean {
    return typeof window !== 'undefined' &&
    typeof window.Telegram !== 'undefined' &&
    typeof window.Telegram.WebApp !== 'undefined';
}

export function initTelegram(options?: { onClose?: () => void }) {
    if (!isTelegram() || !window.Telegram || !window.Telegram.WebApp) return;
    const tg = window.Telegram.WebApp;
    tg.ready();

    if (tg.themeParams) {
        const root = document.documentElement;
        for (const [key, value] of Object.entries(tg.themeParams)) {
            if (typeof value === 'string') {
                root.style.setProperty(`--tg-${key}`, value);
            }
        }
    }

    if (typeof options?.onClose === 'function') {
        tg.onEvent('close', options.onClose);
    }
    if (typeof tg.close === 'function') {
        tg.close();
    }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        close: () => void;
        onEvent: (event: string, cb: () => void) => void;
        themeParams?: Record<string, string>;
        isClosable?: boolean;
      };
    };
  }
} 