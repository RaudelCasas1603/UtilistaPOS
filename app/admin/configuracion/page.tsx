"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Save,
  Hash,
  UserRoundCog,
  Pencil,
  UserRound,
  Landmark,
  Percent,
  Building2,
  BanknoteArrowUp,
  CreditCard,
  LayoutGrid,
  Printer,
  Store,
  Phone,
  MapPin,
  MessageSquareText,
  ImageIcon,
  Loader2,
  CheckCircle2,
  XCircle,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

type ConfiguracionSistema = {
  id?: number
  nombre_negocio: string
  telefono_negocio: string
  direccion_negocio: string
  nombre_banco: string
  numero_cuenta: string
  nombre_titular: string
  proveedor_terminal: string
  comision_terminal: string
  habilitar_impresora: boolean
  nombre_impresora: string
  mensaje_ticket: string
  logo_url: string
}

type ApiImpresora = {
  nombre: string
  default: boolean
}

const initialConfig: ConfiguracionSistema = {
  nombre_negocio: "",
  telefono_negocio: "",
  direccion_negocio: "",
  nombre_banco: "",
  numero_cuenta: "",
  nombre_titular: "",
  proveedor_terminal: "",
  comision_terminal: "0",
  habilitar_impresora: false,
  nombre_impresora: "",
  mensaje_ticket: "",
  logo_url: "",
}

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<ConfiguracionSistema>(initialConfig)

  const [editableNegocio, setEditableNegocio] = useState(false)
  const [editableTransferencia, setEditableTransferencia] = useState(false)
  const [editableTerminal, setEditableTerminal] = useState(false)
  const [editableImpresora, setEditableImpresora] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [alert, setAlert] = useState<{
    type: "success" | "error"
    title: string
    message: string
  } | null>(null)

  const [impresoras, setImpresoras] = useState<ApiImpresora[]>([])
  const [loadingImpresoras, setLoadingImpresoras] = useState(false)

  useEffect(() => {
    cargarConfiguracion()
    cargarImpresoras()
  }, [])

  async function cargarConfiguracion() {
    try {
      setLoading(true)

      const res = await fetch(`${API_URL}/configuracion`, {
        cache: "no-store",
      })

      if (res.status === 404) {
        setConfig(initialConfig)
        return
      }

      if (!res.ok) {
        throw new Error("No se pudo cargar la configuración")
      }

      const data = await res.json()

      setConfig({
        id: data.id,
        nombre_negocio: data.nombre_negocio || "",
        telefono_negocio: data.telefono_negocio || "",
        direccion_negocio: data.direccion_negocio || "",
        nombre_banco: data.nombre_banco || "",
        numero_cuenta: data.numero_cuenta || "",
        nombre_titular: data.nombre_titular || "",
        proveedor_terminal: data.proveedor_terminal || "",
        comision_terminal: String(data.comision_terminal ?? "0"),
        habilitar_impresora: Boolean(data.habilitar_impresora),
        nombre_impresora: data.nombre_impresora || "",
        mensaje_ticket: data.mensaje_ticket || "",
        logo_url: data.logo_url || "",
      })
    } catch (error) {
      console.error(error)
      mostrarAlert(
        "error",
        "Error al cargar",
        "No se pudo obtener la configuración del sistema."
      )
    } finally {
      setLoading(false)
    }
  }

  async function cargarImpresoras() {
    try {
      setLoadingImpresoras(true)

      const res = await fetch(`${API_URL}/impresion/impresoras`, {
        cache: "no-store",
      })

      if (!res.ok) {
        throw new Error("No se pudieron cargar las impresoras")
      }

      const data = await res.json()
      setImpresoras(data)
    } catch (error) {
      console.error(error)
      mostrarAlert(
        "error",
        "Error al cargar impresoras",
        "No se pudieron obtener las impresoras instaladas."
      )
    } finally {
      setLoadingImpresoras(false)
    }
  }

  async function guardarConfiguracion() {
    try {
      setSaving(true)

      const payload = {
        ...config,
        comision_terminal: Number(config.comision_terminal || 0),
        nombre_impresora: config.habilitar_impresora
          ? config.nombre_impresora
          : "",
      }

      const res = await fetch(`${API_URL}/configuracion`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error("No se pudo guardar la configuración")
      }

      const data = await res.json()

      if (data.configuracion) {
        setConfig({
          id: data.configuracion.id,
          nombre_negocio: data.configuracion.nombre_negocio || "",
          telefono_negocio: data.configuracion.telefono_negocio || "",
          direccion_negocio: data.configuracion.direccion_negocio || "",
          nombre_banco: data.configuracion.nombre_banco || "",
          numero_cuenta: data.configuracion.numero_cuenta || "",
          nombre_titular: data.configuracion.nombre_titular || "",
          proveedor_terminal: data.configuracion.proveedor_terminal || "",
          comision_terminal: String(
            data.configuracion.comision_terminal ?? "0"
          ),
          habilitar_impresora: Boolean(data.configuracion.habilitar_impresora),
          nombre_impresora: data.configuracion.nombre_impresora || "",
          mensaje_ticket: data.configuracion.mensaje_ticket || "",
          logo_url: data.configuracion.logo_url || "",
        })
      }

      setEditableNegocio(false)
      setEditableTransferencia(false)
      setEditableTerminal(false)
      setEditableImpresora(false)

      mostrarAlert(
        "success",
        "Configuración guardada",
        "Los cambios se guardaron correctamente."
      )
    } catch (error) {
      console.error(error)
      mostrarAlert(
        "error",
        "Error al guardar",
        "No se pudo guardar la configuración."
      )
    } finally {
      setSaving(false)
    }
  }

  function updateField<K extends keyof ConfiguracionSistema>(
    field: K,
    value: ConfiguracionSistema[K]
  ) {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  function mostrarAlert(
    type: "success" | "error",
    title: string,
    message: string
  ) {
    setAlert({ type, title, message })

    setTimeout(() => {
      setAlert(null)
    }, 3500)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando configuración...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 bg-background p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-medium">Administración del sistema</h2>
        <p className="text-sm text-muted-foreground">
          Configura los datos generales del negocio, pagos, terminal e
          impresión.
        </p>
      </div>

      {alert && (
        <Alert
          className={
            alert.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10"
              : "border-destructive/40 bg-destructive/10"
          }
        >
          {alert.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 2xl:grid-cols-4">
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Datos del negocio</CardTitle>
                <CardDescription>
                  Información que aparecerá en tickets y configuración general.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <ConfigRow
              label="Nombre"
              value={config.nombre_negocio}
              editable={editableNegocio}
              icon={<Store className="h-4 w-4 text-muted-foreground" />}
              placeholder="Ej. Utilista Papelería"
              onChange={(value) => updateField("nombre_negocio", value)}
            />

            <ConfigRow
              label="Teléfono"
              value={config.telefono_negocio}
              editable={editableNegocio}
              icon={<Phone className="h-4 w-4 text-muted-foreground" />}
              placeholder="Ej. 3312345678"
              onChange={(value) => updateField("telefono_negocio", value)}
            />

            <ConfigRow
              label="Dirección"
              value={config.direccion_negocio}
              editable={editableNegocio}
              icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
              placeholder="Ej. Zapopan, Jalisco"
              onChange={(value) => updateField("direccion_negocio", value)}
            />

            <ConfigRow
              label="Mensaje ticket"
              value={config.mensaje_ticket}
              editable={editableNegocio}
              icon={
                <MessageSquareText className="h-4 w-4 text-muted-foreground" />
              }
              placeholder="Ej. Gracias por su compra"
              onChange={(value) => updateField("mensaje_ticket", value)}
            />

            <CardActions
              editable={editableNegocio}
              saving={saving}
              onEdit={() => setEditableNegocio(true)}
              onSave={guardarConfiguracion}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3">
                <BanknoteArrowUp className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Datos de transferencia
                </CardTitle>
                <CardDescription>
                  Datos bancarios para recibir transferencias.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <ConfigRow
              label="Cuenta / CLABE"
              value={config.numero_cuenta}
              editable={editableTransferencia}
              icon={<Hash className="h-4 w-4 text-muted-foreground" />}
              placeholder="Ej. 012345678901234567"
              onChange={(value) => updateField("numero_cuenta", value)}
            />

            <ConfigRow
              label="Banco"
              value={config.nombre_banco}
              editable={editableTransferencia}
              icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
              placeholder="Ej. BBVA"
              onChange={(value) => updateField("nombre_banco", value)}
            />

            <ConfigRow
              label="Titular"
              value={config.nombre_titular}
              editable={editableTransferencia}
              icon={<UserRound className="h-4 w-4 text-muted-foreground" />}
              placeholder="Nombre del titular"
              onChange={(value) => updateField("nombre_titular", value)}
            />

            <CardActions
              editable={editableTransferencia}
              saving={saving}
              onEdit={() => setEditableTransferencia(true)}
              onSave={guardarConfiguracion}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Pagos con terminal</CardTitle>
                <CardDescription>
                  Configura proveedor y comisión de cobro con tarjeta.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <ConfigRow
              label="Proveedor"
              value={config.proveedor_terminal}
              editable={editableTerminal}
              icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
              placeholder="Ej. Mercado Pago"
              onChange={(value) => updateField("proveedor_terminal", value)}
            />

            <ConfigRow
              label="Comisión (%)"
              value={config.comision_terminal}
              editable={editableTerminal}
              icon={<Percent className="h-4 w-4 text-muted-foreground" />}
              placeholder="Ej. 3.5"
              type="number"
              onChange={(value) => updateField("comision_terminal", value)}
            />

            <CardActions
              editable={editableTerminal}
              saving={saving}
              onEdit={() => setEditableTerminal(true)}
              onSave={guardarConfiguracion}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3">
                <Printer className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Impresión de ticket</CardTitle>
                <CardDescription>
                  Habilita o deshabilita la impresión de tickets.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-xl border bg-muted/20 px-4 py-3">
              <span className="text-sm font-semibold">Habilitar impresora</span>

              <Switch
                checked={config.habilitar_impresora}
                disabled={!editableImpresora}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({
                    ...prev,
                    habilitar_impresora: checked,
                    nombre_impresora: checked ? prev.nombre_impresora : "",
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Seleccione una impresora
              </label>

              <Select
                disabled={!editableImpresora || !config.habilitar_impresora}
                value={config.nombre_impresora}
                onValueChange={(value) =>
                  updateField("nombre_impresora", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione impresora..." />
                </SelectTrigger>

                <SelectContent
                  className="rounded-lg border border-border bg-background shadow-lg"
                  position="popper"
                >
                  {loadingImpresoras ? (
                    <SelectItem value="loading" disabled>
                      Cargando impresoras...
                    </SelectItem>
                  ) : impresoras.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      No se encontraron impresoras
                    </SelectItem>
                  ) : (
                    impresoras.map((impresora) => (
                      <SelectItem
                        key={impresora.nombre}
                        value={impresora.nombre}
                      >
                        {impresora.nombre}
                        {impresora.default ? " · Predeterminada" : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <CardActions
              editable={editableImpresora}
              saving={saving}
              onEdit={() => setEditableImpresora(true)}
              onSave={guardarConfiguracion}
              disabled={
                config.habilitar_impresora && !config.nombre_impresora.trim()
              }
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
        <Link
          href="/admin/configuracion/admin-categorias"
          className="flex w-full justify-center"
        >
          <span className="flex h-24 w-full flex-col items-center justify-center gap-4 rounded-xl border py-2 text-center transition-all duration-300 hover:bg-primary/90 hover:text-primary-foreground md:w-1/2">
            <LayoutGrid className="h-12 w-12" />
            <span className="text-xl font-semibold">
              Administración de Categorías
            </span>
          </span>
        </Link>

        <Link
          href="/admin/configuracion/usuarios"
          className="flex w-full justify-center"
        >
          <span className="flex h-24 w-full flex-col items-center justify-center gap-4 rounded-xl border text-center transition-all duration-300 hover:bg-primary/90 hover:text-primary-foreground md:w-1/2">
            <UserRoundCog className="h-12 w-12" />
            <span className="text-xl font-semibold">Administrar Usuarios</span>
          </span>
        </Link>
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
  type = "text",
  onChange,
}: {
  label: string
  value: string
  editable: boolean
  icon: React.ReactNode
  placeholder: string
  type?: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-2 xl:grid-cols-3 xl:items-center">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>

      <div className="xl:col-span-2">
        {!editable ? (
          <div className="flex min-h-9 items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm">
            {icon}
            <span className="truncate">{value || "Sin configurar"}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {icon}
            <Input
              type={type}
              value={value}
              placeholder={placeholder}
              onChange={(event) => onChange(event.target.value)}
              className="h-9"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function CardActions({
  editable,
  saving,
  disabled = false,
  onEdit,
  onSave,
}: {
  editable: boolean
  saving: boolean
  disabled?: boolean
  onEdit: () => void
  onSave: () => void
}) {
  return (
    <div className="flex justify-end gap-2 pt-4">
      {!editable ? (
        <Button variant="outline" className="rounded-xl" onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </Button>
      ) : (
        <Button
          className="rounded-xl"
          onClick={onSave}
          disabled={saving || disabled}
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Guardar
        </Button>
      )}
    </div>
  )
}
