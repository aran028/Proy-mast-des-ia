/**
 * Value Object: Url
 * 
 * Representa una URL válida en el dominio.
 * 
 * Características:
 * - Inmutable: Una vez creada, no se puede modificar
 * - Validación: Acepta URLs absolutas (http/https) y rutas relativas
 * - Comparación por valor: Dos URLs son iguales si tienen el mismo valor
 * 
 * Casos de uso:
 * - URLs de sitios web (website en Tool)
 * - URLs de imágenes (image en Tool, icon en Playlist)
 * - Rutas relativas para recursos locales (/images/logo.png)
 * 
 * Uso:
 * ```typescript
 * const absoluteUrl = Url.create('https://example.com')
 * const relativeUrl = Url.create('/images/logo.png')
 * console.log(absoluteUrl.getValue()) // 'https://example.com'
 * console.log(relativeUrl.isRelative()) // false
 * console.log(absoluteUrl.isRelative()) // false
 * ```
 */

export class Url {
  // Constructor privado: Solo se puede crear mediante el método estático create()
  private constructor(private readonly value: string) {}

  /**
   * Crea una instancia de Url validando el formato
   * @param url - String con la URL a validar
   * @returns Instancia de Url
   * @throws Error si la URL no es válida
   */
  static create(url: string): Url {
    const trimmedUrl = url.trim()
    
    if (!trimmedUrl) {
      throw new Error('La URL no puede estar vacía')
    }

    if (!this.isValid(trimmedUrl)) {
      throw new Error('El formato de la URL no es válido')
    }

    return new Url(trimmedUrl)
  }

  /**
   * Valida el formato de la URL
   * Acepta:
   * - URLs absolutas con protocolo http/https
   * - Rutas relativas que empiezan con /
   * - Rutas relativas que empiezan con ./
   * 
   * @param url - String a validar
   * @returns true si el formato es válido
   */
  private static isValid(url: string): boolean {
    // Ruta relativa válida
    if (url.startsWith('/') || url.startsWith('./')) {
      return true
    }

    // URL absoluta válida
    try {
      const urlObj = new URL(url)
      // Solo permitir http y https
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  /**
   * Obtiene el valor de la URL
   * @returns String con la URL
   */
  getValue(): string {
    return this.value
  }

  /**
   * Verifica si la URL es relativa
   * @returns true si es una ruta relativa
   */
  isRelative(): boolean {
    return this.value.startsWith('/') || this.value.startsWith('./')
  }

  /**
   * Verifica si la URL es absoluta
   * @returns true si es una URL absoluta con protocolo
   */
  isAbsolute(): boolean {
    return !this.isRelative()
  }

  /**
   * Compara dos URLs por su valor
   * @param other - Otra URL a comparar
   * @returns true si son iguales
   */
  equals(other: Url): boolean {
    return this.value === other.value
  }

  /**
   * Representación en string de la URL
   * @returns El valor de la URL
   */
  toString(): string {
    return this.value
  }
}
