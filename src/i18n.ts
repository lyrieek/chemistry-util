import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import zhMaterialCards from './locales/material-cards/zh.json'
import enMaterialCards from './locales/material-cards/en.json'
import zhPeriodicTable from './locales/periodic-table/zh.json'
import enPeriodicTable from './locales/periodic-table/en.json'
import { MATERIAL_CARDS_NS, PERIODIC_TABLE_NS } from './i18n-ns'

export type Lang = 'zh' | 'en'

export { MATERIAL_CARDS_NS, PERIODIC_TABLE_NS } from './i18n-ns'

const LANG_STORAGE_KEY = 'lang'
const DEFAULT_LANG: Lang = 'zh'

function isLang(value: string | null): value is Lang {
  return value === 'zh' || value === 'en'
}

export function storedLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY)
    if (isLang(saved)) return saved
  } catch {
    /* file:// 或隐私模式下拿不到存储，回退默认语言 */
  }
  return DEFAULT_LANG
}

function syncDocumentLang(lang: Lang) {
  document.documentElement.lang = lang
}

const initialLang = storedLang()

i18n.use(initReactI18next).init({
  resources: {
    zh: {
      [MATERIAL_CARDS_NS]: zhMaterialCards.translation,
      [PERIODIC_TABLE_NS]: zhPeriodicTable.translation,
    },
    en: {
      [MATERIAL_CARDS_NS]: enMaterialCards.translation,
      [PERIODIC_TABLE_NS]: enPeriodicTable.translation,
    },
  },
  defaultNS: MATERIAL_CARDS_NS,
  lng: initialLang,
  supportedLngs: ['zh', 'en'],
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

syncDocumentLang(initialLang)

export function changeLanguage(lang: Lang) {
  syncDocumentLang(lang)
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang)
  } catch {
    /* 隐私模式下写入失败可以忽略 */
  }
  return i18n.changeLanguage(lang)
}
