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
    <div className="flex h-full min-h-0 flex-col space-y-3 overflow-hidden p-3 lg:p-4 xl:p-5">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold xl:text-2xl">
              Venta {venta.folio}
            </h1>
            <Badge
              variant={getBadgeVariantByStatus(venta.estatus)}
              className="px-2 py-0 text-[11px]"
            >
              {venta.estatus}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Detalle completo de la venta
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ReimprimirVentaButton ventaId={venta.id} />

          <MarcarDevolucionButton
            ventaId={venta.id}
            clienteId={venta.cliente.id}
            usuarioId={venta.usuarioId}
            items={venta.items}
          />

          <Button asChild size="sm" variant="outline">
            <Link href="/admin/historial-ventas">
              <ArrowLeft className="mr-1 h-3 w-3" />
              Volver
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid shrink-0 gap-3 xl:grid-cols-3">
        <Card className="flex min-h-[190px] flex-col border-border/60 shadow-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm">Información</CardTitle>
          </CardHeader>

          <CardContent className="grid flex-1 grid-cols-2 gap-2 p-3 pt-0 text-xs">
            <div className="rounded-lg border p-2">
              <p className="text-muted-foreground">Folio</p>
              <p className="font-semibold">{venta.folio}</p>
            </div>

            <div className="rounded-lg border p-2">
              <p className="text-muted-foreground">Fecha</p>
              <p className="font-semibold">{venta.fecha}</p>
            </div>

            <div className="rounded-lg border p-2">
              <p className="text-muted-foreground">Hora</p>
              <p className="font-semibold">{venta.hora}</p>
            </div>

            <div className="rounded-lg border p-2">
              <p className="text-muted-foreground">Estatus</p>
              <p className="font-semibold capitalize">{venta.estatus}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex min-h-[190px] flex-col border-border/60 shadow-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm">Cliente</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-2 p-3 pt-0 text-xs">
            <div className="rounded-lg border p-2">
              <p className="text-muted-foreground">Nombre</p>
              <p className="font-semibold">{venta.cliente.nombre}</p>
            </div>

            <div className="rounded-lg border p-2">
              <p className="text-muted-foreground">Teléfono</p>
              <p>{venta.cliente.telefono || "-"}</p>
            </div>

            <div className="rounded-lg border p-2">
              <p className="text-muted-foreground">Correo</p>
              <p className="break-all">{venta.cliente.correo || "-"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex min-h-[190px] flex-col border-border/60 shadow-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm">Resumen</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col justify-between p-3 pt-0 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(venta.subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Descuento</span>
                <span>{formatCurrency(venta.descuento)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Artículos</span>
                <span>{venta.totalArticulos}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Método</span>
                <span>{getMetodoPagoLabel(venta.metodoPago)}</span>
              </div>
            </div>

            <div className="flex justify-between border-t pt-2 text-sm font-bold">
              <span>Total</span>
              <span>{formatCurrency(venta.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex min-h-0 flex-1 flex-col border-border/60 shadow-sm">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm">Productos del ticket</CardTitle>
        </CardHeader>

        <CardContent className="min-h-0 flex-1 p-3 pt-0">
          <div className="h-full overflow-auto rounded-lg border">
            <Table className="text-xs">
              <TableHeader className="sticky top-0 z-10 bg-muted/40">
                <TableRow className="h-8">
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="w-[110px]">Código</TableHead>
                  <TableHead className="w-[70px] text-center">Cant.</TableHead>
                  <TableHead className="w-[100px] text-right">Precio</TableHead>
                  <TableHead className="w-[110px] text-right">
                    Importe
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {venta.items.length > 0 ? (
                  venta.items.map((item, i) => (
                    <TableRow key={item.id} className="h-9">
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="truncate font-medium">
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
        </CardContent>
      </Card>
    </div>
  )
}
