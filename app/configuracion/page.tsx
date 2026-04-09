"use client"

import { useState } from "react"

import {
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
  LayoutGrid,
  Printer,
} from "lucide-react"

import { Switch } from "@/components/ui/switch"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import Link from "next/link"

export default function ConfiguracionPage() {
  //Controla el estado del modo edicion de los datos de transferencia
  const [editable, setEditable] = useState(false)
  //Controla el estado del modo edicion de los datos de Terminal
  const [editableTerminal, setEditableTerminal] = useState(false)

  //Controla el uso de la impresora
  const [habilitarImpresora, setHabilitarImpresora] = useState(false)
  const [impresoraSeleccionada, setImpresoraSeleccionada] = useState("")

  const impresoras = ["HP LaserJet", "EPSON TM-T20", "Brother HL-L2350"]

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

      {/* Contenedor para 3 columnas  */}
      <div className="grid grid-cols-3 space-x-6">
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
                    className="mt-10 rounded-xl"
                    onClick={() => setEditableTerminal(true)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar configuración
                  </Button>
                ) : (
                  <Button
                    className="mt-10 rounded-xl"
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

        {/** Configurar el uso de impresiones */}

        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3">
                <Printer className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Habilitar Impresión de ticket
                </CardTitle>
                <CardDescription>
                  Habilita o deshabilita el uso de impresión de tickets
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Switch */}
            <div className="flex items-center justify-between">
              <span className="ml-8 text-lg font-semibold">
                Habilitar Impresora
              </span>
              <Switch
                checked={habilitarImpresora}
                onCheckedChange={setHabilitarImpresora}
                className="mr-16"
              />
            </div>

            {/* Dropdown de impresoras */}
            <div className="ml-8 max-w-md space-y-2">
              <label className="text-lg font-medium">
                Seleccione una impresora
              </label>

              <Select
                disabled={!habilitarImpresora}
                value={impresoraSeleccionada}
                onValueChange={setImpresoraSeleccionada}
              >
                <SelectTrigger className="w-3/6">
                  <SelectValue placeholder="Seleccione impresora..." />
                </SelectTrigger>

                <SelectContent
                  className="rounded-lg border border-border bg-background shadow-lg"
                  position="popper"
                >
                  {impresoras.map((impresora) => (
                    <SelectItem key={impresora} value={impresora}>
                      {impresora}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botón Guardar */}
            <div className="flex justify-end pt-6">
              <Button disabled={habilitarImpresora && !impresoraSeleccionada}>
                <Save />
                Guardar cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
        <Link
          href="/configuracion/admin-categorias"
          className="flex w-full justify-center"
        >
          <span className="flex h-24 w-1/2 flex-col items-center justify-center gap-4 rounded-xl border py-2 text-center transition-all duration-400 hover:bg-primary/90">
            <LayoutGrid className="h-12 w-12" />
            <span className="text-xl font-semibold">
              Administración de Categorías
            </span>
          </span>
        </Link>

        <Link
          href="/configuracion/usuarios"
          className="flex w-full justify-center"
        >
          <span className="flex h-24 w-1/2 flex-col items-center justify-center gap-4 rounded-xl border text-center transition-all duration-400 hover:bg-primary/90">
            <UserRoundCog className="h-12 w-12" />
            <span className="text-xl font-semibold">Administrar Usuarios</span>
          </span>
        </Link>
        
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
