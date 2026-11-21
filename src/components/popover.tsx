import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import './popover.css'

export interface PopoverTriggerProps {
  onClick: () => void
  'aria-expanded': boolean
  'aria-haspopup': boolean
}

export interface PopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  label: string
  trigger: (props: PopoverTriggerProps) => ReactNode
  children: ReactNode
  className?: string
  panelClassName?: string
  align?: 'start' | 'end'
}

export function Popover({ open, onOpenChange, label, trigger, children, className, panelClassName, align = 'end' }: PopoverProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) onOpenChange(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onOpenChange])

  const toggle = () => onOpenChange(!open)

  return (
    <div ref={rootRef} className={className ? `chem-popover-root ${className}` : 'chem-popover-root'}>
      {trigger({ onClick: toggle, 'aria-expanded': open, 'aria-haspopup': true })}
      {open ? (
        <div className={panelClassName ? `chem-popover ${panelClassName}` : 'chem-popover'} data-align={align} role="group" aria-label={label}>
          {children}
        </div>
      ) : null}
    </div>
  )
}

export function PopoverHeading({ title, action }: { title: ReactNode; action?: ReactNode }) {
  return (
    <div className="chem-popover__head">
      <span className="chem-popover__title">{title}</span>
      {action}
    </div>
  )
}

export function PopoverAction(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { children, className } = props
  return (
    <button type="button" {...props} className={className ? `chem-popover__action ${className}` : 'chem-popover__action'}>
      {children}
    </button>
  )
}

export function PopoverList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className ? `chem-popover__list ${className}` : 'chem-popover__list'}>{children}</div>
}

export function PopoverItem({ children, className }: { children: ReactNode; className?: string }) {
  return <label className={className ? `chem-popover__item ${className}` : 'chem-popover__item'}>{children}</label>
}
