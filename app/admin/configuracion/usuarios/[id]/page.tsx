"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  User,
  ShieldCheck,
  Pencil,
  Save,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

type Usuario = {
  id: number
  nombre: string
  username: string
  rol: string
  estatus: string
}

export default function DetalleUsuario() {
  const params = useParams()
  const id = params.id as string

  const [editableUser, setEditableUser] = useState(false)

  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [nombre, setNombre] = useState("")
  const [username, setUsername] = useState("")
  const [rol, setRol] = useState("")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function cargarUsuario() {
      try {
        const res = await fetch(`${API_URL}/usuarios/${id}`)
        const data = await res.json()

        if (!res.ok || !data.ok) {
          throw new Error(data.message || "No se pudo obtener el usuario")
        }

        setUsuario(data.data)
        setNombre(data.data.nombre || "")
        setUsername(data.data.username || "")
        setRol(data.data.rol || "")
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Error al cargar usuario"
        )
      }
    }

    if (id) {
      cargarUsuario()
    }
  }, [id])

  async function handleGuardarUsuario() {
    try {
      setLoading(true)
      setMessage("")

      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          username,
          rol,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "No se pudo actualizar el usuario")
      }

      setUsuario(data.data)
      setEditableUser(false)
      setMessage("Usuario actualizado correctamente")
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Error al actualizar usuario"
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleActualizarPassword() {
    try {
      setLoading(true)
      setMessage("")

      if (!password || !confirmPassword) {
        setMessage("Ingresa y confirma la nueva contraseña")
        return
      }

      if (password !== confirmPassword) {
        setMessage("Las contraseñas no coinciden")
        return
      }

      const res = await fetch(`${API_URL}/usuarios/${id}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "No se pudo actualizar la contraseña")
      }

      setPassword("")
      setConfirmPassword("")
      setMessage("Contraseña actualizada correctamente")
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Error al actualizar contraseña"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full items-center">
      <div className="flex h-auto w-full items-center pr-2">
        <div className="grid w-full gap-6 md:grid-cols-2">
          <Card className="w-full rounded-2xl">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>

              <div className="flex-1">
                <CardTitle className="!text-2xl">Perfil del usuario</CardTitle>
                <CardDescription className="text-lg">
                  Configuración del usuario seleccionado
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="mt-5 space-y-4">
              <RowField
                label="Nombre"
                value={nombre}
                editable={editableUser}
                onChange={setNombre}
                icon={<User className="h-4 w-4 text-muted-foreground" />}
              />

              <RowField
                label="Usuario"
                value={username}
                editable={editableUser}
                onChange={setUsername}
                icon={<User className="h-4 w-4 text-muted-foreground" />}
              />

              <RowField
                label="Rol"
                value={rol}
                editable={editableUser}
                onChange={setRol}
                icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
              />

              {message && (
                <div className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  {message}
                </div>
              )}

              <div className="mt-5 flex justify-end">
                {!editableUser ? (
                  <Button
                    variant="outline"
                    onClick={() => setEditableUser(true)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                ) : (
                  <Button onClick={handleGuardarUsuario} disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Guardando..." : "Guardar"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="!text-2xl">Cambiar contraseña</CardTitle>
              <CardDescription className="text-lg">
                Actualiza la contraseña del usuario
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <PasswordField
                label="Nueva contraseña"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={setPassword}
                show={showNew}
                onToggle={() => setShowNew(!showNew)}
              />

              <PasswordField
                label="Confirmar contraseña"
                placeholder="Repite la nueva contraseña"
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
              />

              <div className="flex justify-end pt-2">
                <Button
                  className="rounded-xl text-base"
                  onClick={handleActualizarPassword}
                  disabled={loading}
                >
                  {loading ? "Actualizando..." : "Actualizar contraseña"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

/** Componentes */
function RowField({
  label,
  value,
  editable,
  icon,
  onChange,
}: {
  label: string
  value: string
  editable: boolean
  icon: React.ReactNode
  onChange: (value: string) => void
}) {
  return (
    <div className="grid grid-cols-3 items-center gap-4">
      <span className="text-center text-lg font-medium text-muted-foreground">
        {label}
      </span>

      <div className="col-span-2">
        {!editable ? (
          <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-lg">
            {icon}
            <span>{value}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 !text-lg">
            {icon}
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="h-9"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  show: boolean
  onToggle: () => void
}) {
  return (
    <div className="space-y-1">
      <label className="text-lg font-medium text-muted-foreground">
        {label}
      </label>

      <div className="relative">
        <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="pr-10 pl-9 !text-base"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  )
}
