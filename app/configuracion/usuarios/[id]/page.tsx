"use client"

import { useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DetalleUsuario() {

  const [editableUser, setEditableUser] = useState(false)

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const currentUser = {
    name: "Juan Pérez",
    role: "Administrador",
  }

  return (
    <div className="h-full flex items-center">
    <div className="h-auto w-full pr-2 flex items-center">
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

            <div className="mt-5 flex justify-end">
              {!editableUser ? (
                <Button variant="outline" onClick={() => setEditableUser(true)}>
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
              Actualiza la contraseña del administrador
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">

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
              <Button className="rounded-xl text-base">
                Actualizar contraseña
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  )
}


/**Componentes  */
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
      <span className="text-lg font-medium text-muted-foreground text-center">{label}</span>

      <div className="col-span-2">
        {!editable ? (
          <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-lg">
            {icon}
            <span>{value}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 !text-lg">
            {icon}
            <Input defaultValue={value} className="h-9" />
          </div>
        )}
      </div>
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
      <label className="text-lg font-medium text-muted-foreground ">
        {label}
      </label>

      <div className="relative">
        <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

        <Input
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
