import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HOME_NS } from './i18n-ns'
import { MATERIAL_CARDS_HREF, PERIODIC_TABLE_HREF } from './links'
import { BrandMark } from './components/BrandMark'
import { HeroArt } from './components/HeroArt'
import { SciencePanel } from './components/SciencePanel'
import { TopBar } from './components/top-bar'
import { ToolCard } from './components/ToolCard'
import './styles.css'

const MATERIAL_POINTS = ['tools.materialCards.point1', 'tools.materialCards.point2', 'tools.materialCards.point3']
const PERIODIC_POINTS = ['tools.periodicTable.point1', 'tools.periodicTable.point2', 'tools.periodicTable.point3']

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M2.5 8h10M9 4.5 12.5 8 9 11.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function App() {
  const { t, i18n } = useTranslation(HOME_NS)

  useEffect(() => {
    document.title = t('title')
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('description'))
  }, [t, i18n.language])

  return (
    <div className="site">
      <TopBar>
        <nav className="site-nav" aria-label={t('nav.label')}>
          <a href={MATERIAL_CARDS_HREF}>{t('nav.materialCards')}</a>
          <a href={PERIODIC_TABLE_HREF}>{t('nav.periodicTable')}</a>
        </nav>
      </TopBar>
      <main>
        <section className="hero">
          <div className="hero__copy">
            <p className="eyebrow">
              <span className="eyebrow__line" aria-hidden="true" />
              {t('hero.eyebrow')}
            </p>
            <h1 className="hero__title">
              <span className="hero__title-lead">{t('hero.titleLead')}</span> <em className="hero__title-accent">{t('hero.titleAccent')}</em>
            </h1>
            <p className="hero__sub">{t('hero.subtitle')}</p>
            <div className="hero__actions">
              <a className="button button--primary" href={MATERIAL_CARDS_HREF}>
                {t('hero.ctaPrimary')}
                <ArrowIcon />
              </a>
              <a className="button button--ghost" href={PERIODIC_TABLE_HREF}>
                {t('hero.ctaSecondary')}
              </a>
            </div>
            <dl className="hero__stats">
              <div className="stat">
                <dt>{t('stats.materials')}</dt>
                <dd>{t('stats.materialsValue')}</dd>
              </div>
              <div className="stat">
                <dt>{t('stats.elements')}</dt>
                <dd>{t('stats.elementsValue')}</dd>
              </div>
              <div className="stat">
                <dt>{t('stats.views')}</dt>
                <dd>{t('stats.viewsValue')}</dd>
              </div>
            </dl>
          </div>
          <div className="hero__art">
            <HeroArt />
          </div>
        </section>

        <section className="tools" aria-labelledby="tools-title">
          <header className="section-head">
            <p className="eyebrow">
              <span className="eyebrow__line" aria-hidden="true" />
              {t('tools.eyebrow')}
            </p>
            <h2 id="tools-title" className="section-title">
              {t('tools.title')}
            </h2>
          </header>
          <div className="tools__grid">
            <ToolCard
              href={MATERIAL_CARDS_HREF}
              tag={t('tools.materialCards.tag')}
              title={t('tools.materialCards.title')}
              desc={t('tools.materialCards.desc')}
              points={MATERIAL_POINTS.map((key) => t(key))}
              art="materials"
              cta={t('tools.materialCards.cta')}
            />
            <ToolCard
              href={PERIODIC_TABLE_HREF}
              tag={t('tools.periodicTable.tag')}
              title={t('tools.periodicTable.title')}
              desc={t('tools.periodicTable.desc')}
              points={PERIODIC_POINTS.map((key) => t(key))}
              art="periodic"
              cta={t('tools.periodicTable.cta')}
            />
          </div>
        </section>

        <SciencePanel />
      </main>

      <footer className="site-footer">
        <div className="site-footer__brand">
          <BrandMark />
          <span>{t('footer')}</span>
        </div>
        <p>{t('footerNote')}</p>
        <nav aria-label={t('nav.label')}>
          <a href={MATERIAL_CARDS_HREF}>{t('nav.materialCards')}</a>
          <a href={PERIODIC_TABLE_HREF}>{t('nav.periodicTable')}</a>
        </nav>
      </footer>
    </div>
  )
}
