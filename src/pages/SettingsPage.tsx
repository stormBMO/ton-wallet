import React, { useState } from 'react';

// Заглушки для компонентов, которые будут реализованы отдельно
const ThemeToggle = () => (
  <button className="w-full py-3 px-4 rounded-[12px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-between text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition">
    <span>Тема</span>
    <span className="ml-2">🌗</span>
  </button>
);

const LanguageSelect = () => (
  <select className="w-full py-3 px-4 rounded-[12px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition">
    <option value="ru">Русский</option>
    <option value="en">English</option>
  </select>
);

export const SettingsPage = () => {
  const [passkeyEnabled, setPasskeyEnabled] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleEnablePasskey = () => {
    setPasskeyEnabled(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md min-h-screen flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Настройки</h1>
      <section className="flex flex-col gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Тема</label>
        <ThemeToggle />
      </section>
      <section className="flex flex-col gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Язык</label>
        <LanguageSelect />
      </section>
      <section className="flex flex-col gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Безопасность</label>
        <button
          className="w-full py-3 px-4 rounded-[12px] bg-[#7C3AED] text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition"
          onClick={handleEnablePasskey}
          disabled={passkeyEnabled}
        >
          {passkeyEnabled ? 'Passkey включён' : 'Включить Passkey'}
        </button>
      </section>
      {showToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#7C3AED] text-white px-6 py-3 rounded-[12px] shadow-lg z-50 transition">Passkey Enabled</div>
      )}
    </div>
  );
};

export default SettingsPage; 