import Link from 'next/link'
import Image from 'next/image'

const REPO_URL = 'https://github.com/aran028/Proy-mast-des-ia'
const AVATAR_URL = 'https://github.com/aran028.png'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800 pt-6 pb-2">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
        <Link
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 hover:text-pink-500 transition-colors"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={AVATAR_URL}
            alt="Avatar de aran028 en GitHub"
            width={32}
            height={32}
            className="rounded-full border border-zinc-700 group-hover:border-pink-500 transition-colors"
          />
          <span>Mi proyecto del Master de Desarrollo con IA </span>
        </Link>
        <Link
          href="https://thebigschool.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity"
          aria-label="Big School (abre en nueva pestaña)"
        >
          <Image
            src="/assets/I_W_BigMaster.png"
            alt="Big School"
            width={120}
            height={32}
            className="h-8 w-auto object-contain"
          />
        </Link>
        <p>© 2026 Aranzazu Foronda</p>
      </div>
    </footer>
  )
}
