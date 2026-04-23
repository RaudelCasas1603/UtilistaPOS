"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  Search,
  Eye,
  RotateCcw,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

type Devolucion = {
  id: number
  fecha_hora: string
  id_venta: number | null
  id_cliente: number | null
  id_usuario: number | null
  subtotal: number | string
  total: number | string
  motivo: string | null
  estatus: string | null
  created_at: string
  cliente_nombre?: string | null
}

const ITEMS_POR_PAGINA = 10

function formatCurrency(value: number | string | null | undefined) {
  const numberValue = Number(value || 0)

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(numberValue)
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "—"

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function formatTime(dateString: string | null | undefined) {
  if (!dateString) return "—"

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}

function getBadgeVariant(estatus: string | null | undefined) {
  const normalized = (estatus || "").toLowerCase()

  if (normalized === "finalizada") {
    return "bg-indigo-500 hover:bg-indigo-500 text-white"
  }

  if (normalized === "cancelada") {
    return "bg-red-500 hover:bg-red-500 text-white"
  }

  if (normalized === "pendiente") {
    return "bg-amber-500 hover:bg-amber-500 text-white"
  }

  return "bg-slate-500 hover:bg-slate-500 text-white"
}

export default function HistorialDevolucionesPage() {
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)

  useEffect(() => {
    let ignore = false

    async function fetchDevoluciones() {
      try {
        setLoading(true)
        setError("")

        const res = await fetch(`${API_URL}/devoluciones`, {
          cache: "no-store",
        })

        if (!res.ok) {
          throw new Error("No se pudieron cargar las devoluciones")
        }

        const data = await res.json()

        if (!ignore) {
          setDevoluciones(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Ocurrió un error al cargar las devoluciones"
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchDevoluciones()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    setPaginaActual(1)
  }, [search])

  const devolucionesFiltradas = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return devoluciones

    return devoluciones.filter((devolucion) => {
      const id = String(devolucion.id)
      const idVenta = String(devolucion.id_venta ?? "")
      const cliente = (devolucion.cliente_nombre || "").toLowerCase()
      const motivo = (devolucion.motivo || "").toLowerCase()
      const estatus = (devolucion.estatus || "").toLowerCase()
      const total = String(devolucion.total ?? "")

      return (
        id.includes(query) ||
        idVenta.includes(query) ||
        cliente.includes(query) ||
        motivo.includes(query) ||
        estatus.includes(query) ||
        total.includes(query)
      )
    })
  }, [devoluciones, search])

  const totalDevoluciones = devolucionesFiltradas.length

  const montoAcumulado = useMemo(() => {
    return devolucionesFiltradas.reduce((acc, devolucion) => {
      return acc + Number(devolucion.total || 0)
    }, 0)
  }, [devolucionesFiltradas])

  const totalPaginas = Math.max(
    1,
    Math.ceil(devolucionesFiltradas.length / ITEMS_POR_PAGINA)
  )

  const paginaSegura = Math.min(paginaActual, totalPaginas)

  const devolucionesPaginadas = useMemo(() => {
    const start = (paginaSegura - 1) * ITEMS_POR_PAGINA
    const end = start + ITEMS_POR_PAGINA
    return devolucionesFiltradas.slice(start, end)
  }, [devolucionesFiltradas, paginaSegura])

  const desde =
    totalDevoluciones === 0 ? 0 : (paginaSegura - 1) * ITEMS_POR_PAGINA + 1
  const hasta = Math.min(paginaSegura * ITEMS_POR_PAGINA, totalDevoluciones)

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Historial de devoluciones
        </h1>
        <p className="text-sm text-muted-foreground">
          Revisa todas las devoluciones registradas y navega al detalle de cada
          una.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-xl border bg-background p-3">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total de devoluciones
              </p>
              <p className="text-3xl font-bold">{totalDevoluciones}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-xl border bg-background p-3">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monto acumulado</p>
              <p className="text-3xl font-bold">
                {formatCurrency(montoAcumulado)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-xl border bg-background p-3">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Página actual</p>
              <p className="text-3xl font-bold">
                {paginaSegura} / {totalPaginas}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Listado de devoluciones</CardTitle>
          <p className="text-sm text-muted-foreground">
            Consulta rápida con búsqueda y paginación.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por id, venta, cliente, motivo o estatus."
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              Cargando devoluciones...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : devolucionesFiltradas.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              No se encontraron devoluciones.
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[70px]">ID</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Venta</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estatus</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {devolucionesPaginadas.map((devolucion) => (
                      <TableRow key={devolucion.id}>
                        <TableCell className="font-medium">
                          {devolucion.id}
                        </TableCell>

                        <TableCell>
                          {formatDate(devolucion.fecha_hora)}
                        </TableCell>

                        <TableCell>
                          {formatTime(devolucion.fecha_hora)}
                        </TableCell>

                        <TableCell>
                          {devolucion.id_venta
                            ? `V-${String(devolucion.id_venta).padStart(5, "0")}`
                            : "—"}
                        </TableCell>

                        <TableCell>
                          {devolucion.cliente_nombre || "Cliente general"}
                        </TableCell>

                        <TableCell className="max-w-[250px] truncate">
                          {devolucion.motivo || "Sin motivo"}
                        </TableCell>

                        <TableCell className="font-semibold">
                          {formatCurrency(devolucion.total)}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={getBadgeVariant(devolucion.estatus)}
                          >
                            {devolucion.estatus || "sin estatus"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <Link href={`/devoluciones/${devolucion.id}`}>
                              <Eye className="h-4 w-4" />
                              Ver detalles
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {hasta === 0 ? 0 : desde} a {hasta} de{" "}
                  {totalDevoluciones} devoluciones
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPaginaActual((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={paginaSegura === 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>

                  <div className="rounded-md border px-3 py-1.5 text-sm font-medium">
                    Página {paginaSegura} de {totalPaginas}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPaginaActual((prev) =>
                        Math.min(prev + 1, totalPaginas)
                      )
                    }
                    disabled={paginaSegura === totalPaginas}
                    className="gap-2"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
