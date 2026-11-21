import { createRoot } from 'react-dom/client'
import './i18n'
import App from './App'
import './styles.css'
import './lattice.css'
import './search.css'

createRoot(document.getElementById('root') as HTMLElement).render(<App />)
