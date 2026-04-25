import Link from "next/link"
import MarcarDevolucionButton from "./MarcarDevolucionButton"
import ReimprimirVentaButton from "./ReimprimiVentaButton"

import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  ReceiptText,
  UserRound,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Props = {
  params: Promise<{
    id: string
  }>
}

type VentaDetalle = {
  id: number
  folio: string
  fecha: string
  hora: string
  cliente: {
    id: number
    nombre: string
    telefono?: string
    correo?: string
  }
  usuario: string
  usuarioId: number
  metodoPago: "efectivo" | "tarjeta" | "transferencia"
  estatus: "finalizada" | "pendiente" | "cancelada"
  subtotal: number
  descuento: number
  total: number
  totalArticulos: number
  items: Array<{
    id: number
    idProducto: number
    producto: string
    codigo: string
    cantidad: number
    precioUnitario: number
    importe: number
  }>
}

type ApiVentaDetalle = {
  id: number
  folio?: string | null
  fecha_hora?: string | null
  id_cliente?: number | null
  id_usuario?: number | null
  subtotal?: number | string | null
  descuento?: number | string | null
  metodo_pago?: "efectivo" | "tarjeta" | "transferencia" | null
  total?: number | string | null
  total_articulos?: number | null
  estatus?: "finalizada" | "pendiente" | "cancelada" | null
  cliente_nombre?: string | null
  cliente_telefono?: string | null
  cliente_correo?: string | null
  items?: Array<{
    id: number
    id_producto?: number | null
    nombre?: string | null
    codigo_producto?: string | null
    cantidad?: number | string | null
    precio_unitario?: number | string | null
    descuento_unitario?: number | string | null
    subtotal?: number | string | null
  }>
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value)
}

