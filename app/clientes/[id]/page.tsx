"use client"

import * as React from "react"
import clientsData from "../clientes.json"

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
  Phone,
  Mail,
  Ticket,
  ShoppingCart,
  Wallet,
  Percent,
  Clock3,
} from "lucide-react"

type Client = {
  id: number
  nombre: string
  telefono: string
  correo: string
  descuento: number
  referencia: string
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

function getMockPurchases(clientId: number): Purchase[] {
  const base = [
    { ticket: "TK-10482", fecha: "2026-04-03", hora: "09:14", total: 328.5 },
    { ticket: "TK-10471", fecha: "2026-04-02", hora: "18:42", total: 1290.0 },
    { ticket: "TK-10455", fecha: "2026-04-02", hora: "11:08", total: 214.0 },
    { ticket: "TK-10431", fecha: "2026-04-01", hora: "17:25", total: 860.0 },
    { ticket: "TK-10412", fecha: "2026-04-01", hora: "10:31", total: 145.5 },
    { ticket: "TK-10397", fecha: "2026-03-31", hora: "19:03", total: 432.0 },
    { ticket: "TK-10380", fecha: "2026-03-31", hora: "13:47", total: 119.0 },
    { ticket: "TK-10366", fecha: "2026-03-30", hora: "16:12", total: 980.0 },
  ]

  return base.map((item, index) => ({
    ...item,
    total: Number((item.total + clientId * (index + 1) * 1.7).toFixed(2)),
  }))
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

  const cliente = (clientsData as Client[]).find((c) => String(c.id) === id)

  const [editMode, setEditMode] = React.useState(false)
  const [showAlert, setShowAlert] = React.useState(false)

  React.useEffect(() => {
    if (!showAlert) return

    const timer = setTimeout(() => {
      setShowAlert(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [showAlert])

  if (!cliente) {
    return <div className="p-6">Cliente no encontrado</div>
  }

  const [formData, setFormData] = React.useState<Client>(cliente)

  const purchases = getMockPurchases(cliente.id)
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

  const handleChange = (field: keyof Client, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    setEditMode(false)
    setShowAlert(true)

    console.log("Datos del cliente guardados:", formData)
  }

  return (
    <div className="space-y-6 p-6">
      {showAlert && (
        <Alert className="border-green-400 bg-green-400">
          <CheckCircle2 className="h-4 w-4 text-green-800" />
          <AlertTitle className="text-green-800">Cambios guardados</AlertTitle>
          <AlertDescription className="text-green-800">
            La información del cliente se actualizó correctamente.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-3">
                  <UserRound className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Detalle del cliente
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Consulta y edita la información general del cliente.
                  </CardDescription>
                </div>
              </div>
            </div>

            {!editMode ? (
              <Button onClick={() => setEditMode(true)} className="gap-2">
                <Pencil className="h-5 w-5" />
                Editar
              </Button>
            ) : (
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-5 w-5" />
                Guardar
              </Button>
            )}
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Nombre
                </label>
                <Input
                  value={formData.nombre}
                  disabled={!editMode}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Teléfono
                </label>
                <Input
                  value={formData.telefono}
                  disabled={!editMode}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Correo
                </label>
                <Input
                  value={formData.correo}
                  disabled={!editMode}
                  onChange={(e) => handleChange("correo", e.target.value)}
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Descuento
                </label>
                <div className="relative">
                  <Percent className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.descuento}
                    disabled={!editMode}
                    onChange={(e) =>
                      handleChange("descuento", Number(e.target.value))
                    }
                    className="h-11 pl-9 text-base"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Referencia
                </label>
                <Input
                  value={formData.referencia}
                  disabled={!editMode}
                  onChange={(e) => handleChange("referencia", e.target.value)}
                  className="h-11 text-base"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-primary/10 p-3">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">
                  Compras recientes
                </p>
                <p className="text-2xl font-bold">{purchases.length}</p>
                <p className="text-xs text-muted-foreground">
                  Últimos movimientos registrados
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-primary/10 p-3">
                <Wallet className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Ticket promedio</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(ticketPromedio)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Basado en las últimas 8 compras
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-primary/10 p-3">
                <Clock3 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Frecuencia</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-2xl font-bold">{frecuenciaLabel}</p>
                  <Badge variant={frecuenciaVariant}>{frecuenciaLabel}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Compra más alta: {formatCurrency(compraMasAlta)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-xl font-bold">Últimas 8 compras</CardTitle>
          <CardDescription>
            Historial reciente del cliente con número de ticket, fecha, hora y
            total.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-5">
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader className="text-xl">
                <TableRow>
                  <TableHead className="w-[160px]">Ticket</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="text-md">
                {purchases.map((purchase) => (
                  <TableRow key={purchase.ticket}>
                    <TableCell className="font-medium">
                      {purchase.ticket}
                    </TableCell>
                    <TableCell>{formatDate(purchase.fecha)}</TableCell>
                    <TableCell>{purchase.hora}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(purchase.total)}
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
