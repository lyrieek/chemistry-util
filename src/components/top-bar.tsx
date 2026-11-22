import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { HOME_NS } from '../i18n-ns'
import { HOME_HREF } from '../links'
import { BrandMark } from './BrandMark'
import { LanguageButton } from './language-button'
import { ThemeToggle } from './theme-toggle'
import './top-bar.css'

type TopBarProps = {
  /** 插槽：导航页放 site-nav，工具页放搜索、视图切换、返回首页等原有控件。 */
  children?: ReactNode
  className?: string
}

export function TopBar({ children, className }: TopBarProps) {
  const { t } = useTranslation(HOME_NS)

  return (
    <header className={className ? `top-bar ${className}` : 'top-bar'}>
      <a className="top-bar__brand" href={HOME_HREF} aria-label={t('brand')}>
        <BrandMark />
        <span className="brand__text">
          <span className="brand__name">{t('brand')}</span>
          <span className="brand__sub">{t('brandSub')}</span>
        </span>
      </a>
      <div className="top-bar__slot">{children}</div>
      <div className="top-bar__actions">
        <ThemeToggle label={t('Switch theme')} className="top-bar__icon-button" />
        <LanguageButton className="top-bar__lang-button" label={t('Switch language')} />
      </div>
    </header>
  )
}
