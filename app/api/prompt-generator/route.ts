import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createRepositories,
  getPromptGeneratorService,
} from '@/infrastructure/config/repository.factory'
import { GeneratePromptUseCase } from '@/application/use-cases/prompt-generator'
import {
  DomainException,
  PromptGenerationException,
  ToolNotFoundException,
  ToolNotPromptEnabledException,
  ValidationException,
} from '@/domain/exceptions'
import {
  promptGeneratorRateLimiter,
  getClientIp,
} from '@/infrastructure/security/rate-limiter'

const bodySchema = z.object({
  toolId: z.string().min(1),
  userIntent: z.string().min(10).max(1000),
})

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const rateCheck = promptGeneratorRateLimiter.check(ip)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Try again in a moment.' },
      {
        status: 429,
        headers: { 'Retry-After': Math.ceil(rateCheck.retryAfterMs / 1000).toString() },
      },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }

  try {
    const { tool } = await createRepositories()
    const useCase = new GeneratePromptUseCase(tool, getPromptGeneratorService())
    const result = await useCase.execute(parsed.data)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    if (error instanceof ValidationException) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }
    if (error instanceof ToolNotFoundException) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 })
    }
    if (error instanceof ToolNotPromptEnabledException) {
      return NextResponse.json({ success: false, error: error.message }, { status: 422 })
    }
    if (error instanceof PromptGenerationException) {
      return NextResponse.json(
        { success: false, error: 'Prompt generation is temporarily unavailable. Please retry.' },
        { status: 502 },
      )
    }
    if (error instanceof DomainException) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { success: false, error: 'Unexpected server error' },
      { status: 500 },
    )
  }
}
