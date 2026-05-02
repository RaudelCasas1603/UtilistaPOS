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
    <div className="flex h-full min-h-0 flex-col overflow-hidden p-3 lg:p-4 xl:p-5">
      <div className="shrink-0 space-y-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight xl:text-2xl">
            Historial de ventas
          </h1>
          <p className="text-xs text-muted-foreground xl:text-sm">
            Revisa ventas registradas y navega al detalle de cada una.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader className="p-3">
              <CardDescription className="text-[11px]">
                Total ventas
              </CardDescription>
              <CardTitle className="flex items-center gap-2 text-lg xl:text-xl">
                <ReceiptText className="h-4 w-4" />
                {loading ? "..." : ventasFiltradas.length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader className="p-3">
              <CardDescription className="text-[11px]">
                Monto acumulado
              </CardDescription>
              <CardTitle className="flex items-center gap-2 text-lg xl:text-xl">
                <Wallet className="h-4 w-4" />
                {loading ? "..." : formatCurrency(totalVentas)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader className="p-3">
              <CardDescription className="text-[11px]">
                Página actual
              </CardDescription>
              <CardTitle className="text-lg xl:text-xl">
                {loading
                  ? "..."
                  : `${totalPages > 0 ? currentPage : 0} / ${totalPages || 0}`}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      <Card className="mt-3 flex min-h-0 flex-1 flex-col rounded-xl border-border/60 shadow-sm">
        <CardHeader className="shrink-0 p-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-sm xl:text-base">
                Listado de ventas
              </CardTitle>
              <CardDescription className="text-xs">
                Consulta rápida con búsqueda y paginación.
              </CardDescription>
            </div>

            <div className="relative w-full lg:w-[340px]">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar venta..."
                className="h-9 pl-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-2 p-3 pt-0">
          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
            <div className="h-full overflow-x-hidden overflow-y-auto">
              <Table className="w-full table-fixed text-xs">
                <TableHeader className="sticky top-0 z-10 bg-muted/40">
                  <TableRow className="h-8">
                    <TableHead className="w-[40px] px-2 text-xs">ID</TableHead>
                    <TableHead className="w-[95px] px-2 text-xs">
                      Folio
                    </TableHead>
                    <TableHead className="w-[90px] px-2 text-xs">
                      Fecha
                    </TableHead>
                    <TableHead className="w-[80px] px-2 text-xs">
                      Hora
                    </TableHead>
                    <TableHead className="w-[210px] px-2 text-xs">
                      Cliente
                    </TableHead>
                    <TableHead className="hidden w-[120px] px-2 text-xs xl:table-cell">
                      Método
                    </TableHead>
                    <TableHead className="w-[70px] px-2 text-xs">
                      Art.
                    </TableHead>
                    <TableHead className="w-[95px] px-2 text-xs">
                      Total
                    </TableHead>
                    <TableHead className="w-[95px] px-2 text-xs">
                      Estatus
                    </TableHead>
                    <TableHead className="w-[65px] px-2 text-right text-xs">
                      Ver
                    </TableHead>
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
                      <TableRow
                        key={venta.id}
                        className="h-10 hover:bg-muted/30"
                      >
                        <TableCell className="px-2 font-medium">
                          {venta.id}
                        </TableCell>
                        <TableCell className="truncate px-2">
                          {venta.folio}
                        </TableCell>
                        <TableCell className="px-2">{venta.fecha}</TableCell>
                        <TableCell className="px-2">{venta.hora}</TableCell>
                        <TableCell className="truncate px-2">
                          {venta.cliente}
                        </TableCell>
                        <TableCell className="hidden truncate px-2 xl:table-cell">
                          {getMetodoPagoLabel(venta.metodoPago)}
                        </TableCell>
                        <TableCell className="px-2">
                          {venta.totalArticulos}
                        </TableCell>
                        <TableCell className="truncate px-2 font-semibold">
                          {formatCurrency(venta.total)}
                        </TableCell>
                        <TableCell className="px-2">
                          <Badge
                            variant={getBadgeVariantByStatus(venta.estatus)}
                            className="px-2 py-0 text-[11px]"
                          >
                            {venta.estatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-2 text-right">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs"
                          >
                            <Link href={`/admin/historial-ventas/${venta.id}`}>
                              <Eye className="h-3.5 w-3.5" />
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
          </div>

          <div className="flex shrink-0 items-center justify-between text-xs text-muted-foreground">
            <p>
              {ventasPaginadas.length} de {ventasFiltradas.length} ventas
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={goToPreviousPage}
                disabled={currentPage === 1 || totalPages === 0 || loading}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>

              <span>
                {totalPages > 0 ? currentPage : 0} / {totalPages || 0}
              </span>

              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={goToNextPage}
                disabled={
                  currentPage === totalPages || totalPages === 0 || loading
                }
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
