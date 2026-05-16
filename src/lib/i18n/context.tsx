'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { AppLanguage, UserProfile } from '@/lib/types';
import { translations } from './translations';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';

interface LanguageContextProps {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: any;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>('en');
  const { user } = useUser();
  const db = useFirestore();

  // Sync with Firestore profile if logged in
  const profileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, "users", user.uid);
  }, [user, db]);

  const { data: profile } = useDoc<UserProfile>(profileRef);

  useEffect(() => {
    // 1. Check localStorage first
    const savedLang = localStorage.getItem('rosaline-language') as AppLanguage;
    if (savedLang && ['en', 'ar', 'fr'].includes(savedLang)) {
      setLanguage(savedLang);
    } 
    // 2. Fallback to browser lang on first visit
    else if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.split('-')[0] as AppLanguage;
      if (['en', 'ar', 'fr'].includes(browserLang)) {
        setLanguage(browserLang);
      }
    }
  }, []);

  // 3. Sync with profile preference if it differs from current state
  useEffect(() => {
    if (profile?.language && profile.language !== language) {
      setLanguage(profile.language);
      localStorage.setItem('rosaline-language', profile.language);
    }
  }, [profile?.language]);

  // Update global HTML attributes for RTL/LTR
  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    
    // Apply font-arabic to body if needed
    if (language === 'ar') {
      document.body.classList.add('font-arabic');
    } else {
      document.body.classList.remove('font-arabic');
    }
  }, [language]);

  const handleSetLanguage = (lang: AppLanguage) => {
    setLanguage(lang);
    localStorage.setItem('rosaline-language', lang);
  };

  const t = useMemo(() => translations[language] || translations.en, [language]);
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
