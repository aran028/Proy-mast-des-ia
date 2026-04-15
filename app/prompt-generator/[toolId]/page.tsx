import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import { PromptGeneratorForm } from '@/presentation/components/features/prompt-generator/prompt-generator-form'
import { Sidebar } from '@/presentation/components/layout/sidebar'
import { Header } from '@/presentation/components/layout/header'
import { createClient } from '@/infrastructure/database/supabase/server'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ toolId: string }>
}

export default async function PromptGeneratorToolPage({ params }: Readonly<PageProps>) {
  const { toolId } = await params
  const { tool: toolRepo, playlist: playlistRepo } = await createRepositories()
  const supabase = await createClient()
  const [tool, playlists, { data: { user } }] = await Promise.all([
    toolRepo.findById(toolId),
    playlistRepo.findAll(),
    supabase.auth.getUser(),
  ])

  if (!tool?.supports_prompt) {
    notFound()
  }

  const headerUser = user?.email ? { email: user.email } : null

  return (
    <div className="flex h-screen bg-black">
      <Sidebar playlists={playlists} />

      <main className="flex-1 ml-[72px] sm:ml-[240px] lg:ml-[280px] flex flex-col overflow-hidden">
        <Header user={headerUser} />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <Link
              href="/prompt-generator"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-pink-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al listado
            </Link>

            <PromptGeneratorForm tool={tool} />
          </div>
        </div>
      </main>
    </div>
  )
}
