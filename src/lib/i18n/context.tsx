
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppLanguage } from '@/lib/types';
import { translations } from './translations';

interface LanguageContextProps {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: any;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('rosaline-language') as AppLanguage;
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      const browserLang = navigator.language.split('-')[0] as AppLanguage;
      if (['en', 'ar', 'fr'].includes(browserLang)) {
        setLanguage(browserLang);
      }
    }
  }, []);

  const handleSetLanguage = (lang: AppLanguage) => {
    setLanguage(lang);
    localStorage.setItem('rosaline-language', lang);
  };

  const t = translations[language];
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, dir }}>
      <div dir={dir} className={language === 'ar' ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
