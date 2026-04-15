import Link from 'next/link'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import { Card } from '@/presentation/components/ui/card'
import { Sidebar } from '@/presentation/components/layout/sidebar'
import { Header } from '@/presentation/components/layout/header'
import { createClient } from '@/infrastructure/database/supabase/server'

export const dynamic = 'force-dynamic'

export default async function PromptGeneratorIndexPage() {
  const { tool: toolRepo, playlist: playlistRepo } = await createRepositories()
  const supabase = await createClient()
  const [tools, playlists, { data: { user } }] = await Promise.all([
    toolRepo.findByPromptSupport(),
    playlistRepo.findAll(),
    supabase.auth.getUser(),
  ])

  const headerUser = user?.email ? { email: user.email } : null

  return (
    <div className="flex h-screen bg-black">
      <Sidebar playlists={playlists} />

      <main className="flex-1 ml-[72px] sm:ml-[240px] lg:ml-[280px] flex flex-col overflow-hidden">
        <Header user={headerUser} />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <header className="space-y-2">
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-7 h-7 text-pink-500" />
                Prompt Generator
              </h1>
              <p className="text-zinc-400 max-w-2xl text-sm">
                Elige una herramienta de IA para generar un prompt optimizado. Describe tu objetivo
                y te devolveremos un prompt listo para copiar y pegar en la web de la herramienta.
              </p>
            </header>

            {tools.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
                <p className="text-zinc-400">
                  Todavía no hay herramientas con generación de prompts disponibles.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                {tools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/prompt-generator/${tool.id}`}
                    className="block focus:outline-none focus:ring-2 focus:ring-pink-500 rounded-lg"
                  >
                    <Card className="group cursor-pointer hover:bg-zinc-800 transition-all duration-300 shadow-md hover:shadow-pink-500/20 overflow-hidden h-full">
                      <div className="relative w-full aspect-square overflow-hidden bg-zinc-800">
                        {tool.image && URL.canParse(tool.image) ? (
                          <Image
                            src={tool.image}
                            alt={tool.name}
                            fill
                            sizes="(max-width: 768px) 33vw, (max-width: 1024px) 20vw, 15vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-pink-500" />
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <h3 className="font-semibold text-white group-hover:text-pink-500 text-xs leading-tight truncate transition-colors">
                          {tool.name}
                        </h3>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
