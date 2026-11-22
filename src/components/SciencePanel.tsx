import { useTranslation } from 'react-i18next'
import { HOME_NS } from '../i18n-ns'

const HEX_VERTICES = [
  { x: 0, y: -78 },
  { x: 67.55, y: -39 },
  { x: 67.55, y: 39 },
  { x: 0, y: 78 },
  { x: -67.55, y: 39 },
  { x: -67.55, y: -39 },
]

function ScienceArt() {
  return (
    <svg viewBox="0 0 420 320" className="science-art" role="img" aria-label="苯环与 p 轨道示意图">
      <defs>
        <radialGradient id="science-lobe" cx="50%" cy="50%" r="50%">
          <stop offset="0%" className="science-stop-a" />
          <stop offset="100%" className="science-stop-b" />
        </radialGradient>
      </defs>
      <g transform="translate(210 160)">
        <ellipse cx="0" cy="-98" rx="30" ry="58" fill="url(#science-lobe)" className="science-lobe" />
        <ellipse cx="0" cy="98" rx="30" ry="58" fill="url(#science-lobe)" className="science-lobe" />
        <circle r="108" className="science-orbit" />
        <polygon points="0,-78 67.55,-39 67.55,39 0,78 -67.55,39 -67.55,-39" className="science-ring" />
        <path d="M0 -56 L48.5 -28 M48.5 28 L0 56 M-48.5 -28 L-48.5 28" className="science-ring-inner" />
        {HEX_VERTICES.map((point) => (
          <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="4" className="science-node" />
        ))}
      </g>
    </svg>
  )
}

export function SciencePanel() {
  const { t } = useTranslation(HOME_NS)

  return (
    <section className="science">
      <div className="science__copy">
        <p className="eyebrow">
          <span className="eyebrow__line" aria-hidden="true" />
          {t('science.eyebrow')}
        </p>
        <h2 className="section-title">{t('science.title')}</h2>
        <p className="science__body">{t('science.body')}</p>
        <blockquote className="science__quote">{t('science.quote')}</blockquote>
      </div>
      <figure className="science__figure">
        <ScienceArt />
        <figcaption>{t('science.caption')}</figcaption>
      </figure>
    </section>
  )
}
