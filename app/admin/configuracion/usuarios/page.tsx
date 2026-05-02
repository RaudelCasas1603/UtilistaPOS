"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

import {
  User,
  UserPlus,
  ShieldCheck,
  Search,
  ChevronRight,
  Pencil,
  Save,
  Lock,
  Eye,
  EyeOff,
  X,
  Loader2,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

export default function AdminUsuarios() {
  const [editableUser, setEditableUser] = useState(false)

  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showCreatePassword, setShowCreatePassword] = useState(false)

  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [users, setUsers] = useState<Usuario[]>([])
  const [search, setSearch] = useState("")

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState("")

  const [newUser, setNewUser] = useState({
    nombre: "",
    username: "",
    password: "",
    rol: "vendedor",
  })

  async function cargarUsuarios() {
    try {
      const res = await fetch(`${API_URL}/usuarios`)
      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "No se pudieron cargar usuarios")
      }

      setUsers(data.data || [])
    } catch (error) {
      console.error(error)
      setMessage(
        error instanceof Error ? error.message : "Error al cargar usuarios"
      )
    }
  }

  useEffect(() => {
    const raw = localStorage.getItem("usuario")
    if (raw) {
      setCurrentUser(JSON.parse(raw))
    }

    cargarUsuarios()
  }, [])

  const filteredUsers = useMemo(() => {
    const value = search.toLowerCase().trim()

    if (!value) return users

    return users.filter((user) => {
      return (
        user.nombre?.toLowerCase().includes(value) ||
        user.username?.toLowerCase().includes(value) ||
        user.rol?.toLowerCase().includes(value)
      )
    })
  }, [users, search])

  async function handleCreateUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage("")

    if (
      !newUser.nombre.trim() ||
      !newUser.username.trim() ||
      !newUser.password.trim() ||
      !newUser.rol.trim()
    ) {
      setMessage("Todos los campos son obligatorios")
      return
    }

    if (newUser.password.length < 6) {
      setMessage("La contraseña debe tener mínimo 6 caracteres")
      return
    }

    try {
      setCreating(true)

      const res = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "No se pudo crear el usuario")
      }

      setNewUser({
        nombre: "",
        username: "",
        password: "",
        rol: "vendedor",
      })

      setShowCreateForm(false)
      setMessage("Usuario creado correctamente")

      await cargarUsuarios()
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Error al crear usuario"
      )
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] min-h-0 w-full overflow-hidden bg-background">
      <div className="h-full w-full overflow-x-hidden overflow-y-auto p-4 pb-16 md:p-6 md:pb-20">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
          <div className="flex shrink-0 flex-col gap-2">
            <h2 className="text-2xl font-semibold">
              Administración de usuarios
            </h2>
            <p className="text-sm text-muted-foreground">
              Administra usuarios, roles y accesos del sistema.
            </p>
          </div>

          {message && (
            <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              {message}
            </div>
          )}

          <div className="grid w-full gap-6 lg:grid-cols-2">
            <Card className="min-w-0 rounded-2xl">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>

                <div className="min-w-0 flex-1">
                  <CardTitle className="!text-2xl">
                    Perfil del usuario
                  </CardTitle>
                  <CardDescription className="text-base">
                    Configuración del usuario activo
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="mt-2 space-y-4">
                <RowField
                  label="Nombre"
                  value={currentUser?.nombre || ""}
                  editable={editableUser}
                  icon={<User className="h-4 w-4 text-muted-foreground" />}
                />

                <RowField
                  label="Rol"
                  value={currentUser?.rol || ""}
                  editable={editableUser}
                  icon={
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  }
                />

                <div className="flex justify-end pt-2">
                  {!editableUser ? (
                    <Button
                      variant="outline"
                      onClick={() => setEditableUser(true)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  ) : (
                    <Button onClick={() => setEditableUser(false)}>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="min-w-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="!text-2xl">Cambiar contraseña</CardTitle>
                <CardDescription className="text-base">
                  Actualiza la contraseña
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <PasswordField
                  label="Nueva contraseña"
                  placeholder="Mínimo 6 caracteres"
                  show={showNew}
                  onToggle={() => setShowNew(!showNew)}
                />

                <PasswordField
                  label="Confirmar contraseña"
                  placeholder="Repite la contraseña"
                  show={showConfirm}
                  onToggle={() => setShowConfirm(!showConfirm)}
                />

                <div className="flex justify-end pt-2">
                  <Button className="rounded-xl text-base">
                    Actualizar contraseña
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {showCreateForm && (
            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="!text-2xl">Agregar usuario</CardTitle>
                  <CardDescription className="text-base">
                    Crea un nuevo usuario para el sistema
                  </CardDescription>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateForm(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>

              <CardContent>
                <form
                  onSubmit={handleCreateUser}
                  className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
                >
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Nombre
                    </label>
                    <Input
                      value={newUser.nombre}
                      onChange={(e) =>
                        setNewUser((prev) => ({
                          ...prev,
                          nombre: e.target.value,
                        }))
                      }
                      placeholder="Nombre completo"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Usuario
                    </label>
                    <Input
                      value={newUser.username}
                      onChange={(e) =>
                        setNewUser((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      placeholder="usuario"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Rol
                    </label>
                    <select
                      value={newUser.rol}
                      onChange={(e) =>
                        setNewUser((prev) => ({
                          ...prev,
                          rol: e.target.value,
                        }))
                      }
                      className="border-input h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="admin">Admin</option>
                      <option value="vendedor">Vendedor</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Contraseña
                    </label>

                    <div className="relative">
                      <Input
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        type={showCreatePassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        className="pr-10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowCreatePassword(!showCreatePassword)
                        }
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                      >
                        {showCreatePassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end md:col-span-2 xl:col-span-4">
                    <Button
                      type="submit"
                      disabled={creating}
                      className="rounded-xl text-base"
                    >
                      {creating ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <UserPlus className="mr-2 h-5 w-5" />
                      )}
                      {creating ? "Creando..." : "Crear usuario"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar usuario..."
                className="pl-9"
              />
            </div>

            <Button
              type="button"
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="rounded-xl text-base"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Agregar usuario
            </Button>
          </div>

          <div className="space-y-2 pb-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <UserRow
                  key={user.id}
                  id={user.id}
                  name={user.nombre}
                  role={user.rol}
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                No hay usuarios para mostrar.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function RowField({
  label,
  value,
  editable,
  icon,
}: {
  label: string
  value: string
  editable: boolean
  icon: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:items-center">
      <span className="text-sm font-medium text-muted-foreground sm:text-center">
        {label}
      </span>

      <div className="min-w-0 sm:col-span-2">
        {!editable ? (
          <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm">
            <span className="shrink-0">{icon}</span>
            <span className="truncate">{value || "Sin información"}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="shrink-0">{icon}</span>
            <Input defaultValue={value} />
          </div>
        )}
      </div>
    </div>
  )
}

function UserRow({
  id,
  name,
  role,
}: {
  id: number
  name: string
  role: string
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="min-w-0">
          <p className="truncate font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>

      <Link href={`/admin/configuracion/usuarios/${id}`}>
        <Button variant="ghost" className="w-full sm:w-auto">
          Ver detalles
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}

function PasswordField({
  label,
  placeholder,
  show,
  onToggle,
}: {
  label: string
  placeholder: string
  show: boolean
  onToggle: () => void
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>

      <div className="relative">
        <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

        <Input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="pr-10 pl-9"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  )
}
