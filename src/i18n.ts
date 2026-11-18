import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import zhMaterialCards from './locales/material-cards/zh.json'
import enMaterialCards from './locales/material-cards/en.json'
import zhPeriodicTable from './locales/periodic-table/zh.json'
import enPeriodicTable from './locales/periodic-table/en.json'

export type Lang = 'zh' | 'en'

export const MATERIAL_CARDS_NS = 'material-cards'
export const PERIODIC_TABLE_NS = 'periodic-table'

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
  lng: 'zh',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})
