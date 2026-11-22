import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { changeLanguage, type Lang } from '../i18n'

type LanguageButtonProps = {
  label: string
  className?: string
}

const LANGUAGES: { id: Lang; text: string; htmlLang: string }[] = [
  { id: 'zh', text: '中', htmlLang: 'zh-CN' },
  { id: 'en', text: 'EN', htmlLang: 'en' },
]

export function LanguageButton({ label, className }: LanguageButtonProps) {
  const { i18n } = useTranslation()

  const current: Lang = (i18n.resolvedLanguage ?? i18n.language).startsWith('zh') ? 'zh' : 'en'
  const ordered = current === 'zh' ? LANGUAGES : [LANGUAGES[1], LANGUAGES[0]]

  const select = (next: Lang) => {
    if (next === current) return
    changeLanguage(next)
  }

  return (
    <div className={className ? `top-bar__lang-button ${className}` : 'top-bar__lang-button'} role="group" aria-label={label} title={label}>
      {ordered.map((language, index) => (
        <Fragment key={language.id}>
          {index > 0 ? (
            <span className="top-bar__lang-divider" aria-hidden="true">
              /
            </span>
          ) : null}
          <button
            type="button"
            className={language.id === current ? 'top-bar__lang-option top-bar__lang-option--active' : 'top-bar__lang-option'}
            lang={language.htmlLang}
            aria-current={language.id === current ? 'true' : undefined}
            onClick={() => select(language.id)}
          >
            {language.text}
          </button>
        </Fragment>
      ))}
    </div>
  )
}
