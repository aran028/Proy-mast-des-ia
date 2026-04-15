export class DomainException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DomainException'
  }
}

export class PlaylistNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Playlist with id ${id} not found`)
    this.name = 'PlaylistNotFoundException'
  }
}

export class ToolNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Tool with id ${id} not found`)
    this.name = 'ToolNotFoundException'
  }
}

export class PracticeNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Practice with id ${id} not found`)
    this.name = 'PracticeNotFoundException'
  }
}

export class ValidationException extends DomainException {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationException'
  }
}

export class ToolNotPromptEnabledException extends DomainException {
  constructor(id: string) {
    super(`Tool with id ${id} does not support prompt generation`)
    this.name = 'ToolNotPromptEnabledException'
  }
}

export class PromptGenerationException extends DomainException {
  constructor(message: string) {
    super(`Prompt generation failed: ${message}`)
    this.name = 'PromptGenerationException'
  }
}
