import { type PropsWithChildren, useEffect, useState } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from '@/shared/lib/i18n/locales/en/common.json';
import enAuth from '@/shared/lib/i18n/locales/en/auth.json';
import enTrading from '@/shared/lib/i18n/locales/en/trading.json';
import enWallet from '@/shared/lib/i18n/locales/en/wallet.json';
import enSignals from '@/shared/lib/i18n/locales/en/signals.json';
import enSettings from '@/shared/lib/i18n/locales/en/settings.json';
import enKyc from '@/shared/lib/i18n/locales/en/kyc.json';

export type Locale = 'en';
export const SUPPORTED_LOCALES: Locale[] = ['en'];

// Initialize i18next once
if (!i18n.isInitialized) {
  i18n.use(LanguageDetector).use(initReactI18next).init({
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    interpolation: { escapeValue: false },
    returnObjects: true,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    resources: {
      en: {
        common: enCommon,
        auth: enAuth,
        trading: enTrading,
        wallet: enWallet,
        signals: enSignals,
        settings: enSettings,
        kyc: enKyc,
      },
    },
    ns: ['common', 'auth', 'trading', 'wallet', 'signals', 'settings', 'kyc'],
    defaultNS: 'common',
  });
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(i18n.isInitialized);

  useEffect(() => {
    if (!ready) {
      i18n.on('initialized', () => setReady(true));
    }
  }, [ready]);

  if (!ready) return null;

  return <>{children}</>;
}
