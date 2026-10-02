import type { Metadata } from 'next'
import { Bangers, Roboto } from 'next/font/google'
import './globals.css'

const roboto = Roboto({ weight: ['100', '300', '400', '500', '700', '900'], style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-roboto' })

const bangers = Bangers({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bangers'
})

export const metadata: Metadata = {
  title: 'Imperio da Britannia | Comic Universe Plugin',
  description: 'Browse and read Imperio da Britannia comics in Comic Universe.',
  icons: { icon: '/icon.svg' }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${roboto.variable} ${bangers.variable} antialiased`}>
        <div className="fixed inset-0 -z-10 h-full w-full bg-[linear-gradient(135deg,#674b9c_0%,#101028_70%,#12182b_90%,#19202c_100%)]" />
        {children}
      </body>
    </html>
  )
}
