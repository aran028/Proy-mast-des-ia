import type { IPracticeRepository } from '@/application/ports/repositories'
import type { Tables } from '@/shared/types/database.types'

type Practice = Tables<'practices'>

export class GetAllPracticesUseCase {
  constructor(private practiceRepository: IPracticeRepository) {}

  async execute(): Promise<Practice[]> {
    return this.practiceRepository.findAll()
  }
}
