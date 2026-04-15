'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Card } from '@/presentation/components/ui/card'
import { useAuth } from '@/presentation/hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signIn } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      router.push('/')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Iniciar sesión</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900/50 text-red-400 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm text-pink-400 mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-pink-400 mb-1">Contraseña</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </Button>
        </form>

        <p className="text-center text-zinc-400 text-sm mt-4">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-pink-400 hover:underline">
            Regístrate
          </Link>
        </p>
      </Card>
    </div>
  )
}
