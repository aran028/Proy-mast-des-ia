import { describe, it, expect } from 'vitest'
import { Tag } from '../Tag'

describe('Tag Value Object', () => {
  describe('create', () => {
    it('debe crear un tag válido', () => {
      const tag = Tag.create('React')
      expect(tag.getValue()).toBe('react')
    })

    it('debe normalizar a minúsculas', () => {
      const tag = Tag.create('TYPESCRIPT')
      expect(tag.getValue()).toBe('typescript')
    })

    it('debe eliminar espacios en blanco al inicio y final', () => {
      const tag = Tag.create('  Next.js  ')
      expect(tag.getValue()).toBe('next.js')
    })

    it('debe permitir tags con guiones', () => {
      const tag = Tag.create('web-development')
      expect(tag.getValue()).toBe('web-development')
    })

    it('debe permitir tags con puntos', () => {
      const tag = Tag.create('node.js')
      expect(tag.getValue()).toBe('node.js')
    })

    it('debe permitir tags con espacios simples', () => {
      const tag = Tag.create('machine learning')
      expect(tag.getValue()).toBe('machine learning')
    })

    it('debe permitir tags con acentos', () => {
      const tag = Tag.create('programación')
      expect(tag.getValue()).toBe('programación')
    })

    it('debe lanzar error si el tag está vacío', () => {
      expect(() => Tag.create('')).toThrow('El tag no puede estar vacío')
    })

    it('debe lanzar error si el tag solo tiene espacios', () => {
      expect(() => Tag.create('   ')).toThrow('El tag no puede estar vacío')
    })

    it('debe lanzar error si el tag es demasiado largo', () => {
      const longTag = 'a'.repeat(51)
      expect(() => Tag.create(longTag)).toThrow('El tag no puede tener más de 50 caracteres')
    })

    it('debe lanzar error si el tag tiene caracteres especiales', () => {
      expect(() => Tag.create('react@2024')).toThrow('El tag solo puede contener letras, números, guiones, puntos y espacios')
    })

    it('debe lanzar error si el tag tiene múltiples espacios consecutivos', () => {
      expect(() => Tag.create('web  development')).toThrow('El tag solo puede contener letras, números, guiones, puntos y espacios')
    })
  })

  describe('createMany', () => {
    it('debe crear múltiples tags desde un array', () => {
      const tags = Tag.createMany(['React', 'TypeScript', 'Next.js'])
      expect(tags).toHaveLength(3)
      expect(tags[0].getValue()).toBe('react')
      expect(tags[1].getValue()).toBe('typescript')
      expect(tags[2].getValue()).toBe('next.js')
    })

    it('debe filtrar valores vacíos', () => {
      const tags = Tag.createMany(['React', '', '  ', 'TypeScript'])
      expect(tags).toHaveLength(2)
      expect(tags[0].getValue()).toBe('react')
      expect(tags[1].getValue()).toBe('typescript')
    })

    it('debe eliminar duplicados', () => {
      const tags = Tag.createMany(['React', 'react', 'REACT', 'TypeScript'])
      expect(tags).toHaveLength(2)
      expect(tags[0].getValue()).toBe('react')
      expect(tags[1].getValue()).toBe('typescript')
    })

    it('debe lanzar error si algún tag no es válido', () => {
      expect(() => Tag.createMany(['React', 'invalid@tag'])).toThrow()
    })
  })

  describe('equals', () => {
    it('debe retornar true si dos tags tienen el mismo valor', () => {
      const tag1 = Tag.create('React')
      const tag2 = Tag.create('react')
      expect(tag1.equals(tag2)).toBe(true)
    })

    it('debe retornar false si dos tags tienen valores diferentes', () => {
      const tag1 = Tag.create('React')
      const tag2 = Tag.create('Vue')
      expect(tag1.equals(tag2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('debe retornar el valor del tag', () => {
      const tag = Tag.create('React')
      expect(tag.toString()).toBe('react')
    })
  })
})
