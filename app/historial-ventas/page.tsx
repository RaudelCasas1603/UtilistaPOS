"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  ReceiptText,
  Search,
  Wallet,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Venta = {
  id: number
  folio: string
  fecha: string
  hora: string
  cliente: string
  metodoPago: "efectivo" | "tarjeta" | "transferencia"
  totalArticulos: number
  total: number
  estatus: "finalizada" | "pendiente" | "cancelada"
}

type ApiVenta = {
  id: number
  folio: string
  fecha_hora: string
  cliente_nombre?: string | null
  metodo_pago: "efectivo" | "tarjeta" | "transferencia"
  total_articulos: number
  total: number | string
  estatus: "finalizada" | "pendiente" | "cancelada"
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
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

function formatFecha(isoDate: string) {
  const date = new Date(isoDate)

  if (Number.isNaN(date.getTime())) return "-"

  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

function formatHora(isoDate: string) {
  const date = new Date(isoDate)

  if (Number.isNaN(date.getTime())) return "-"

  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}

export default function HistorialVentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let ignore = false

    async function cargarVentas() {
      try {
        setLoading(true)
        setError("")

        const res = await fetch(`${API_URL}/ventas/finalizadas`, {
          cache: "no-store",
        })

        if (!res.ok) {
          throw new Error("No se pudieron cargar las ventas finalizadas")
        }

        const data: ApiVenta[] = await res.json()

        if (ignore) return

       const ventasMapeadas: Venta[] = data.map((venta) => ({
         id: Number(venta.id ?? 0),
         folio: String(
           venta.folio ?? `V-${String(venta.id ?? 0).padStart(5, "0")}`
         ),
         fecha: formatFecha(String(venta.fecha_hora ?? "")),
         hora: formatHora(String(venta.fecha_hora ?? "")),
         cliente: String(venta.cliente_nombre ?? "Cliente general"),
         metodoPago: (venta.metodo_pago ?? "efectivo") as Venta["metodoPago"],
         totalArticulos: Number(venta.total_articulos ?? 0),
         total: Number(venta.total ?? 0),
         estatus: (venta.estatus ?? "pendiente") as Venta["estatus"],
       }))

        setVentas(ventasMapeadas)
      } catch (err) {
        console.error("Error al cargar historial de ventas:", err)
        if (!ignore) {
          setError("No fue posible cargar el historial de ventas.")
          setVentas([])
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    cargarVentas()

    return () => {
      ignore = true
    }
  }, [])

  const ventasFiltradas = useMemo(() => {
  const term = search.trim().toLowerCase()

  if (!term) return ventas

  return ventas.filter((venta) => {
    const folio = String(venta.folio ?? "").toLowerCase()
    const cliente = String(venta.cliente ?? "").toLowerCase()
    const metodoPago = String(venta.metodoPago ?? "").toLowerCase()
    const estatus = String(venta.estatus ?? "").toLowerCase()
    const id = String(venta.id ?? "")

    return (
      folio.includes(term) ||
      cliente.includes(term) ||
      metodoPago.includes(term) ||
      estatus.includes(term) ||
      id.includes(term)
    )
  })
}, [ventas, search])

  const totalPages = Math.ceil(ventasFiltradas.length / ITEMS_PER_PAGE)

  const ventasPaginadas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return ventasFiltradas.slice(start, end)
  }, [currentPage, ventasFiltradas])

  const totalVentas = useMemo(() => {
    return ventas
      .filter((venta) => venta.estatus === "finalizada")
      .reduce((acc, venta) => acc + venta.total, 0)
  }, [ventas])

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
              {loading ? "..." : ventasFiltradas.length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Monto acumulado</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Wallet className="h-5 w-5" />
              {loading ? "..." : formatCurrency(totalVentas)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Página actual</CardDescription>
            <CardTitle className="text-2xl">
              {loading
                ? "..."
                : `${totalPages > 0 ? currentPage : 0} / ${totalPages || 0}`}
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
              placeholder="Buscar por folio, cliente, método o estatus."
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
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Cargando ventas...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="py-10 text-center text-destructive"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                ) : ventasPaginadas.length > 0 ? (
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
                disabled={currentPage === 1 || totalPages === 0 || loading}
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
                disabled={
                  currentPage === totalPages || totalPages === 0 || loading
                }
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
