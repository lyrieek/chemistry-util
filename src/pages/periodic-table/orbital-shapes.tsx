import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ORBITAL_SHAPES_NS } from '../../i18n-ns'
import './orbital-shapes.css'

const STROKE_S = '#D97706'
const STROKE_P = '#16A34A'
const STROKE_D = '#2563EB'
const STROKE_F = '#7E22CE'

function OrbitalDefs() {
  return (
    <svg className="pt-orb-defs" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="pt-orb-grad-s" cx="35%" cy="30%" r="70%">
          <stop offset="0%" className="pt-orb-s1" />
          <stop offset="55%" className="pt-orb-s2" />
          <stop offset="100%" className="pt-orb-s3" />
        </radialGradient>
        <radialGradient id="pt-orb-grad-p" cx="35%" cy="30%" r="75%">
          <stop offset="0%" className="pt-orb-p1" />
          <stop offset="55%" className="pt-orb-p2" />
          <stop offset="100%" className="pt-orb-p3" />
        </radialGradient>
        <radialGradient id="pt-orb-grad-d" cx="35%" cy="30%" r="75%">
          <stop offset="0%" className="pt-orb-d1" />
          <stop offset="55%" className="pt-orb-d2" />
          <stop offset="100%" className="pt-orb-d3" />
        </radialGradient>
        <radialGradient id="pt-orb-grad-f" cx="35%" cy="30%" r="75%">
          <stop offset="0%" className="pt-orb-f1" />
          <stop offset="55%" className="pt-orb-f2" />
          <stop offset="100%" className="pt-orb-f3" />
        </radialGradient>
      </defs>
    </svg>
  )
}

function OrbSvg() {
  return (
    <svg viewBox="-78 -78 156 156" role="presentation" focusable="false">
      <circle cx="0" cy="0" r="62" fill="url(#pt-orb-grad-s)" stroke={STROKE_S} strokeWidth="2" />
      <ellipse cx="-22" cy="-23" rx="18" ry="12" fill="#FFFFFF" opacity="0.25" />
    </svg>
  )
}

function PxSvg() {
  return (
    <svg viewBox="-90 -46 180 92" role="presentation" focusable="false">
      <ellipse cx="-42" cy="0" rx="38" ry="22" fill="url(#pt-orb-grad-p)" stroke={STROKE_P} strokeWidth="1.5" />
      <ellipse cx="42" cy="0" rx="38" ry="22" fill="url(#pt-orb-grad-p)" stroke={STROKE_P} strokeWidth="1.5" />
    </svg>
  )
}

function PySvg() {
  return (
    <svg viewBox="-46 -90 92 180" role="presentation" focusable="false">
      <ellipse cx="0" cy="-42" rx="22" ry="38" fill="url(#pt-orb-grad-p)" stroke={STROKE_P} strokeWidth="1.5" />
      <ellipse cx="0" cy="42" rx="22" ry="38" fill="url(#pt-orb-grad-p)" stroke={STROKE_P} strokeWidth="1.5" />
    </svg>
  )
}

function PzSvg() {
  return (
    <svg viewBox="-46 -80 92 160" role="presentation" focusable="false">
      <ellipse cx="0" cy="-36" rx="20" ry="32" fill="url(#pt-orb-grad-p)" stroke={STROKE_P} strokeWidth="1.5" opacity="0.85" />
      <ellipse cx="0" cy="36" rx="24" ry="36" fill="url(#pt-orb-grad-p)" stroke={STROKE_P} strokeWidth="1.5" />
    </svg>
  )
}

function DQuadSvg() {
  return (
    <svg viewBox="-70 -70 140 140" role="presentation" focusable="false">
      <ellipse cx="-30" cy="-30" rx="28" ry="13" transform="rotate(45 -30 -30)" fill="url(#pt-orb-grad-d)" stroke={STROKE_D} strokeWidth="1.2" />
      <ellipse cx="30" cy="-30" rx="28" ry="13" transform="rotate(-45 30 -30)" fill="url(#pt-orb-grad-d)" stroke={STROKE_D} strokeWidth="1.2" />
      <ellipse cx="-30" cy="30" rx="28" ry="13" transform="rotate(-45 -30 30)" fill="url(#pt-orb-grad-d)" stroke={STROKE_D} strokeWidth="1.2" />
      <ellipse cx="30" cy="30" rx="28" ry="13" transform="rotate(45 30 30)" fill="url(#pt-orb-grad-d)" stroke={STROKE_D} strokeWidth="1.2" />
    </svg>
  )
}

