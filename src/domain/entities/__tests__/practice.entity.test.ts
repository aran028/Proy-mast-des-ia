import { describe, it, expect } from 'vitest'
import { PracticeEntity, PracticeType } from '../practice.entity'

const baseData = {
  id: '1',
  playlistId: 'playlist-1',
  toolId: 'tool-1',
  userId: 'user-1',
  title: 'Build a RAG system',
  description: 'Learn how to build a RAG with LangChain',
  content: { steps: ['step1', 'step2'] },
  type: 'rag' as PracticeType,
  createdAt: '2024-01-01',
  updatedAt: null,
}

describe('PracticeEntity', () => {
  describe('constructor', () => {
    it('creates a practice with all fields', () => {
      const practice = new PracticeEntity(baseData)
      expect(practice.id).toBe('1')
      expect(practice.title).toBe('Build a RAG system')
      expect(practice.type).toBe('rag')
      expect(practice.content).toEqual({ steps: ['step1', 'step2'] })
    })
  })

  describe('create', () => {
    it('creates practice data with required title', () => {
      const data = PracticeEntity.create({ title: 'Extract text from video' })
      expect(data.title).toBe('Extract text from video')
      expect(data.userId).toBeNull()
      expect(data.content).toBeNull()
      expect(data.type).toBeNull()
    })

    it('creates practice with optional fields', () => {
      const data = PracticeEntity.create({
        title: 'Automate with n8n',
        description: 'Build automation workflows',
        type: 'automation',
        playlistId: 'playlist-1',
        toolId: 'tool-1',
      })
      expect(data.description).toBe('Build automation workflows')
      expect(data.type).toBe('automation')
      expect(data.playlistId).toBe('playlist-1')
      expect(data.toolId).toBe('tool-1')
    })

    it('throws if title is empty', () => {
      expect(() => PracticeEntity.create({ title: '' })).toThrow(
        'Practice title must be at least 3 characters'
      )
    })

    it('throws if title is too short', () => {
      expect(() => PracticeEntity.create({ title: 'AB' })).toThrow(
        'Practice title must be at least 3 characters'
      )
    })
  })

  describe('isType', () => {
    it('returns true when type matches', () => {
      const practice = new PracticeEntity(baseData)
      expect(practice.isType('rag')).toBe(true)
    })

    it('returns false when type does not match', () => {
      const practice = new PracticeEntity(baseData)
      expect(practice.isType('automation')).toBe(false)
    })

    it('returns false when type is null', () => {
      const practice = new PracticeEntity({ ...baseData, type: null })
      expect(practice.isType('rag')).toBe(false)
    })
  })
})
