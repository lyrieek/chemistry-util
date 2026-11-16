import { createRoot } from 'react-dom/client'
import App from './App'
import './i18n'
import './styles.css'
import './lattice.css'
import './search.css'

createRoot(document.getElementById('root') as HTMLElement).render(<App />)
