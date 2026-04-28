"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

type AuthGuardProps = {
  children: React.ReactNode
  allowedRoles?: string[]
}

type Usuario = {
  id: number
  nombre: string
  username: string
  rol: string
  estatus: string
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const rawUser = localStorage.getItem("usuario")

    if (!rawUser) {
      router.replace("/auth/login")
      return
    }

    const usuario: Usuario = JSON.parse(rawUser)

    if (usuario.estatus !== "activo") {
      localStorage.removeItem("usuario")
      router.replace("/auth/login")
      return
    }

    if (allowedRoles && !allowedRoles.includes(usuario.rol)) {
      if (usuario.rol === "admin") {
        router.replace("/admin")
        return
      }

      if (usuario.rol === "vendedor") {
        router.replace("/vendedor")
        return
      }

      router.replace("/auth/login")
      return
    }

    setChecking(false)
  }, [router, pathname, allowedRoles])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Verificando sesión...
      </div>
    )
  }

  return <>{children}</>
}
