"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Pencil,
  Save,
  CheckCircle2,
  UserRound,
  ShoppingCart,
  Wallet,
  Percent,
  Clock3,
  Loader2,
} from "lucide-react"

type EstatusCliente = "activo" | "inactivo"

type ClientApi = {
  id: number
  nombre: string
  telefono: string
  correo: string
  descuento: number | string
  referencia: string
  estatus?: EstatusCliente | string
  created_at?: string
  updated_at?: string
}

type Client = {
  id: number
  nombre: string
  telefono: string
  correo: string
  descuento: number
  referencia: string
  estatus: EstatusCliente
}

type PurchaseApi = {
  id: number
  ticket: string
  fecha_hora: string
  total: number | string
}

type Purchase = {
  ticket: string
  fecha: string
  hora: string
  total: number
}

type Props = {
  params: Promise<{
    id: string
  }>
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const ENDPOINTS = {
  getById: (id: string | number) => `${API_BASE}/api/clientes/${id}`,
  update: (id: string | number) => `${API_BASE}/api/clientes/${id}`,
  purchases: (id: string | number) => `${API_BASE}/api/clientes/${id}/ventas`,
}

function normalizeEstatus(value: unknown): EstatusCliente {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (normalized === "activo" || normalized === "inactivo") {
      return normalized
    }
  }
  return "activo"
}

function normalizeClient(item: ClientApi): Client {
  return {
    id: Number(item.id),
    nombre: item.nombre ?? "",
    telefono: item.telefono ?? "",
    correo: item.correo ?? "",
    descuento: Number(item.descuento ?? 0),
    referencia: item.referencia ?? "",
    estatus: normalizeEstatus(item.estatus),
  }
}

