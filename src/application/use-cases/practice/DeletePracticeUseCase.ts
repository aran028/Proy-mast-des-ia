import type { IPracticeRepository } from '@/application/ports/repositories'
import { PracticeNotFoundException } from '@/domain/exceptions'

export class DeletePracticeUseCase {
  constructor(private practiceRepository: IPracticeRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.practiceRepository.findById(id)
    if (!existing) throw new PracticeNotFoundException(id)

    return this.practiceRepository.delete(id)
  }
}
