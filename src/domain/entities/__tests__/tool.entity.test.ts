import { describe, it, expect } from 'vitest'
import { ToolEntity } from '../tool.entity'

const baseData = {
  id: '1',
  playlistId: 'playlist-1',
  userId: 'user-1',
  name: 'ChatGPT',
  summary: 'AI assistant by OpenAI',
  image: 'chatgpt.png',
  tags: ['nlp', 'chat'],
  website: 'https://chat.openai.com',
  createdAt: '2024-01-01',
  updatedAt: null,
}

describe('ToolEntity', () => {
  describe('constructor', () => {
    it('creates a tool with all fields', () => {
      const tool = new ToolEntity(baseData)
      expect(tool.id).toBe('1')
      expect(tool.name).toBe('ChatGPT')
      expect(tool.website).toBe('https://chat.openai.com')
      expect(tool.tags).toEqual(['nlp', 'chat'])
    })
  })

  describe('create', () => {
    it('creates tool data with required name', () => {
      const data = ToolEntity.create({ name: 'LangChain' })
      expect(data.name).toBe('LangChain')
      expect(data.userId).toBeNull()
      expect(data.image).toBeNull()
      expect(data.tags).toBeNull()
    })

    it('creates tool with optional fields', () => {
      const data = ToolEntity.create({
        name: 'HuggingFace',
        summary: 'ML models hub',
        website: 'https://huggingface.co',
        playlistId: 'playlist-1',
      })
      expect(data.summary).toBe('ML models hub')
      expect(data.website).toBe('https://huggingface.co')
      expect(data.playlistId).toBe('playlist-1')
    })

    it('throws if name is empty', () => {
      expect(() => ToolEntity.create({ name: '' })).toThrow(
        'Tool name must be at least 2 characters'
      )
    })

    it('throws if name is too short', () => {
      expect(() => ToolEntity.create({ name: 'A' })).toThrow(
        'Tool name must be at least 2 characters'
      )
    })
  })

  describe('getTags', () => {
    it('returns tags array when tags exist', () => {
      const tool = new ToolEntity(baseData)
      expect(tool.getTags()).toEqual(['nlp', 'chat'])
    })

    it('returns empty array when tags is null', () => {
      const tool = new ToolEntity({ ...baseData, tags: null })
      expect(tool.getTags()).toEqual([])
    })
  })
})