function Dx2y2Svg() {
  return (
    <svg viewBox="-72 -72 144 144" role="presentation" focusable="false">
      <ellipse cx="0" cy="-38" rx="13" ry="28" fill="url(#pt-orb-grad-d)" stroke={STROKE_D} strokeWidth="1.2" />
      <ellipse cx="0" cy="38" rx="13" ry="28" fill="url(#pt-orb-grad-d)" stroke={STROKE_D} strokeWidth="1.2" />
      <ellipse cx="-38" cy="0" rx="28" ry="13" fill="url(#pt-orb-grad-d)" stroke={STROKE_D} strokeWidth="1.2" />
      <ellipse cx="38" cy="0" rx="28" ry="13" fill="url(#pt-orb-grad-d)" stroke={STROKE_D} strokeWidth="1.2" />
    </svg>
  )
}

function Dz2Svg() {
  return (
    <svg viewBox="-54 -80 108 160" role="presentation" focusable="false">
      <ellipse cx="0" cy="-42" rx="20" ry="30" fill="url(#pt-orb-grad-d)" stroke={STROKE_D} strokeWidth="1.2" />
      <ellipse cx="0" cy="42" rx="20" ry="30" fill="url(#pt-orb-grad-d)" stroke={STROKE_D} strokeWidth="1.2" />
      <ellipse cx="0" cy="0" rx="38" ry="14" fill="none" stroke={STROKE_D} strokeWidth="6" opacity="0.75" />
    </svg>
  )
}

function FxyzSvg() {
  return (
    <svg viewBox="-76 -76 152 152" role="presentation" focusable="false">
      <ellipse cx="0" cy="-42" rx="12" ry="26" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
      <ellipse cx="0" cy="42" rx="12" ry="26" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
      <ellipse cx="-42" cy="0" rx="26" ry="12" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
      <ellipse cx="42" cy="0" rx="26" ry="12" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
      <ellipse cx="-28" cy="-28" rx="22" ry="10" transform="rotate(45 -28 -28)" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
      <ellipse cx="28" cy="-28" rx="22" ry="10" transform="rotate(-45 28 -28)" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
      <ellipse cx="-28" cy="28" rx="22" ry="10" transform="rotate(-45 -28 28)" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
      <ellipse cx="28" cy="28" rx="22" ry="10" transform="rotate(45 28 28)" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
    </svg>
  )
}

function Fz3Svg() {
  return (
    <svg viewBox="-62 -80 124 160" role="presentation" focusable="false">
      <ellipse cx="0" cy="-44" rx="18" ry="28" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
      <ellipse cx="0" cy="44" rx="18" ry="28" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
      <ellipse cx="-32" cy="-32" rx="22" ry="11" transform="rotate(45 -32 -32)" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
      <ellipse cx="32" cy="-32" rx="22" ry="11" transform="rotate(-45 32 -32)" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
      <ellipse cx="-32" cy="32" rx="22" ry="11" transform="rotate(-45 -32 32)" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
      <ellipse cx="32" cy="32" rx="22" ry="11" transform="rotate(45 32 32)" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
      <ellipse cx="0" cy="0" rx="40" ry="15" fill="none" stroke={STROKE_F} strokeWidth="5" opacity="0.75" />
    </svg>
  )
}

function Fxz2Svg() {
  return (
    <svg viewBox="-70 -78 140 156" role="presentation" focusable="false">
      <ellipse cx="0" cy="-44" rx="16" ry="28" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
      <ellipse cx="0" cy="44" rx="16" ry="28" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
      <ellipse cx="-36" cy="0" rx="26" ry="12" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
      <ellipse cx="36" cy="0" rx="26" ry="12" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
      <ellipse cx="-30" cy="-30" rx="22" ry="10" transform="rotate(45 -30 -30)" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
      <ellipse cx="30" cy="30" rx="22" ry="10" transform="rotate(45 30 30)" fill="url(#pt-orb-grad-f)" stroke={STROKE_F} strokeWidth="1.2" />
    </svg>
  )
}

