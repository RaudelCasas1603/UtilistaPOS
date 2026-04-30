"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { KeyRound, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export default function ActivacionPage() {
  const router = useRouter()
  const params = useSearchParams()

  const [licenciaKey, setLicenciaKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [estado, setEstado] = useState("")

  useEffect(() => {
    const estadoParam = params.get("estado")
    if (estadoParam) {
      setEstado(estadoParam)
    }
  }, [params])

  async function activarLicencia(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!licenciaKey.trim()) {
      setError("Ingresa la clave de licencia")
      return
    }

    try {
      setLoading(true)

      const res = await fetch(`${API_URL}/licencia/activar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          licencia_key: licenciaKey,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.mensaje || "No se pudo activar la licencia")
      }

      // Redirige al login después de activar
      router.push("/auth/login")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al activar licencia")
    } finally {
      setLoading(false)
    }
  }

  function renderEstado() {
    if (!estado) return null

    const mensajes: Record<string, string> = {
      vencida: "Tu licencia está vencida. Renueva para continuar.",
      bloqueada: "Tu licencia fue bloqueada. Contacta soporte.",
      sin_licencia: "No hay una licencia activa en este equipo.",
      error: "No se pudo validar la licencia.",
    }

    return (
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-600">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {mensajes[estado] || "Error de licencia"}
        </div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md rounded-2xl shadow-sm">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold">
            Activar licencia
          </CardTitle>
          <CardDescription>
            Ingresa tu clave para activar el sistema
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={activarLicencia} className="space-y-4">
            {/* ESTADO */}
            {renderEstado()}

            {/* INPUT */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Clave de licencia</label>

              <div className="relative">
                <KeyRound className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={licenciaKey}
                  onChange={(e) => setLicenciaKey(e.target.value)}
                  placeholder="UTILISTA-XXXX-XXXX-XXXX"
                  className="h-11 pl-10"
                />
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* BOTÓN */}
            <Button disabled={loading} className="h-11 w-full rounded-xl">
              {loading ? "Activando..." : "Activar licencia"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
