"use client"

import { useState } from "react"
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

/* =========================================================
   PAGE
========================================================= */

export default function AdminUsuarios() {
  const [editableUser, setEditableUser] = useState(false)

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const currentUser = {
    name: "Juan Pérez",
    role: "Administrador",
  }

  const users = [
    { id: "1", name: "Juan Pérez", role: "Administrador" },
    { id: "2", name: "María López", role: "Cajera" },
    { id: "3", name: "Carlos Ramírez", role: "Vendedor" },
    { id: "4", name: "Ana Torres", role: "Supervisor" },
    { id: "5", name: "Luis Gómez", role: "Cajero" },
    { id: "6", name: "Fernanda Ruiz", role: "Vendedor" },
    { id: "7", name: "Diego Herrera", role: "Administrador" },
    { id: "8", name: "Sofía Navarro", role: "Cajera" },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Título */}
      <h2 className="text-2xl font-semibold">Administración de usuarios</h2>

      {/* ================================================= */}
      {/* Perfil de usuario + contraseña con scroll */}
      {/* ================================================= */}
      <div className="max-h-[430px] overflow-y-auto pr-2">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="max-w-md rounded-2xl">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>

              <div className="flex-1">
                <CardTitle className="text-lg">Perfil del usuario</CardTitle>
                <CardDescription>
                  Configuración del usuario activo
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <RowField
                label="Nombre"
                value={currentUser.name}
                editable={editableUser}
                icon={<User className="h-4 w-4 text-muted-foreground" />}
              />

              <RowField
                label="Rol"
                value={currentUser.role}
                editable={editableUser}
                icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
              />

              <div className="flex justify-end">
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
              <CardTitle className="text-lg">Cambiar contraseña</CardTitle>
              <CardDescription>
                Actualiza la contraseña del administrador
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <PasswordField
                label="Contraseña actual"
                placeholder="••••••••"
                show={showCurrent}
                onToggle={() => setShowCurrent(!showCurrent)}
              />

              <PasswordField
                label="Nueva contraseña"
                placeholder="Mínimo 8 caracteres"
                show={showNew}
                onToggle={() => setShowNew(!showNew)}
              />

              <PasswordField
                label="Confirmar contraseña"
                placeholder="Repite la nueva contraseña"
                show={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
              />

              <div className="flex justify-end pt-2">
                <Button className="rounded-xl">Actualizar contraseña</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ================================================= */}
      {/* Toolbar */}
      {/* ================================================= */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar usuario por nombre o rol"
            className="pl-9"
          />
        </div>

        <Button className="rounded-xl">
          <UserPlus className="mr-2 h-4 w-4" />
          Agregar usuario
        </Button>
      </div>

      {/* ================================================= */}
      {/* Lista de usuarios con scroll */}
      {/* ================================================= */}
      <div className="h-[380px] space-y-2 overflow-y-auto pr-2">
        {users.map((user) => (
          <UserRow
            key={user.id}
            id={user.id}
            name={user.name}
            role={user.role}
          />
        ))}
      </div>
    </div>
  )
}

/* =========================================================
   COMPONENTS
========================================================= */

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
    <div className="grid grid-cols-3 items-center gap-4">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>

      <div className="col-span-2">
        {!editable ? (
          <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm">
            {icon}
            <span>{value}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {icon}
            <Input defaultValue={value} className="h-9" />
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
  id: string
  name: string
  role: string
}) {
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

      <Link href={`/configuracion/usuarios/${id}`}>
        <Button variant="ghost">
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
        <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="pr-10 pl-9"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
