/**
 * Value Object: Email
 * 
 * Representa un email válido en el dominio.
 * 
 * Características:
 * - Inmutable: Una vez creado, no se puede modificar
 * - Validación: Solo acepta emails con formato válido
 * - Comparación por valor: Dos emails son iguales si tienen el mismo valor
 * 
 * Uso:
 * ```typescript
 * const email = Email.create('user@example.com')
 * console.log(email.getValue()) // 'user@example.com'
 * ```
 */

export class Email {
  // Constructor privado: Solo se puede crear mediante el método estático create()
  private constructor(private readonly value: string) {}

  /**
   * Crea una instancia de Email validando el formato
   * @param email - String con el email a validar
   * @returns Instancia de Email
   * @throws Error si el email no es válido
   */
  static create(email: string): Email {
    const trimmedEmail = email.trim()
    
    if (!trimmedEmail) {
      throw new Error('El email no puede estar vacío')
    }

    if (!this.isValid(trimmedEmail)) {
      throw new Error('El formato del email no es válido')
    }

    // Normalizar a minúsculas
    return new Email(trimmedEmail.toLowerCase())
  }

  /**
   * Valida el formato del email usando regex
   * @param email - String a validar
   * @returns true si el formato es válido
   */
  private static isValid(email: string): boolean {
    // Regex básico para validar emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Obtiene el valor del email
   * @returns String con el email
   */
  getValue(): string {
    return this.value
  }

  /**
   * Compara dos emails por su valor
   * @param other - Otro email a comparar
   * @returns true si son iguales
   */
  equals(other: Email): boolean {
    return this.value === other.value
  }

  /**
   * Representación en string del email
   * @returns El valor del email
   */
  toString(): string {
    return this.value
  }
}
