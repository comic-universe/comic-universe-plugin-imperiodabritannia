'use client'
import { useEffect } from 'react'

type SwaggerWindow = Window & { SwaggerUIBundle?: (config: { url: string; dom_id: string }) => void }

export default function SwaggerPage() {
  useEffect(() => {
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css'
    document.head.appendChild(css)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js'
    script.onload = () => (window as SwaggerWindow).SwaggerUIBundle?.({ url: '/api/openapi', dom_id: '#swagger-ui' })
    document.body.appendChild(script)

    return () => { css.remove(); script.remove() }
  }, [])
  return <main style={{ padding: 24 }}><h1>Imperio da Britannia Plugin API</h1><div id="swagger-ui" /></main>
}
