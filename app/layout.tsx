import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Imperio da Britannia Plugin', description: 'Comic Universe source plugin API' }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>
}
