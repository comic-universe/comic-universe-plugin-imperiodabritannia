'use client'

import { useState } from 'react'
import Image from 'next/image'
import StarrySky from './components/StarrySky'

export default function Home() {
  const [installStatus, setInstallStatus] = useState('')

  const handleInstall = () => {
    const baseUrl = window.location.origin
    const pluginUrl = `${baseUrl}/api`
    const metadataUrl = `${pluginUrl}/metadata`
    const deepLink = `comic-universe-tauri://plugin/install?url=${encodeURIComponent(pluginUrl)}&metadataUrl=${encodeURIComponent(metadataUrl)}&name=${encodeURIComponent('Imperio da Britannia')}&tag=imperiodabritannia`

    setInstallStatus('Opening Comic Universe...')
    window.location.href = deepLink
    window.setTimeout(() => setInstallStatus('If Comic Universe did not open, make sure it is installed and set as the handler for comic-universe-tauri links.'), 2000)
  }

  return (
    <main className="relative min-h-screen w-full">
      <StarrySky className="fixed inset-0 -z-0 h-full w-full" />
      <section className="relative z-10 flex min-h-screen flex-col items-center px-6 py-12">
        <header className="mb-6 max-w-4xl text-center">
          <div className="mb-2 flex justify-center">
            <Image src="/icon.svg" alt="Imperio da Britannia" className="h-48 w-48 sm:h-64 sm:w-64 md:h-80 md:w-80" width={320} height={320} priority />
          </div>
          <h1 className="font-bangers mb-3 text-3xl text-yellow-400 md:text-4xl comic-outline">Imperio da Britannia</h1>
          <p className="mx-auto mb-6 max-w-2xl text-base leading-relaxed text-white sm:text-lg md:text-xl">
            Browse and read Portuguese comics from Imperio da Britannia in Comic Universe.
          </p>
        </header>

        <section className="mx-auto w-full max-w-4xl rounded-2xl border border-purple-500/30 bg-purple-900/40 p-8 backdrop-blur-sm md:p-12">
          <div className="mb-8 text-center">
            <h2 className="font-bangers comic-outline mb-4 text-3xl text-yellow-400 md:text-4xl">Plugin API</h2>
            <p className="mb-6 text-lg text-white/80">Available endpoints</p>
          </div>
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {['getList', 'search', 'getDetails', 'getChapters', 'getPages', 'downloadChapter'].map((endpoint) => (
              <article key={endpoint} className="rounded-xl border border-purple-500/20 bg-purple-900/30 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white">{endpoint}</h3>
                <p className="mt-1 text-sm text-white/65">{endpoint === 'downloadChapter' ? 'Offline download is unsupported' : 'POST /api/' + endpoint}</p>
              </article>
            ))}
          </div>
          <div className="flex flex-col items-center gap-4">
            <button onClick={handleInstall} className="w-full cursor-pointer rounded-lg bg-yellow-400 px-8 py-4 text-lg font-medium text-black shadow-lg transition-colors hover:bg-yellow-500 md:w-auto">
              Install Plugin
            </button>
            <a href="/swagger" className="w-full rounded-lg bg-purple-600/80 px-8 py-4 text-center text-lg text-white shadow-lg transition-colors hover:bg-purple-500 md:w-auto">
              Open Swagger
            </a>
            {installStatus && <p role="status" className="max-w-md text-center text-sm text-white/80">{installStatus}</p>}
          </div>
        </section>
      </section>
    </main>
  )
}
