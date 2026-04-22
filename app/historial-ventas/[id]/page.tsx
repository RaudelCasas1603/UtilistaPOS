import Link from "next/link"
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
  }
  usuario: string
  metodoPago: "efectivo" | "tarjeta" | "transferencia"
  estatus: "finalizada" | "pendiente" | "cancelada"
  subtotal: number
  descuento: number
  total: number
  totalArticulos: number
  items: Array<{
    id: number
    producto: string
    codigo: string
    cantidad: number
    precioUnitario: number
    importe: number
  }>
}

const ventasDummy: VentaDetalle[] = [
  {
    id: 1,
    folio: "V-00001",
    fecha: "2026-04-21",
    hora: "11:24 AM",
    cliente: {
      id: 1,
      nombre: "Cliente general",
    },
    usuario: "Administrador",
    metodoPago: "efectivo",
    estatus: "finalizada",
    subtotal: 86,
    descuento: 0,
    total: 86,
    totalArticulos: 2,
    items: [
      {
        id: 1,
        producto: "Libreta francesa cuadro 100 hojas",
        codigo: "P005",
        cantidad: 2,
        precioUnitario: 43,
        importe: 86,
      },
      {
        id: 2,
        producto: "Lápiz mirado HB",
        codigo: "P014",
        cantidad: 1,
        precioUnitario: 18,
        importe: 18,
      },
      {
        id: 3,
        producto: "Borrador blanco",
        codigo: "P018",
        cantidad: 2,
        precioUnitario: 9,
        importe: 18,
      },
    ],
  },
  {
    id: 2,
    folio: "V-00002",
    fecha: "2026-04-21",
    hora: "12:10 PM",
    cliente: {
      id: 2,
      nombre: "María López",
    },
    usuario: "Cajero 1",
    metodoPago: "tarjeta",
    estatus: "finalizada",
    subtotal: 248,
    descuento: 18,
    total: 230,
    totalArticulos: 5,
    items: [
      {
        id: 1,
        producto: "Cuaderno profesional raya",
        codigo: "P010",
        cantidad: 2,
        precioUnitario: 52,
        importe: 104,
      },
      {
        id: 2,
        producto: "Pluma tinta azul",
        codigo: "P021",
        cantidad: 3,
        precioUnitario: 48,
        importe: 144,
      },
    ],
  },
  {
    id: 3,
    folio: "V-00003",
    fecha: "2026-04-21",
    hora: "01:45 PM",
    cliente: {
      id: 3,
      nombre: "Juan Pérez",
    },
    usuario: "Administrador",
    metodoPago: "transferencia",
    estatus: "pendiente",
    subtotal: 150,
    descuento: 0,
    total: 150,
    totalArticulos: 3,
    items: [
      {
        id: 1,
        producto: "Resaltador amarillo",
        codigo: "P032",
        cantidad: 3,
        precioUnitario: 50,
        importe: 150,
      },
    ],
  },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value)
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

export default async function VentaDetallePage({ params }: Props) {
  const { id } = await params

  const venta = ventasDummy.find((item) => item.id === Number(id))

  if (!venta) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/ventas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al historial
          </Link>
        </Button>

        <Card className="rounded-2xl border-destructive/30">
          <CardHeader>
            <CardTitle>Venta no encontrada</CardTitle>
            <CardDescription>
              No existe una venta con el id #{id} en la data dummy.
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

        <Button asChild variant="outline">
          <Link href="/ventas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al historial
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Información general</CardTitle>
            <CardDescription>Datos clave</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-3">
              <div className="min-w-[110px] rounded-xl border px-4 py-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <ReceiptText className="h-3.5 w-3.5" />
                  Folio
                </div>
                <p className="text-base font-semibold">{venta.folio}</p>
              </div>

              <div className="min-w-[110px] rounded-xl border px-4 py-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Fecha
                </div>
                <p className="text-base font-semibold">{venta.fecha}</p>
                <p className="text-xs text-muted-foreground">{venta.hora}</p>
              </div>

              <div className="min-w-[110px] rounded-xl border px-4 py-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <CreditCard className="h-3.5 w-3.5" />
                  Pago
                </div>
                <p className="text-base font-semibold">
                  {getMetodoPagoLabel(venta.metodoPago)}
                </p>
              </div>

              <div className="min-w-[110px] rounded-xl border px-4 py-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Wallet className="h-3.5 w-3.5" />
                  Total
                </div>
                <p className="text-base font-semibold">
                  {formatCurrency(venta.total)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cliente</CardTitle>
            <CardDescription>Resumen</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="rounded-xl border px-4 py-3">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <UserRound className="h-3.5 w-3.5" />
                Nombre
              </div>
              <p className="text-base font-semibold">{venta.cliente.nombre}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {/* TABLA FULL WIDTH */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Contenido del ticket</CardTitle>
            <CardDescription>Artículos incluidos en esta venta</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="rounded-xl border">
              <div className="max-h-[460px] overflow-auto">
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
                    {venta.items.map((item, index) => (
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RESUMEN ABAJO A LA DERECHA */}
        <div className="flex justify-end">
          <Card className="w-full max-w-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Resumen de venta</CardTitle>
              <CardDescription>Totales del ticket</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-3 rounded-xl border p-4">
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

              <div className="mt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/historial-ventas">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al historial
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
