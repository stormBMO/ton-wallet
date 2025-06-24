import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/motion';
import { useWalletAuth } from '@/hooks/useWalletAuth';

export const SettingsPage = () => {
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
    const [language, setLanguage] = useState<'ru' | 'en'>('ru');
    const { isAuthenticated } = useWalletAuth();

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setTheme(newTheme);
    };

    const handleLanguageChange = (newLanguage: 'ru' | 'en') => {
        setLanguage(newLanguage);
    };


    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600 dark:text-gray-300 text-lg">
          Пожалуйста, подключите кошелек для доступа к настройкам.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-10">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="max-w-4xl mx-auto"
            >
                <div className="flex flex-col items-center gap-2 mb-6">
                    <h1 className="text-4xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Настройки
                    </h1>
                    <span className="text-base text-gray-600 dark:text-gray-400 font-medium">
            Персонализируйте ваш опыт использования
                    </span>
                </div>

                <motion.div
                    variants={fadeIn}
                    className="glasscard p-6 flex flex-col divide-y divide-gray-200 dark:divide-gray-800"
                >
                    {/* Раздел темы */}
                    <div className="py-3 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Тема</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Выберите тему интерфейса</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleThemeChange('light')}
                                className={`px-3 py-1 rounded-full text-sm ${
                                    theme === 'light'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                                }`}
                            >
                Светлая
                            </button>
                            <button
                                onClick={() => handleThemeChange('dark')}
                                className={`px-3 py-1 rounded-full text-sm ${
                                    theme === 'dark'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                                }`}
                            >
                Тёмная
                            </button>
                            <button
                                onClick={() => handleThemeChange('system')}
                                className={`px-3 py-1 rounded-full text-sm ${
                                    theme === 'system'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                                }`}
                            >
                Системная
                            </button>
                        </div>
                    </div>

                    {/* Раздел языка */}
                    <div className="py-3 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Язык</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Выберите язык интерфейса</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleLanguageChange('ru')}
                                className={`px-3 py-1 rounded-full text-sm ${
                                    language === 'ru'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                                }`}
                            >
                Русский
                            </button>
                            <button
                                onClick={() => handleLanguageChange('en')}
                                className={`px-3 py-1 rounded-full text-sm ${
                                    language === 'en'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                                }`}
                            >
                English
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default SettingsPage; 