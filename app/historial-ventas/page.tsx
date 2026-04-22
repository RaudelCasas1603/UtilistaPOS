"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  ReceiptText,
  Search,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type Venta = {
  id: number
  folio: string
  fecha: string
  hora: string
  cliente: string
  metodoPago: "efectivo" | "tarjeta" | "transferencia"
  totalArticulos: number
  total: number
  estatus: "finalizada" | "cancelada" | "pendiente"
}

const ventasDummy: Venta[] = [
  {
    id: 1,
    folio: "V-00001",
    fecha: "2026-04-01",
    hora: "09:15 AM",
    cliente: "Cliente general",
    metodoPago: "efectivo",
    totalArticulos: 3,
    total: 126.5,
    estatus: "finalizada",
  },
  {
    id: 2,
    folio: "V-00002",
    fecha: "2026-04-01",
    hora: "09:42 AM",
    cliente: "María López",
    metodoPago: "tarjeta",
    totalArticulos: 5,
    total: 248.0,
    estatus: "finalizada",
  },
  {
    id: 3,
    folio: "V-00003",
    fecha: "2026-04-01",
    hora: "10:10 AM",
    cliente: "Juan Pérez",
    metodoPago: "transferencia",
    totalArticulos: 2,
    total: 89.9,
    estatus: "pendiente",
  },
  {
    id: 4,
    folio: "V-00004",
    fecha: "2026-04-01",
    hora: "10:35 AM",
    cliente: "Cliente general",
    metodoPago: "efectivo",
    totalArticulos: 6,
    total: 310.0,
    estatus: "finalizada",
  },
  {
    id: 5,
    folio: "V-00005",
    fecha: "2026-04-01",
    hora: "11:00 AM",
    cliente: "Ana Torres",
    metodoPago: "tarjeta",
    totalArticulos: 1,
    total: 45.0,
    estatus: "finalizada",
  },
  {
    id: 6,
    folio: "V-00006",
    fecha: "2026-04-01",
    hora: "11:28 AM",
    cliente: "Luis Ramírez",
    metodoPago: "efectivo",
    totalArticulos: 8,
    total: 520.0,
    estatus: "cancelada",
  },
  {
    id: 7,
    folio: "V-00007",
    fecha: "2026-04-01",
    hora: "12:03 PM",
    cliente: "Cliente general",
    metodoPago: "transferencia",
    totalArticulos: 4,
    total: 172.4,
    estatus: "finalizada",
  },
  {
    id: 8,
    folio: "V-00008",
    fecha: "2026-04-01",
    hora: "12:50 PM",
    cliente: "Sofía Herrera",
    metodoPago: "tarjeta",
    totalArticulos: 7,
    total: 689.0,
    estatus: "finalizada",
  },
  {
    id: 9,
    folio: "V-00009",
    fecha: "2026-04-01",
    hora: "01:15 PM",
    cliente: "Cliente general",
    metodoPago: "efectivo",
    totalArticulos: 2,
    total: 78.0,
    estatus: "pendiente",
  },
  {
    id: 10,
    folio: "V-00010",
    fecha: "2026-04-01",
    hora: "01:40 PM",
    cliente: "Carlos Medina",
    metodoPago: "tarjeta",
    totalArticulos: 9,
    total: 845.6,
    estatus: "finalizada",
  },
  {
    id: 11,
    folio: "V-00011",
    fecha: "2026-04-02",
    hora: "09:05 AM",
    cliente: "Cliente general",
    metodoPago: "efectivo",
    totalArticulos: 2,
    total: 63.5,
    estatus: "finalizada",
  },
  {
    id: 12,
    folio: "V-00012",
    fecha: "2026-04-02",
    hora: "09:48 AM",
    cliente: "Fernanda Ruiz",
    metodoPago: "transferencia",
    totalArticulos: 3,
    total: 184.0,
    estatus: "finalizada",
  },
  {
    id: 13,
    folio: "V-00013",
    fecha: "2026-04-02",
    hora: "10:30 AM",
    cliente: "Cliente general",
    metodoPago: "tarjeta",
    totalArticulos: 5,
    total: 299.9,
    estatus: "cancelada",
  },
  {
    id: 14,
    folio: "V-00014",
    fecha: "2026-04-02",
    hora: "11:12 AM",
    cliente: "Roberto Díaz",
    metodoPago: "efectivo",
    totalArticulos: 4,
    total: 156.0,
    estatus: "finalizada",
  },
  {
    id: 15,
    folio: "V-00015",
    fecha: "2026-04-02",
    hora: "12:22 PM",
    cliente: "Cliente general",
    metodoPago: "tarjeta",
    totalArticulos: 10,
    total: 920.0,
    estatus: "finalizada",
  },
  {
    id: 16,
    folio: "V-00016",
    fecha: "2026-04-02",
    hora: "01:05 PM",
    cliente: "Daniela Cruz",
    metodoPago: "transferencia",
    totalArticulos: 1,
    total: 35.0,
    estatus: "pendiente",
  },
  {
    id: 17,
    folio: "V-00017",
    fecha: "2026-04-02",
    hora: "02:10 PM",
    cliente: "Cliente general",
    metodoPago: "efectivo",
    totalArticulos: 6,
    total: 410.5,
    estatus: "finalizada",
  },
  {
    id: 18,
    folio: "V-00018",
    fecha: "2026-04-02",
    hora: "03:20 PM",
    cliente: "Patricia Gómez",
    metodoPago: "tarjeta",
    totalArticulos: 3,
    total: 132.0,
    estatus: "finalizada",
  },
  {
    id: 19,
    folio: "V-00019",
    fecha: "2026-04-02",
    hora: "04:00 PM",
    cliente: "Cliente general",
    metodoPago: "efectivo",
    totalArticulos: 7,
    total: 560.75,
    estatus: "finalizada",
  },
  {
    id: 20,
    folio: "V-00020",
    fecha: "2026-04-02",
    hora: "04:45 PM",
    cliente: "Miguel Santos",
    metodoPago: "transferencia",
    totalArticulos: 2,
    total: 98.0,
    estatus: "cancelada",
  },
  {
    id: 21,
    folio: "V-00021",
    fecha: "2026-04-03",
    hora: "09:25 AM",
    cliente: "Cliente general",
    metodoPago: "tarjeta",
    totalArticulos: 5,
    total: 278.3,
    estatus: "finalizada",
  },
  {
    id: 22,
    folio: "V-00022",
    fecha: "2026-04-03",
    hora: "10:40 AM",
    cliente: "Laura Navarro",
    metodoPago: "efectivo",
    totalArticulos: 4,
    total: 149.0,
    estatus: "finalizada",
  },
  {
    id: 23,
    folio: "V-00023",
    fecha: "2026-04-03",
    hora: "11:18 AM",
    cliente: "Cliente general",
    metodoPago: "transferencia",
    totalArticulos: 2,
    total: 84.0,
    estatus: "pendiente",
  },
  {
    id: 24,
    folio: "V-00024",
    fecha: "2026-04-03",
    hora: "12:55 PM",
    cliente: "Andrea Flores",
    metodoPago: "tarjeta",
    totalArticulos: 8,
    total: 615.4,
    estatus: "finalizada",
  },
]

