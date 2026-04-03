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
