/**
 * Value Object: Tag
 * 
 * Representa una etiqueta válida en el dominio.
 * 
 * Características:
 * - Inmutable: Una vez creada, no se puede modificar
 * - Validación: Longitud entre 1 y 50 caracteres, solo alfanuméricos, guiones y espacios
 * - Normalización: Se convierte a minúsculas y se eliminan espacios extra
 * - Comparación por valor: Dos tags son iguales si tienen el mismo valor normalizado
 * 
 * Casos de uso:
 * - Tags de herramientas (Tool.tags)
 * - Categorización y búsqueda
 * 
 * Uso:
 * ```typescript
 * const tag = Tag.create('React')
 * console.log(tag.getValue()) // 'react'
 * 
 * const tagWithSpaces = Tag.create('  Next.js  ')
 * console.log(tagWithSpaces.getValue()) // 'next.js'
 * ```
 */

export class Tag {
  // Constantes de validación
  private static readonly MIN_LENGTH = 1
  private static readonly MAX_LENGTH = 50
  
  // Constructor privado: Solo se puede crear mediante el método estático create()
  private constructor(private readonly value: string) {}

  /**
   * Crea una instancia de Tag validando y normalizando el valor
   * @param tag - String con el tag a validar
   * @returns Instancia de Tag
   * @throws Error si el tag no es válido
   */
  static create(tag: string): Tag {
    // Normalizar: trim y convertir a minúsculas
    const normalized = tag.trim().toLowerCase()
    
    if (!normalized) {
      throw new Error('El tag no puede estar vacío')
    }

    if (normalized.length < this.MIN_LENGTH) {
      throw new Error(`El tag debe tener al menos ${this.MIN_LENGTH} carácter`)
    }

    if (normalized.length > this.MAX_LENGTH) {
      throw new Error(`El tag no puede tener más de ${this.MAX_LENGTH} caracteres`)
    }

    if (!this.isValid(normalized)) {
      throw new Error('El tag solo puede contener letras, números, guiones, puntos y espacios')
    }

    return new Tag(normalized)
  }

  /**
   * Valida el formato del tag
   * Permite: letras (con acentos), números, guiones, puntos y espacios
   * No permite: caracteres especiales como @, #, $, etc.
   * 
   * @param tag - String a validar
   * @returns true si el formato es válido
   */
  private static isValid(tag: string): boolean {
    // Regex que permite letras (incluyendo acentos), números, guiones, puntos y espacios
    // No permite múltiples espacios consecutivos
    const tagRegex = /^[\p{L}\p{N}\s.-]+$/u
    const noMultipleSpaces = !/\s{2,}/.test(tag)
    
    return tagRegex.test(tag) && noMultipleSpaces
  }

  /**
   * Crea múltiples tags desde un array de strings
   * Filtra valores vacíos y duplicados
   * 
   * @param tags - Array de strings con los tags
   * @returns Array de instancias de Tag
   * @throws Error si algún tag no es válido
   */
  static createMany(tags: string[]): Tag[] {
    // Filtrar valores vacíos
    const validTags = tags.filter(t => t.trim())
    
    // Crear tags y eliminar duplicados
    const tagInstances = validTags.map(t => Tag.create(t))
    const uniqueTags = tagInstances.filter((tag, index, self) => 
      index === self.findIndex(t => t.equals(tag))
    )
    
    return uniqueTags
  }

  /**
   * Obtiene el valor del tag
   * @returns String con el tag normalizado
   */
  getValue(): string {
    return this.value
  }

  /**
   * Compara dos tags por su valor
   * @param other - Otro tag a comparar
   * @returns true si son iguales
   */
  equals(other: Tag): boolean {
    return this.value === other.value
  }

  /**
   * Representación en string del tag
   * @returns El valor del tag
   */
  toString(): string {
    return this.value
  }
}
