'use client'

// Client Component reutilizable para eliminar cualquier recurso admin
// Recibe la URL de la API route y hace DELETE con confirmación
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  url: string
  label?: string
  onSuccess?: () => void
}

export default function DeleteButton({ url, label = 'Eliminar', onSuccess }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('¿Estás seguro de que quieres eliminar este elemento?')) return

    setLoading(true)
    try {
      const res = await fetch(url, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      // Refrescamos la página para que el Server Component recargue los datos
      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch {
      alert('Error al eliminar el elemento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      className="text-red-400 hover:text-red-300 disabled:opacity-50">
      {loading ? '...' : label}
    </button>
  )
}
