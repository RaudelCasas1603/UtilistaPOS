"use client"

import { useState } from "react"

import {
  Users,
  ShieldCheck,
  KeyRound,
  Save,
  Hash,
  UserRoundCog,
  Pencil,
  UserRound,
  Landmark,
  Percent,
  Building2,
  ChevronRight,
  BanknoteArrowUp,
  CreditCard,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ConfiguracionPage() {
  //Controla el estado del modo edicion de los datos de transferencia
  const [editable, setEditable] = useState(false)
  //Controla el estado del modo edicion de los datos de Terminal
  const [editableTerminal, setEditableTerminal] = useState(false)

  //Data Dummy
  const data = {
    clabe: "012345678901234567",
    banco: "BBVA Bancomer",
    titular: "Enrique Peña Nieto",
  }

  const dataTerminal = {
    institution: "BBVA Bancomer",
    commission: "3.5",
  }

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 bg-background p-6">
      <h2 className="text-2xl font-medium">Administración del sistema</h2>
      {/* Usuarios y roles */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-primary/10 p-3">
              <Users className="h-6 w-6" />
            </div>

            <div>
              <CardTitle className="text-2xl">Usuarios y roles</CardTitle>
              <CardDescription className="mt-1 text-base">
                Crea usuarios, asigna permisos y controla el acceso al sistema.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* métricas */}
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              title="Usuarios activos"
              value="12"
              subtitle="2 administradores, 4 cajeros, 6 vendedores"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />

            <InfoCard
              title="Roles creados"
              value="4"
              subtitle="Admin, Cajero y Vendedor"
              icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
            />

            <InfoCard
              title="Permisos críticos"
              value="8"
              subtitle="Corte, devoluciones, descuentos, eliminación, etc."
              icon={<KeyRound className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
          <Link href="/configuracion/usuarios" className="flex justify-end">
            <Button className="h-12 w-auto px-4 hover:cursor-pointer hover:bg-primary">
              <UserRoundCog /> Administrar Usuarios
              <ChevronRight className="ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
      {/* Contenedor para dos columnas  */}
      <div className="grid grid-cols-2 space-x-6">
        {/* Número de transferencia */}
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3">
                <BanknoteArrowUp className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Datos de Transferencia{" "}
                </CardTitle>
                <CardDescription>
                  Puede consultar o editar los datos para recibir transferencias
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <RowField
              label="CLABE / Número de cuenta"
              value={data.clabe}
              editable={editable}
              icon={<Hash className="h-4 w-4 text-muted-foreground" />}
            />

            <RowField
              label="Institución bancaria"
              value={data.banco}
              editable={editable}
              icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
            />

            <RowField
              label="Nombre del titular"
              value={data.titular}
              editable={editable}
              icon={<UserRound className="h-4 w-4 text-muted-foreground" />}
            />

            {/* Acciones */}
            <div className="flex justify-end gap-2 pt-4">
              {!editable ? (
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setEditable(true)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              ) : (
                <Button
                  className="rounded-xl"
                  onClick={() => setEditable(false)}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configurar Pagos con Terminal  */}
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Pagos con Terminal </CardTitle>
                <CardDescription>
                  Configura la institucion que proporciona el servicio y la
                  comision que cobra
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <ConfigRow
                label="Institución financiera"
                value={dataTerminal.institution}
                editable={editableTerminal}
                icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
                placeholder="Ej. BBVA, Banorte, Santander"
              />

              <ConfigRow
                label="Comisión por transferencia (%)"
                value={`${dataTerminal.commission}%`}
                editable={editableTerminal}
                icon={<Percent className="h-4 w-4 text-muted-foreground" />}
                placeholder="Ej. 3.5"
              />

              {/* Acción */}
              <div className="flex justify-end pt-2">
                {!editableTerminal ? (
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setEditableTerminal(true)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar configuración
                  </Button>
                ) : (
                  <Button
                    className="rounded-xl"
                    onClick={() => setEditableTerminal(false)}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Guardar cambios
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Link href="/configuracion/admin-categorias">
          <Button className="flex items-center p-8 text-xl font-semibold">
            Administracion de Categorias
            <ChevronRight className="h-8 w-8 font-bold" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

function InfoCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{title}</span>
        {icon}
      </div>

      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
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
    <div className="grid grid-cols-3 items-center gap-4">
      {/* Label */}
      <span className="text-sm font-medium text-muted-foreground">{label}</span>

      {/* Valor / Input */}
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

function ConfigRow({
  label,
  value,
  editable,
  icon,
  placeholder,
}: {
  label: string
  value: string
  editable: boolean
  icon: React.ReactNode
  placeholder: string
}) {
  return (
    <div className="grid grid-cols-3 items-center gap-4">
      {/* Label */}
      <span className="text-sm font-medium text-muted-foreground">{label}</span>

      {/* Value / Input */}
      <div className="col-span-2">
        {!editable ? (
          <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm">
            {icon}
            <span>{value}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {icon}
            <Input
              placeholder={placeholder}
              defaultValue={value.replace("%", "")}
              className="h-9"
            />
          </div>
        )}
      </div>
    </div>
  )
}
