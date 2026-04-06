import { describe, it, expect } from 'vitest'
import { Url } from '../Url'

describe('Url Value Object', () => {
  describe('create', () => {
    it('debe crear una URL absoluta válida con https', () => {
      const url = Url.create('https://example.com')
      expect(url.getValue()).toBe('https://example.com')
    })

    it('debe crear una URL absoluta válida con http', () => {
      const url = Url.create('http://example.com')
      expect(url.getValue()).toBe('http://example.com')
    })

    it('debe crear una ruta relativa que empieza con /', () => {
      const url = Url.create('/images/logo.png')
      expect(url.getValue()).toBe('/images/logo.png')
    })

    it('debe crear una ruta relativa que empieza con ./', () => {
      const url = Url.create('./assets/icon.svg')
      expect(url.getValue()).toBe('./assets/icon.svg')
    })

    it('debe eliminar espacios en blanco', () => {
      const url = Url.create('  https://example.com  ')
      expect(url.getValue()).toBe('https://example.com')
    })

    it('debe lanzar error si la URL está vacía', () => {
      expect(() => Url.create('')).toThrow('La URL no puede estar vacía')
    })

    it('debe lanzar error si la URL solo tiene espacios', () => {
      expect(() => Url.create('   ')).toThrow('La URL no puede estar vacía')
    })

    it('debe lanzar error si la URL no tiene protocolo válido', () => {
      expect(() => Url.create('ftp://example.com')).toThrow('El formato de la URL no es válido')
    })

    it('debe lanzar error si la URL es inválida', () => {
      expect(() => Url.create('not a url')).toThrow('El formato de la URL no es válido')
    })
  })

  describe('isRelative', () => {
    it('debe retornar true para rutas que empiezan con /', () => {
      const url = Url.create('/images/logo.png')
      expect(url.isRelative()).toBe(true)
    })

    it('debe retornar true para rutas que empiezan con ./', () => {
      const url = Url.create('./assets/icon.svg')
      expect(url.isRelative()).toBe(true)
    })

    it('debe retornar false para URLs absolutas', () => {
      const url = Url.create('https://example.com')
      expect(url.isRelative()).toBe(false)
    })
  })

  describe('isAbsolute', () => {
    it('debe retornar true para URLs absolutas', () => {
      const url = Url.create('https://example.com')
      expect(url.isAbsolute()).toBe(true)
    })

    it('debe retornar false para rutas relativas', () => {
      const url = Url.create('/images/logo.png')
      expect(url.isAbsolute()).toBe(false)
    })
  })

  describe('equals', () => {
    it('debe retornar true si dos URLs tienen el mismo valor', () => {
      const url1 = Url.create('https://example.com')
      const url2 = Url.create('https://example.com')
      expect(url1.equals(url2)).toBe(true)
    })

    it('debe retornar false si dos URLs tienen valores diferentes', () => {
      const url1 = Url.create('https://example.com')
      const url2 = Url.create('https://other.com')
      expect(url1.equals(url2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('debe retornar el valor de la URL', () => {
      const url = Url.create('https://example.com')
      expect(url.toString()).toBe('https://example.com')
    })
  })
})
