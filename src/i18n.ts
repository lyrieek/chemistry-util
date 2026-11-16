import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import zh from './locales/zh.json'
import en from './locales/en.json'

export type Lang = 'zh' | 'en'

i18n.use(initReactI18next).init({
  resources: {
    zh,
    en,
  },
  lng: 'zh',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})
