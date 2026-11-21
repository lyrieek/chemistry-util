import { useTranslation } from 'react-i18next'
import { changeLanguage, type Lang } from '../i18n'

type LanguageButtonProps = {
  label: string
  className?: string
}

export function LanguageButton({ label, className }: LanguageButtonProps) {
  const { i18n } = useTranslation()

  const toggle = () => {
    const current = i18n.resolvedLanguage ?? i18n.language
    const next: Lang = current.startsWith('zh') ? 'en' : 'zh'
    changeLanguage(next)
  }

  return (
    <button type="button" className={className} onClick={toggle}>
      {label}
    </button>
  )
}