function normalizePurchase(item: PurchaseApi): Purchase {
  const fechaObj = new Date(item.fecha_hora)

  return {
    ticket: item.ticket ?? "",
    fecha: fechaObj.toISOString().split("T")[0],
    hora: fechaObj.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    total: Number(item.total ?? 0),
  }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  })

  if (!response.ok) {
    let message = `Error ${response.status} en ${url}`

    try {
      const errorData = await response.json()
      message =
        errorData?.message || errorData?.error || errorData?.detalle || message
    } catch {
      try {
        const text = await response.text()
        if (text) message = `${message} - ${text}`
      } catch {}
    }

    throw new Error(message)
  }

  return response.json()
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value)
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`))
}

export default function ClienteDetallePage({ params }: Props) {
  const { id } = React.use(params)

  const [cliente, setCliente] = React.useState<Client | null>(null)
  const [formData, setFormData] = React.useState<Client | null>(null)

  const [purchases, setPurchases] = React.useState<Purchase[]>([])
  const [loadingPurchases, setLoadingPurchases] = React.useState(true)

  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState("")
  const [editMode, setEditMode] = React.useState(false)
  const [showAlert, setShowAlert] = React.useState(false)

  React.useEffect(() => {
    const cargarCliente = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetchJson<ClientApi>(ENDPOINTS.getById(id))
        const clienteNormalizado = normalizeClient(response)

        setCliente(clienteNormalizado)
        setFormData(clienteNormalizado)
      } catch (error) {
        console.error("Error al obtener cliente:", error)
        setError(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el cliente."
        )
      } finally {
        setLoading(false)
      }
    }

    cargarCliente()
  }, [id])

  React.useEffect(() => {
    const cargarVentas = async () => {
      try {
        setLoadingPurchases(true)

        const response = await fetchJson<PurchaseApi[]>(ENDPOINTS.purchases(id))
        const ventasNormalizadas = response.map(normalizePurchase)

        setPurchases(ventasNormalizadas)
      } catch (error) {
        console.error("Error al obtener ventas del cliente:", error)
        setPurchases([])
      } finally {
        setLoadingPurchases(false)
      }
    }

    cargarVentas()
  }, [id])

  React.useEffect(() => {
    if (!showAlert) return

    const timer = setTimeout(() => {
      setShowAlert(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [showAlert])

  const handleChange = (field: keyof Client, value: string | number) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : prev
    )
  }

  const handleSave = async () => {
    if (!formData) return

    try {
      setSaving(true)

      const payload = {
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        correo: formData.correo.trim(),
        descuento: Number(formData.descuento) || 0,
        referencia: formData.referencia.trim(),
        estatus: formData.estatus,
      }

      const response = await fetchJson<ClientApi>(
        ENDPOINTS.update(formData.id),
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      )

      const actualizado = normalizeClient(response)

      setCliente(actualizado)
      setFormData(actualizado)
      setEditMode(false)
      setShowAlert(true)

      console.log("Datos del cliente guardados:", actualizado)
    } catch (error) {
      console.error("Error al actualizar cliente:", error)
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el cliente."
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando cliente...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-950 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      </div>
    )
  }

  if (!cliente || !formData) {
    return <div className="p-6">Cliente no encontrado</div>
  }

  const totalComprado = purchases.reduce((acc, item) => acc + item.total, 0)
  const ticketPromedio = purchases.length ? totalComprado / purchases.length : 0
  const compraMasAlta = purchases.length
    ? Math.max(...purchases.map((item) => item.total))
    : 0

  const frecuenciaLabel =
    purchases.length >= 7 ? "Alta" : purchases.length >= 4 ? "Media" : "Baja"

  const frecuenciaVariant =
    frecuenciaLabel === "Alta"
      ? "default"
      : frecuenciaLabel === "Media"
        ? "secondary"
        : "outline"

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden p-3 lg:p-4 xl:p-5">
      {showAlert && (
        <Alert className="border-green-400 bg-green-400">
          <CheckCircle2 className="h-4 w-4 text-green-800" />
          <AlertTitle className="text-green-800">Cambios guardados</AlertTitle>
          <AlertDescription className="text-green-800">
            La información del cliente se actualizó correctamente.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_280px]">
        {/* INFO CLIENTE */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between xl:p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-primary/10 p-2">
                <UserRound className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base xl:text-lg">
                  Detalle del cliente
                </CardTitle>
                <CardDescription className="text-xs">
                  Consulta y edita la información
                </CardDescription>
              </div>
            </div>

            {!editMode ? (
              <Button size="sm" onClick={() => setEditMode(true)}>
                <Pencil className="mr-1 h-4 w-4" />
                Editar
              </Button>
            ) : (
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-1 h-4 w-4" />
                )}
                Guardar
              </Button>
            )}
          </CardHeader>

          <CardContent className="p-3 xl:p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Input
                value={formData.nombre}
                disabled={!editMode}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className="h-9 text-sm"
                placeholder="Nombre"
              />

              <Input
                value={formData.telefono}
                disabled={!editMode}
                onChange={(e) => handleChange("telefono", e.target.value)}
                className="h-9 text-sm"
                placeholder="Teléfono"
              />

              <Input
                value={formData.correo}
                disabled={!editMode}
                onChange={(e) => handleChange("correo", e.target.value)}
                className="h-9 text-sm"
                placeholder="Correo"
              />

              <div className="relative">
                <Percent className="absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  value={formData.descuento}
                  disabled={!editMode}
                  onChange={(e) =>
                    handleChange("descuento", Number(e.target.value))
                  }
                  className="h-9 pl-7 text-sm"
                  placeholder="Descuento"
                />
              </div>

              <Input
                value={formData.referencia}
                disabled={!editMode}
                onChange={(e) => handleChange("referencia", e.target.value)}
                className="h-9 text-sm md:col-span-2"
                placeholder="Referencia"
              />
            </div>
          </CardContent>
        </Card>

        {/* CARDS LATERALES */}
        <div className="grid gap-2">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="flex items-center gap-2 p-3">
              <ShoppingCart className="h-4 w-4" />
              <div>
                <p className="text-[11px] text-muted-foreground">Compras</p>
                <p className="text-lg font-bold">{purchases.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="flex items-center gap-2 p-3">
              <Wallet className="h-4 w-4" />
              <div>
                <p className="text-[11px] text-muted-foreground">
                  Ticket prom.
                </p>
                <p className="text-lg font-bold">
                  {formatCurrency(ticketPromedio)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="flex items-center gap-2 p-3">
              <Clock3 className="h-4 w-4" />
              <div>
                <p className="text-[11px] text-muted-foreground">Frecuencia</p>
                <p className="text-lg font-bold">{frecuenciaLabel}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* TABLA */}
      <Card className="mt-3 flex min-h-0 flex-1 flex-col border-border/60 shadow-sm">
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-semibold">
            Últimas compras
          </CardTitle>
        </CardHeader>

        <CardContent className="min-h-0 flex-1 p-3 pt-0">
          <div className="h-full overflow-auto rounded-lg border">
            <Table className="text-xs">
              <TableHeader className="bg-muted/40">
                <TableRow className="h-8">
                  <TableHead>Ticket</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {purchases.map((p) => (
                  <TableRow key={p.ticket} className="h-9">
                    <TableCell>{p.ticket}</TableCell>
                    <TableCell>{formatDate(p.fecha)}</TableCell>
                    <TableCell>{p.hora}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(p.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
