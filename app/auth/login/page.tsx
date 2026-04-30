"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, User } from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"

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

export default function LoginPage() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (!username.trim() || !password.trim()) {
      setError("Ingresa usuario y contraseña")
      return
    }

    try {
      setLoading(true)

      const resLogin = await fetch(`${API_URL}/usuarios/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const dataLogin = await resLogin.json()

      if (!resLogin.ok || !dataLogin.ok) {
        throw new Error(dataLogin.message || "No se pudo iniciar sesión")
      }

      const usuario = dataLogin.usuario

      const resLicencia = await fetch(`${API_URL}/licencia/validar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const dataLicencia = await resLicencia.json()

      if (!resLicencia.ok || !dataLicencia.ok) {
        const estado = dataLicencia.estado || "error"

        router.push(`/activacion?estado=${estado}`)
        return
      }

      localStorage.setItem("usuario", JSON.stringify(usuario))

      if (usuario.rol === "admin") {
        router.push("/admin/dashboard")
        return
      }

      if (usuario.rol === "vendedor") {
        router.push("/vendedor/ventas")
        return
      }

      router.push("/auth/login")
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al iniciar sesión"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md rounded-2xl shadow-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <Image
              src={isDark ? "/IconoLogoClaro.svg" : "/IconoLogoOscuro.svg"}
              alt="Utilista POS"
              width={160}
              height={60}
              priority
            />
          </div>

          <CardTitle className="text-2xl font-semibold">
            Iniciar sesión
          </CardTitle>

          <CardDescription>Accede a tu sistema</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Usuario</label>

              <div className="relative">
                <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="h-11 pl-10"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña</label>

              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 pr-10 pl-10"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button disabled={loading} className="h-11 w-full rounded-xl">
              {loading ? "Validando acceso..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
