import { NextResponse } from 'next/server'
import { createClient } from '@/infrastructure/database/supabase/server'
import {
  createRepositories,
  getChatService,
  getEmbeddingService,
} from '@/infrastructure/config/repository.factory'
import { AskChatbotUseCase } from '@/application/use-cases/chat'
import { ValidationException } from '@/domain/exceptions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { messages?: unknown; attachedDocument?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const { vector } = await createRepositories()
    const useCase = new AskChatbotUseCase(
      getEmbeddingService(),
      vector,
      getChatService(),
    )

    const stream = await useCase.execute({
      messages: body.messages as never,
      attachedDocument: body.attachedDocument as never,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'text', value: chunk })}\n\n`,
              ),
            )
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`),
          )
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'stream error'
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', message })}\n\n`,
            ),
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    })
  } catch (error: unknown) {
    if (error instanceof ValidationException) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