const ITEMS_PER_PAGE = 10

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value)
}

function getBadgeVariantByStatus(status: Venta["estatus"]) {
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

function getMetodoPagoLabel(method: Venta["metodoPago"]) {
  switch (method) {
    case "efectivo":
      return "Efectivo"
    case "tarjeta":
      return "Tarjeta"
    case "transferencia":
      return "Transferencia"
    default:
      return method
  }
}

export default function HistorialVentasPage() {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const ventasFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) return ventasDummy

    return ventasDummy.filter((venta) => {
      return (
        venta.folio.toLowerCase().includes(term) ||
        venta.cliente.toLowerCase().includes(term) ||
        venta.metodoPago.toLowerCase().includes(term) ||
        venta.estatus.toLowerCase().includes(term) ||
        String(venta.id).includes(term)
      )
    })
  }, [search])

  const totalPages = Math.ceil(ventasFiltradas.length / ITEMS_PER_PAGE)

  const ventasPaginadas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return ventasFiltradas.slice(start, end)
  }, [currentPage, ventasFiltradas])

  const totalVentas = useMemo(() => {
    return ventasFiltradas.reduce((acc, venta) => acc + venta.total, 0)
  }, [ventasFiltradas])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Historial de ventas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Revisa todas las ventas registradas y navega al detalle de cada una.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Total de ventas</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ReceiptText className="h-5 w-5" />
              {ventasFiltradas.length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Monto acumulado</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Wallet className="h-5 w-5" />
              {formatCurrency(totalVentas)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Página actual</CardDescription>
            <CardTitle className="text-2xl">
              {totalPages > 0 ? currentPage : 0} / {totalPages || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="gap-4">
          <div>
            <CardTitle>Listado de ventas</CardTitle>
            <CardDescription>
              Consulta rápida con búsqueda y paginación.
            </CardDescription>
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por folio, cliente, método o estatus..."
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Folio</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Método de pago</TableHead>
                  <TableHead>Artículos</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estatus</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {ventasPaginadas.length > 0 ? (
                  ventasPaginadas.map((venta) => (
                    <TableRow key={venta.id}>
                      <TableCell className="font-medium">{venta.id}</TableCell>
                      <TableCell>{venta.folio}</TableCell>
                      <TableCell>{venta.fecha}</TableCell>
                      <TableCell>{venta.hora}</TableCell>
                      <TableCell>{venta.cliente}</TableCell>
                      <TableCell>
                        {getMetodoPagoLabel(venta.metodoPago)}
                      </TableCell>
                      <TableCell>{venta.totalArticulos}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(venta.total)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariantByStatus(venta.estatus)}>
                          {venta.estatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/historial-ventas/${venta.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No se encontraron ventas con esa búsqueda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando{" "}
              <span className="font-medium text-foreground">
                {ventasPaginadas.length}
              </span>{" "}
              de{" "}
              <span className="font-medium text-foreground">
                {ventasFiltradas.length}
              </span>{" "}
              ventas
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1 || totalPages === 0}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Anterior
              </Button>

              <div className="rounded-md border px-3 py-1 text-sm font-medium">
                Página {totalPages > 0 ? currentPage : 0} de {totalPages || 0}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Siguiente
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
