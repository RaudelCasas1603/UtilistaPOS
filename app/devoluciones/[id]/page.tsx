"use client"

import { use, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, ReceiptText, UserRound } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

type Props = {
  params: Promise<{ id: string }>
}

type Item = {
  id: number
  id_producto: number
  nombre: string
  codigo_producto: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  motivo?: string
}

type Devolucion = {
  id: number
  fecha_hora: string
  id_venta: number
  subtotal: number
  total: number
  motivo?: string
  estatus?: string
  cliente_nombre?: string
  cliente_telefono?: string
  cliente_correo?: string
  items: Item[]
}

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value))
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date))
}

export default function DevolucionDetallePage({ params }: Props) {
  const { id } = use(params)

  const [devolucion, setDevolucion] = useState<Devolucion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchDevolucion() {
      try {
        const res = await fetch(`${API_URL}/devoluciones/${id}`, {
          cache: "no-store",
        })

        if (!res.ok) throw new Error("Error al cargar devolución")

        const data = await res.json()
        setDevolucion(data)
      } catch (err) {
        setError("No se pudo cargar la devolución")
      } finally {
        setLoading(false)
      }
    }

    fetchDevolucion()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error || !devolucion) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || "Devolución no encontrada"}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Devolución #{devolucion.id}</h1>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-3 gap-4">
        {/* IZQUIERDA */}
        <div className="col-span-2 space-y-4">
          {/* INFO GENERAL */}
          <Card className="p-3">
            <CardContent className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Fecha</p>
                <p>{formatDate(devolucion.fecha_hora)}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Hora</p>
                <p>{formatTime(devolucion.fecha_hora)}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Venta</p>
                <p>V-{devolucion.id_venta}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Estatus</p>
                <Badge>{devolucion.estatus}</Badge>
              </div>

              <div className="col-span-2">
                <p className="text-muted-foreground">Motivo</p>
                <p>{devolucion.motivo || "—"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DERECHA (CLIENTE) */}
        <div>
          <Card className="p-2.5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRound className="h-4 w-4" />
                Cliente
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">
                {devolucion.cliente_nombre || "Cliente general"}
              </p>
              <p className="text-muted-foreground">
                {devolucion.cliente_telefono || "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* TICKET */}
      <Card className="flex h-[420px] w-full flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ReceiptText className="h-4 w-4" />
            Productos devueltos
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto text-sm">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="text-left">Producto</th>
                <th className="text-center">Cant</th>
                <th className="text-right">Precio</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>

            <tbody>
              {devolucion.items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="py-2">
                    <div className="font-medium">{item.nombre}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.codigo_producto}
                    </div>
                  </td>

                  <td className="text-center">{item.cantidad}</td>

                  <td className="text-right">
                    {formatCurrency(item.precio_unitario)}
                  </td>

                  <td className="text-right font-medium">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* RESUMEN */}
      <div className="flex justify-end">
        <Card className="w-[300px] p-3">
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(devolucion.subtotal)}</span>
            </div>

            <Separator />

            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatCurrency(devolucion.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
