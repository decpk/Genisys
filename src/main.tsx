import './tauri-api-bridge'
import './assets/main.css'
import '@/ai/entity-links'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import { initDebugListener } from './store/debug-store'
import { initAIInspectorListener } from './store/ai-inspector-store'

initDebugListener()
initAIInspectorListener()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