function formatFecha(isoDate?: string | null) {
  if (!isoDate) return "-"

  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return "-"

  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

function formatHora(isoDate?: string | null) {
  if (!isoDate) return "-"

  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return "-"

  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}

function getMetodoPagoLabel(metodo: VentaDetalle["metodoPago"]) {
  switch (metodo) {
    case "efectivo":
      return "Efectivo"
    case "tarjeta":
      return "Tarjeta"
    case "transferencia":
      return "Transferencia"
    default:
      return metodo
  }
}

function getBadgeVariantByStatus(status: VentaDetalle["estatus"]) {
  switch (status) {
    case "finalizada":
      return "default"
    case "pendiente":
      return "secondary"
    case "cancelada":
      return "destructive"
    default:
      return "outline"
  }
}

async function getVentaById(id: string): Promise<VentaDetalle | null> {
  const res = await fetch(`${API_URL}/ventas/${id}`, {
    cache: "no-store",
  })

  if (res.status === 404) {
    return null
  }

  if (!res.ok) {
    throw new Error("No se pudo cargar la venta")
  }

  const venta: ApiVentaDetalle | null = await res.json()

  if (!venta) return null

  return {
    id: Number(venta.id ?? 0),
    folio:
      String(venta.folio ?? "").trim() ||
      `V-${String(venta.id ?? 0).padStart(5, "0")}`,
    fecha: formatFecha(venta.fecha_hora),
    hora: formatHora(venta.fecha_hora),
    cliente: {
      id: Number(venta.id_cliente ?? 0),
      nombre: String(venta.cliente_nombre ?? "Cliente general"),
      telefono: venta.cliente_telefono ?? "",
      correo: venta.cliente_correo ?? "",
    },
    usuario: venta.id_usuario ? `Usuario ${venta.id_usuario}` : "Sin usuario",
    usuarioId: Number(venta.id_usuario ?? 0),
    metodoPago: (venta.metodo_pago ?? "efectivo") as VentaDetalle["metodoPago"],
    estatus: (venta.estatus ?? "pendiente") as VentaDetalle["estatus"],
    subtotal: Number(venta.subtotal ?? 0),
    descuento: Number(venta.descuento ?? 0),
    total: Number(venta.total ?? 0),
    totalArticulos: Number(venta.total_articulos ?? 0),
    items: Array.isArray(venta.items)
      ? venta.items.map((item) => ({
          id: Number(item.id ?? 0),
          idProducto: Number(item.id_producto ?? 0),
          producto: String(item.nombre ?? "Producto"),
          codigo: String(item.codigo_producto ?? "-"),
          cantidad: Number(item.cantidad ?? 0),
          precioUnitario: Number(item.precio_unitario ?? 0),
          importe: Number(item.subtotal ?? 0),
        }))
      : [],
  }
}

export default async function VentaDetallePage({ params }: Props) {
  const { id } = await params
  const venta = await getVentaById(id)

  if (!venta) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/historial-ventas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al historial
          </Link>
        </Button>

        <Card className="rounded-2xl border-destructive/30">
          <CardHeader>
            <CardTitle>Venta no encontrada</CardTitle>
            <CardDescription>
              No existe una venta con el id #{id}.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Detalle de venta
            </h1>
            <Badge variant={getBadgeVariantByStatus(venta.estatus)}>
              {venta.estatus}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            Consulta completa de la venta {venta.folio}.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <ReimprimirVentaButton ventaId={venta.id} />

          <MarcarDevolucionButton
            ventaId={venta.id}
            clienteId={venta.cliente.id}
            usuarioId={venta.usuarioId}
            items={venta.items}
          />

          <Button asChild variant="outline">
            <Link href="/admin/historial-ventas">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al historial
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="w-full rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Información general</CardTitle>
                <CardDescription>Datos clave</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <div className="min-w-[110px] rounded-xl border px-4 py-2">
                    <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <ReceiptText className="h-3.5 w-3.5" />
                      Folio
                    </div>
                    <p className="text-base font-semibold">{venta.folio}</p>
                  </div>

                  <div className="min-w-[110px] rounded-xl border px-4 py-2">
                    <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Fecha
                    </div>
                    <p className="text-base font-semibold">{venta.fecha}</p>
                  </div>

                  <div className="min-w-[110px] rounded-xl border px-4 py-2">
                    <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Hora
                    </div>
                    <p className="text-base font-semibold">{venta.hora}</p>
                  </div>

                  <div className="min-w-[110px] rounded-xl border px-4 py-2">
                    <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <CreditCard className="h-3.5 w-3.5" />
                      Estatus
                    </div>
                    <p className="text-base font-semibold capitalize">
                      {venta.estatus}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="w-full rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Cliente</CardTitle>
                <CardDescription>Información del cliente</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="rounded-xl border px-4 py-3">
                    <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <UserRound className="h-3.5 w-3.5" />
                      Nombre
                    </div>
                    <p className="text-base font-semibold">
                      {venta.cliente.nombre}
                    </p>
                  </div>

                  <div className="rounded-xl border px-4 py-3">
                    <div className="mb-1 text-xs font-medium text-muted-foreground">
                      Teléfono
                    </div>
                    <p className="text-sm font-medium">
                      {venta.cliente.telefono || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border px-4 py-3">
                    <div className="mb-1 text-xs font-medium text-muted-foreground">
                      Correo
                    </div>
                    <p className="text-sm font-medium break-all">
                      {venta.cliente.correo || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="h-fit rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Resumen de la venta</CardTitle>
            <CardDescription>Totales y método de pago</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4 rounded-xl border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(venta.subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Descuento</span>
                <span className="font-medium">
                  {formatCurrency(venta.descuento)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Artículos</span>
                <span className="font-medium">{venta.totalArticulos}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Método de pago</span>
                <span className="font-medium">
                  {getMetodoPagoLabel(venta.metodoPago)}
                </span>
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(venta.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Contenido del ticket</CardTitle>
          <CardDescription>Productos incluidos en la venta</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border">
            <div className="max-h-[450px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead className="w-[70px]">#</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">P. unitario</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {venta.items.length > 0 ? (
                    venta.items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.producto}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.codigo}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.cantidad}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.precioUnitario)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.importe)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-10 text-center text-muted-foreground"
                      >
                        Esta venta no tiene productos cargados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
