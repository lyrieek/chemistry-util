import { HOME_HREF } from '../links'
import './home-link.css'

export function HomeLink({ label }: { label: string }) {
  return (
    <a className="home-link" href={HOME_HREF} aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  )
}
