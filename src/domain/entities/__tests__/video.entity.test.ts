import { describe, it, expect } from 'vitest'
import { VideoEntity } from '../video.entity'

const baseData = {
  id: 'vid-1',
  playlistId: 'playlist-1',
  toolId: 'tool-1',
  title: 'Intro to GPT-4',
  description: 'A tutorial on GPT-4',
  thumbnailUrl: 'https://img.youtube.com/vi/abc123/hqdefault.jpg',
  videoUrl: 'https://www.youtube.com/watch?v=abc123',
  platform: 'youtube' as const,
  platformVideoId: 'abc123',
  author: 'AI Channel',
  authorUrl: 'https://youtube.com/@aichannel',
  duration: 600,
  viewCount: 15000,
  publishedAt: '2024-06-01',
  tags: ['gpt', 'openai'],
  aiClassified: true,
  classificationConfidence: 0.95,
  status: 'approved' as const,
  createdAt: '2024-01-01',
  updatedAt: null,
}

describe('VideoEntity', () => {
  describe('constructor', () => {
    it('creates a video with all fields', () => {
      const video = new VideoEntity(baseData)
      expect(video.id).toBe('vid-1')
      expect(video.title).toBe('Intro to GPT-4')
      expect(video.platform).toBe('youtube')
      expect(video.platformVideoId).toBe('abc123')
      expect(video.duration).toBe(600)
      expect(video.viewCount).toBe(15000)
      expect(video.tags).toEqual(['gpt', 'openai'])
      expect(video.aiClassified).toBe(true)
      expect(video.classificationConfidence).toBe(0.95)
      expect(video.status).toBe('approved')
    })
  })

  describe('create', () => {
    it('creates video data with required fields only', () => {
      const data = VideoEntity.create({
        title: 'Test Video',
        videoUrl: 'https://youtube.com/watch?v=xyz',
        platform: 'youtube',
        platformVideoId: 'xyz',
      })
      expect(data.title).toBe('Test Video')
      expect(data.videoUrl).toBe('https://youtube.com/watch?v=xyz')
      expect(data.platform).toBe('youtube')
      expect(data.platformVideoId).toBe('xyz')
      expect(data.playlistId).toBeNull()
      expect(data.toolId).toBeNull()
      expect(data.description).toBeNull()
      expect(data.thumbnailUrl).toBeNull()
      expect(data.author).toBeNull()
      expect(data.authorUrl).toBeNull()
      expect(data.duration).toBeNull()
      expect(data.viewCount).toBeNull()
      expect(data.publishedAt).toBeNull()
      expect(data.tags).toBeNull()
      expect(data.aiClassified).toBe(false)
      expect(data.classificationConfidence).toBeNull()
      expect(data.status).toBe('approved')
    })

    it('creates video data with all optional fields', () => {
      const data = VideoEntity.create({
        title: 'Full Video',
        videoUrl: 'https://youtube.com/watch?v=full',
        platform: 'instagram',
        platformVideoId: 'full',
        playlistId: 'pl-1',
        toolId: 'tl-1',
        description: 'A full video',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        tags: ['ai', 'ml'],
        author: 'Author',
        authorUrl: 'https://example.com/author',
        duration: 120,
        viewCount: 5000,
        publishedAt: '2024-03-15',
      })
      expect(data.playlistId).toBe('pl-1')
      expect(data.toolId).toBe('tl-1')
      expect(data.description).toBe('A full video')
      expect(data.tags).toEqual(['ai', 'ml'])
      expect(data.duration).toBe(120)
      expect(data.viewCount).toBe(5000)
    })

    it('throws if title is shorter than 3 characters', () => {
      expect(() =>
        VideoEntity.create({
          title: 'AB',
          videoUrl: 'https://youtube.com/watch?v=x',
          platform: 'youtube',
          platformVideoId: 'x',
        })
      ).toThrow('Video title must be at least 3 characters')
    })

    it('throws if title is empty', () => {
      expect(() =>
        VideoEntity.create({
          title: '',
          videoUrl: 'https://youtube.com/watch?v=x',
          platform: 'youtube',
          platformVideoId: 'x',
        })
      ).toThrow('Video title must be at least 3 characters')
    })

    it('throws if videoUrl is empty', () => {
      expect(() =>
        VideoEntity.create({
          title: 'Valid Title',
          videoUrl: '',
          platform: 'youtube',
          platformVideoId: 'x',
        })
      ).toThrow('Video URL is required')
    })

    it('throws if platformVideoId is empty', () => {
      expect(() =>
        VideoEntity.create({
          title: 'Valid Title',
          videoUrl: 'https://youtube.com/watch?v=x',
          platform: 'youtube',
          platformVideoId: '',
        })
      ).toThrow('Platform video ID is required')
    })

    it('preserves duration of 0 using nullish coalescing', () => {
      const data = VideoEntity.create({
        title: 'Zero Duration',
        videoUrl: 'https://youtube.com/watch?v=z',
        platform: 'youtube',
        platformVideoId: 'z',
        duration: 0,
      })
      expect(data.duration).toBe(0)
    })

    it('preserves viewCount of 0 using nullish coalescing', () => {
      const data = VideoEntity.create({
        title: 'Zero Views',
        videoUrl: 'https://youtube.com/watch?v=z',
        platform: 'youtube',
        platformVideoId: 'z',
        viewCount: 0,
      })
      expect(data.viewCount).toBe(0)
    })
  })

  describe('approve', () => {
    it('sets status to approved', () => {
      const video = new VideoEntity({ ...baseData, status: 'pending' })
      video.approve()
      expect(video.status).toBe('approved')
    })
  })

  describe('reject', () => {
    it('sets status to rejected', () => {
      const video = new VideoEntity(baseData)
      video.reject()
      expect(video.status).toBe('rejected')
    })
  })

  describe('getTags', () => {
    it('returns tags array when tags exist', () => {
      const video = new VideoEntity(baseData)
      expect(video.getTags()).toEqual(['gpt', 'openai'])
    })

    it('returns empty array when tags is null', () => {
      const video = new VideoEntity({ ...baseData, tags: null })
      expect(video.getTags()).toEqual([])
    })
  })

  describe('isApproved', () => {
    it('returns true when status is approved', () => {
      const video = new VideoEntity(baseData)
      expect(video.isApproved()).toBe(true)
    })

    it('returns false when status is pending', () => {
      const video = new VideoEntity({ ...baseData, status: 'pending' })
      expect(video.isApproved()).toBe(false)
    })

    it('returns false when status is rejected', () => {
      const video = new VideoEntity({ ...baseData, status: 'rejected' })
      expect(video.isApproved()).toBe(false)
    })
  })

  describe('isAiClassified', () => {
    it('returns true when aiClassified is true', () => {
      const video = new VideoEntity(baseData)
      expect(video.isAiClassified()).toBe(true)
    })

    it('returns false when aiClassified is false', () => {
      const video = new VideoEntity({ ...baseData, aiClassified: false })
      expect(video.isAiClassified()).toBe(false)
    })
  })

  describe('getFormattedDuration', () => {
    it('formats duration as mm:ss', () => {
      const video = new VideoEntity({ ...baseData, duration: 125 })
      expect(video.getFormattedDuration()).toBe('2:05')
    })

    it('returns null when duration is null', () => {
      const video = new VideoEntity({ ...baseData, duration: null })
      expect(video.getFormattedDuration()).toBeNull()
    })

    it('formats zero minutes correctly', () => {
      const video = new VideoEntity({ ...baseData, duration: 45 })
      expect(video.getFormattedDuration()).toBe('0:45')
    })

    it('formats exact minutes correctly', () => {
      const video = new VideoEntity({ ...baseData, duration: 180 })
      expect(video.getFormattedDuration()).toBe('3:00')
    })
  })
})
