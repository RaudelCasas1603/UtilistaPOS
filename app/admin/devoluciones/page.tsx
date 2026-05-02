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
    <div className="flex h-full min-h-0 flex-col overflow-hidden p-3 lg:p-4 xl:p-5">
      {/* HEADER */}
      <div className="shrink-0 space-y-2">
        <div>
          <h1 className="text-xl font-bold xl:text-2xl">
            Historial de devoluciones
          </h1>
          <p className="text-xs text-muted-foreground xl:text-sm">
            Revisa todas las devoluciones registradas.
          </p>
        </div>

        {/* CARDS COMPACTAS */}
        <div className="grid gap-2 sm:grid-cols-3">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="flex h-16 items-center justify-between p-3">
              <div>
                <p className="text-[11px] text-muted-foreground">
                  Total devoluciones
                </p>
                <p className="text-lg font-bold">{totalDevoluciones}</p>
              </div>
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="flex h-16 items-center justify-between p-3">
              <div>
                <p className="text-[11px] text-muted-foreground">
                  Monto acumulado
                </p>
                <p className="text-lg font-bold">
                  {formatCurrency(montoAcumulado)}
                </p>
              </div>
              <Wallet className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="flex h-16 items-center justify-between p-3">
              <div>
                <p className="text-[11px] text-muted-foreground">Página</p>
                <p className="text-lg font-bold">
                  {paginaSegura} / {totalPaginas}
                </p>
              </div>
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* TABLA */}
      <Card className="mt-3 flex min-h-0 flex-1 flex-col border-border/60 shadow-sm">
        {/* HEADER TABLA */}
        <CardHeader className="p-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-sm xl:text-base">
                Listado de devoluciones
              </CardTitle>
            </div>

            <div className="relative w-full lg:w-[320px]">
              <Search className="absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="h-9 pl-7 text-xs"
              />
            </div>
          </div>
        </CardHeader>

        {/* CONTENIDO */}
        <CardContent className="flex min-h-0 flex-1 flex-col gap-2 p-3 pt-0">
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center text-xs text-muted-foreground">
              Cargando devoluciones...
            </div>
          ) : error ? (
            <div className="text-xs text-red-500">{error}</div>
          ) : devolucionesFiltradas.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center text-xs text-muted-foreground">
              No hay devoluciones
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
                <div className="h-full overflow-x-hidden overflow-y-auto">
                  <Table className="w-full table-fixed text-xs">
                    <TableHeader className="bg-muted/40">
                      <TableRow className="h-8">
                        <TableHead className="w-[50px] px-2">ID</TableHead>
                        <TableHead className="w-[90px] px-2">Fecha</TableHead>
                        <TableHead className="w-[80px] px-2">Hora</TableHead>
                        <TableHead className="w-[90px] px-2">Venta</TableHead>
                        <TableHead className="w-[180px] px-2">
                          Cliente
                        </TableHead>
                        <TableHead className="px-2">Motivo</TableHead>
                        <TableHead className="w-[100px] px-2">Total</TableHead>
                        <TableHead className="w-[110px] px-2">
                          Estatus
                        </TableHead>
                        <TableHead className="w-[80px] px-2 text-right">
                          Ver
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {devolucionesPaginadas.map((d) => (
                        <TableRow key={d.id} className="h-9 hover:bg-muted/30">
                          <TableCell className="px-2 font-medium">
                            {d.id}
                          </TableCell>

                          <TableCell className="px-2">
                            {formatDate(d.fecha_hora)}
                          </TableCell>

                          <TableCell className="px-2">
                            {formatTime(d.fecha_hora)}
                          </TableCell>

                          <TableCell className="px-2">
                            {d.id_venta
                              ? `V-${String(d.id_venta).padStart(5, "0")}`
                              : "—"}
                          </TableCell>

                          <TableCell className="truncate px-2">
                            {d.cliente_nombre || "Cliente general"}
                          </TableCell>

                          <TableCell className="truncate px-2">
                            {d.motivo || "—"}
                          </TableCell>

                          <TableCell className="px-2 font-semibold">
                            {formatCurrency(d.total)}
                          </TableCell>

                          <TableCell className="px-2">
                            <Badge
                              className={`${getBadgeVariant(d.estatus)} px-2 py-0 text-[11px]`}
                            >
                              {d.estatus || "—"}
                            </Badge>
                          </TableCell>

                          <TableCell className="px-2 text-right">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 text-xs"
                            >
                              <Link href={`/admin/devoluciones/${d.id}`}>
                                <Eye className="h-3 w-3" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* PAGINACIÓN */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <p>
                  {desde} - {hasta} de {totalDevoluciones}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
                    disabled={paginaSegura === 1}
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>

                  <span>
                    {paginaSegura} / {totalPaginas}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      setPaginaActual((p) => Math.min(p + 1, totalPaginas))
                    }
                    disabled={paginaSegura === totalPaginas}
                  >
                    <ChevronRight className="h-3 w-3" />
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
