/**
 * Value Objects del dominio
 * 
 * Los Value Objects son objetos inmutables que representan conceptos del dominio
 * y se comparan por su valor, no por su identidad.
 * 
 * Características principales:
 * - Inmutabilidad: No se pueden modificar después de crearse
 * - Validación: Garantizan que los datos son válidos
 * - Comparación por valor: Dos instancias con el mismo valor son iguales
 * - Sin identidad: No tienen ID, se identifican por su valor
 * 
 * Uso:
 * ```typescript
 * import { Email, Url, Tag } from '@/domain/value-objects'
 * 
 * const email = Email.create('user@example.com')
 * const url = Url.create('https://example.com')
 * const tag = Tag.create('react')
 * ```
 */

export { Email } from './Email'
export { Url } from './Url'
export { Tag } from './Tag'
