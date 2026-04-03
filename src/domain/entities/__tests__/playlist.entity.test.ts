import { describe, it, expect } from 'vitest'
import { PlaylistEntity } from '../playlist.entity'

const baseData = {
  id: '1',
  userId: 'user-1',
  name: 'Machine Learning',
  description: 'ML tools',
  icon: '🤖',
  color: '#ff0000',
  orderNum: 1,
  createdAt: '2024-01-01',
  updatedAt: null,
}

describe('PlaylistEntity', () => {
  describe('constructor', () => {
    it('creates a playlist with all fields', () => {
      const playlist = new PlaylistEntity(baseData)
      expect(playlist.id).toBe('1')
      expect(playlist.name).toBe('Machine Learning')
      expect(playlist.userId).toBe('user-1')
      expect(playlist.orderNum).toBe(1)
    })

    it('id and createdAt are assigned correctly', () => {
      const playlist = new PlaylistEntity(baseData)
      expect(playlist.id).toBe('1')
      expect(playlist.createdAt).toBe('2024-01-01')
    })
  })

  describe('create', () => {
    it('creates playlist data with required name', () => {
      const data = PlaylistEntity.create({ name: 'NLP' })
      expect(data.name).toBe('NLP')
      expect(data.userId).toBeNull()
      expect(data.description).toBeNull()
      expect(data.orderNum).toBeNull()
    })

    it('creates playlist with optional fields', () => {
      const data = PlaylistEntity.create({
        name: 'Automation',
        description: 'Automation tools',
        icon: '⚙️',
        color: '#00ff00',
      })
      expect(data.description).toBe('Automation tools')
      expect(data.icon).toBe('⚙️')
      expect(data.color).toBe('#00ff00')
    })

    it('throws if name is empty', () => {
      expect(() => PlaylistEntity.create({ name: '' })).toThrow(
        'Playlist name must be at least 2 characters'
      )
    })

    it('throws if name is too short', () => {
      expect(() => PlaylistEntity.create({ name: 'A' })).toThrow(
        'Playlist name must be at least 2 characters'
      )
    })
  })
})