interface FigureProps {
  tone: 's' | 'p' | 'd' | 'f'
  name: string
  note: string
  children: ReactNode
}

function Figure({ tone, name, note, children }: FigureProps) {
  return (
    <figure className="pt-orb-figure" data-tone={tone}>
      <div className="pt-orb-figure__art">{children}</div>
      <figcaption className="pt-orb-figure__caption">
        <span className="pt-orb-figure__name">{name}</span>
        <span className="pt-orb-figure__note">{note}</span>
      </figcaption>
    </figure>
  )
}

interface SectionProps {
  tone: 's' | 'p' | 'd' | 'f'
  title: string
  facts: string[]
  note?: string
  children: ReactNode
}

function Section({ tone, title, facts, note, children }: SectionProps) {
  return (
    <section className="pt-orb-chart__section">
      <div className="pt-orb-chart__info">
        <h4 className="pt-orb-chart__heading" data-tone={tone}>
          {title}
        </h4>
        <ul className="pt-orb-chart__list">
          {facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </div>
      <div className="pt-orb-chart__shapes">{children}</div>
      {note ? <p className="pt-orb-chart__section-note">{note}</p> : null}
    </section>
  )
}

/**
 * s / p / d / f 四个亚层轨道的空间结构示意图（由 syt.svg 转换而来）。
 * 文字等内容用 DOM 呈现，仅轨道形状保留为内联 SVG；2D 投影仅作形态与方向示意。
 */
export function OrbitalShapes() {
  const { t } = useTranslation(ORBITAL_SHAPES_NS)
  const facts = (key: string) => t(key, { returnObjects: true }) as unknown as string[]

  return (
    <div className="pt-orb-chart">
      <OrbitalDefs />
      <h3 className="pt-orb-chart__title">{t('title')}</h3>
      <p className="pt-orb-chart__sub">{t('subtitle')}</p>

      <Section tone="s" title={t('sections.s.title')} facts={facts('sections.s.facts')}>
        <Figure tone="s" name={t('figures.s.name')} note={t('figures.s.note')}>
          <OrbSvg />
        </Figure>
      </Section>

      <Section tone="p" title={t('sections.p.title')} facts={facts('sections.p.facts')}>
        <Figure tone="p" name={t('figures.px.name')} note={t('figures.px.note')}>
          <PxSvg />
        </Figure>
        <Figure tone="p" name={t('figures.py.name')} note={t('figures.py.note')}>
          <PySvg />
        </Figure>
        <Figure tone="p" name={t('figures.pz.name')} note={t('figures.pz.note')}>
          <PzSvg />
        </Figure>
      </Section>

      <Section tone="d" title={t('sections.d.title')} facts={facts('sections.d.facts')}>
        <Figure tone="d" name={t('figures.dxy.name')} note={t('figures.dxy.note')}>
          <DQuadSvg />
        </Figure>
        <Figure tone="d" name={t('figures.dxz.name')} note={t('figures.dxz.note')}>
          <DQuadSvg />
        </Figure>
        <Figure tone="d" name={t('figures.dyz.name')} note={t('figures.dyz.note')}>
          <DQuadSvg />
        </Figure>
        <Figure tone="d" name={t('figures.dx2y2.name')} note={t('figures.dx2y2.note')}>
          <Dx2y2Svg />
        </Figure>
        <Figure tone="d" name={t('figures.dz2.name')} note={t('figures.dz2.note')}>
          <Dz2Svg />
        </Figure>
      </Section>

      <Section tone="f" title={t('sections.f.title')} facts={facts('sections.f.facts')}>
        <Figure tone="f" name={t('figures.fxyz.name')} note={t('figures.fxyz.note')}>
          <FxyzSvg />
        </Figure>
        <Figure tone="f" name={t('figures.fz3.name')} note={t('figures.fz3.note')}>
          <Fz3Svg />
        </Figure>
        <Figure tone="f" name={t('figures.fxz2.name')} note={t('figures.fxz2.note')}>
          <Fxz2Svg />
        </Figure>
      </Section>

      <div className="pt-orb-chart__note">
        <p>{t('notes.cloud')}</p>
        <p>{t('notes.projection')}</p>
      </div>
      <div className="pt-orb-chart__note pt-orb-chart__note--iupac">
        <p>{t('notes.blockLabel')}</p>
      </div>
    </div>
  )
}
