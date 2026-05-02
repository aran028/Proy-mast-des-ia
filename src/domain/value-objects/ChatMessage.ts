export type ChatRole = 'user' | 'assistant' | 'system'

export class ChatMessage {
  private static readonly MAX_CONTENT_LENGTH = 8000
  private static readonly VALID_ROLES: readonly ChatRole[] = ['user', 'assistant', 'system']

  private constructor(
    private readonly role: ChatRole,
    private readonly content: string,
  ) {}

  static create(role: string, content: string): ChatMessage {
    if (!ChatMessage.VALID_ROLES.includes(role as ChatRole)) {
      throw new Error(`Invalid chat role: ${role}`)
    }

    const trimmed = content.trim()
    if (!trimmed) {
      throw new Error('Chat message content cannot be empty')
    }

    if (trimmed.length > ChatMessage.MAX_CONTENT_LENGTH) {
      throw new Error(
        `Chat message content exceeds ${ChatMessage.MAX_CONTENT_LENGTH} characters`,
      )
    }

    return new ChatMessage(role as ChatRole, trimmed)
  }

  getRole(): ChatRole {
    return this.role
  }

  getContent(): string {
    return this.content
  }

  toJSON(): { role: ChatRole; content: string } {
    return { role: this.role, content: this.content }
  }
}
