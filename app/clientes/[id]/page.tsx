"use client"

import { useMemo, useState } from "react"
import {
  Pencil,
  Save,
  UserRound,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  ShoppingCart,
  Wallet,
  BadgeDollarSign,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const comprasIniciales = [
  { ticket: "TK-1048", fecha: "03/04/2026", hora: "09:12 AM", total: 245.5 },
  { ticket: "TK-1041", fecha: "02/04/2026", hora: "06:40 PM", total: 520.0 },
  { ticket: "TK-1033", fecha: "01/04/2026", hora: "01:15 PM", total: 189.0 },
  { ticket: "TK-1027", fecha: "30/03/2026", hora: "11:08 AM", total: 760.0 },
  { ticket: "TK-1019", fecha: "29/03/2026", hora: "04:28 PM", total: 315.0 },
  { ticket: "TK-1011", fecha: "28/03/2026", hora: "12:01 PM", total: 128.0 },
  { ticket: "TK-1004", fecha: "27/03/2026", hora: "05:55 PM", total: 420.0 },
  { ticket: "TK-0998", fecha: "26/03/2026", hora: "10:37 AM", total: 96.0 },
  { ticket: "TK-0991", fecha: "25/03/2026", hora: "03:22 PM", total: 285.0 },
  { ticket: "TK-0984", fecha: "24/03/2026", hora: "07:11 PM", total: 640.0 },
]

export default function ClienteDetallePage() {
  const [editMode, setEditMode] = useState(false)

  const [cliente, setCliente] = useState({
    id: 1,
    nombre: "Cliente general",
    telefono: "0000000000",
    correo: "general@cliente.com",
    descuento: 0,
    referencia: "Mostrador",
  })
  const ultimasCompras = comprasIniciales.slice(0, 8)

  const totalGastado = useMemo(
    () => comprasIniciales.reduce((acc, item) => acc + item.total, 0),
    []
  )

  const ticketPromedio = useMemo(
    () => totalGastado / comprasIniciales.length,
    [totalGastado]
  )

  const totalCompras = comprasIniciales.length

  const handleChange = (field: keyof typeof cliente, value: string) => {
    setCliente((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="flex h-full w-full flex-col gap-3 overflow-hidden p-3">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Detalle de cliente
          </h1>
          <p className="text-sm text-muted-foreground">
            Consulta la información general, actividad y últimas compras.
          </p>
        </div>

        <div className="w-full max-w-[210px]">
          {!editMode ? (
            <Button
              onClick={() => setEditMode(true)}
              className="h-11 w-full gap-2 text-sm font-semibold"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          ) : (
            <Button
              onClick={() => setEditMode(false)}
              className="h-11 w-full gap-2 text-sm font-semibold"
            >
              <Save className="h-4 w-4" />
              Guardar
            </Button>
          )}
        </div>
      </div>

      {/* Parte superior */}
      <div className="grid min-h-0 grid-cols-1 gap-3 xl:grid-cols-[2.2fr_1fr]">
        {/* Información del cliente */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserRound className="h-5 w-5" />
              Información del cliente
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* Nombre */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Nombre
                </Label>
                <Input
                  value={cliente.nombre}
                  disabled={!editMode}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  className="h-10 text-sm"
                />
              </div>

              {/* Correo */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Correo
                </Label>
                <Input
                  value={cliente.correo}
                  disabled={!editMode}
                  onChange={(e) => handleChange("correo", e.target.value)}
                  className="h-10 text-sm"
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Teléfono
                </Label>
                <Input
                  value={cliente.telefono}
                  disabled={!editMode}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                  className="h-10 text-sm"
                />
              </div>

              {/* Descuento */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Descuento (%)
                </Label>
                <Input
                  type="number"
                  value={cliente.descuento}
                  disabled={!editMode}
                  onChange={(e) =>
                    handleChange("descuento", Number(e.target.value))
                  }
                  className="h-10 text-sm"
                />
              </div>

              {/* Referencia */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Referencia
                </Label>
                <Input
                  value={cliente.referencia}
                  disabled={!editMode}
                  onChange={(e) => handleChange("referencia", e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas derechas */}
        <div className="flex h-full flex-col gap-3">
          <Card className="flex-1 rounded-2xl">
            <CardContent className="flex h-full flex-col justify-center p-4">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm font-medium">Compras registradas</span>
              </div>
              <p className="text-3xl leading-none font-bold">{totalCompras}</p>
            </CardContent>
          </Card>

          <Card className="flex-1 rounded-2xl">
            <CardContent className="flex h-full flex-col justify-center p-4">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <Wallet className="h-4 w-4" />
                <span className="text-sm font-medium">Total gastado</span>
              </div>
              <p className="text-3xl leading-none font-bold">
                $
                {totalGastado.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </CardContent>
          </Card>

          <Card className="flex-1 rounded-2xl">
            <CardContent className="flex h-full flex-col justify-center p-4">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <BadgeDollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Ticket promedio</span>
              </div>
              <p className="text-3xl leading-none font-bold">
                $
                {ticketPromedio.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabla inferior */}
      <Card className="min-h-0 flex-1 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">Últimas 8 compras</CardTitle>
        </CardHeader>

        <CardContent className="h-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-lg">Número de ticket</TableHead>
                <TableHead className="text-lg">Fecha</TableHead>
                <TableHead className="text-lg">Hora</TableHead>
                <TableHead className="text-right text-lg">Total</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {ultimasCompras.map((compra) => (
                <TableRow key={compra.ticket}>
                  <TableCell className="py-2 text-base font-medium">
                    {compra.ticket}
                  </TableCell>
                  <TableCell className="py-2 text-base">
                    {compra.fecha}
                  </TableCell>
                  <TableCell className="py-2 text-base">
                    {compra.hora}
                  </TableCell>
                  <TableCell className="py-2 text-right text-base font-semibold">
                    $
                    {compra.total.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
