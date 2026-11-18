import { useTranslation } from 'react-i18next'
import type { Lang } from '../i18n'

type LanguageButtonProps = {
  label: string
  className?: string
}

export function LanguageButton({ label, className }: LanguageButtonProps) {
  const { i18n } = useTranslation()

  const toggle = () => {
    const next: Lang = i18n.language === 'zh' ? 'en' : 'zh'
    document.documentElement.lang = next
    i18n.changeLanguage(next)
  }

  return (
    <button type="button" className={className} onClick={toggle}>
      {label}
    </button>
  )
}
