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
    <div className="flex flex-col gap-6 p-6">
      <h2 className="text-2xl font-semibold">Administración de usuarios</h2>

      {message && (
        <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {message}
        </div>
      )}

      <div className="h-auto pr-2">
        <div className="grid w-full gap-6 md:grid-cols-2">
          <Card className="w-full rounded-2xl">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>

              <div className="flex-1">
                <CardTitle className="!text-2xl">Perfil del usuario</CardTitle>
                <CardDescription className="text-lg">
                  Configuración del usuario activo
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="mt-5 space-y-4">
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
                icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
              />

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
                  <Button onClick={() => setEditableUser(false)}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="!text-2xl">Cambiar contraseña</CardTitle>
              <CardDescription className="text-lg">
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
      </div>

      {showCreateForm && (
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="!text-2xl">Agregar usuario</CardTitle>
              <CardDescription className="text-lg">
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
              className="grid gap-4 md:grid-cols-4"
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
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
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

              <div className="flex justify-end md:col-span-4">
                <Button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl text-base"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  {creating ? "Creando..." : "Crear usuario"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full !text-lg md:max-w-sm">
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
          className="mr-2 rounded-xl text-base"
        >
          <UserPlus className="mr-2 h-5 w-5" />
          Agregar usuario
        </Button>
      </div>

      <div className="h-[650px] space-y-2 overflow-y-auto rounded-xl pr-2">
        {filteredUsers.map((user) => (
          <UserRow
            key={user.id}
            id={user.id}
            name={user.nombre}
            role={user.rol}
          />
        ))}
      </div>
    </div>
  )
}

function RowField({ label, value, editable, icon }: any) {
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
          <div className="flex items-center gap-2">
            {icon}
            <Input defaultValue={value} />
          </div>
        )}
      </div>
    </div>
  )
}

function UserRow({ id, name, role }: any) {
  return (
    <div className="flex items-center justify-between rounded-xl border px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>

        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>

      <Link href={`/admin/configuracion/usuarios/${id}`}>
        <Button variant="ghost">
          Ver detalles
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}

function PasswordField({ label, placeholder, show, onToggle }: any) {
  return (
    <div className="space-y-1">
      <label className="text-lg font-medium text-muted-foreground">
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
          className="absolute top-1/2 right-3 -translate-y-1/2"
        >
          {show ? <EyeOff /> : <Eye />}
        </button>
      </div>
    </div>
  )
}
