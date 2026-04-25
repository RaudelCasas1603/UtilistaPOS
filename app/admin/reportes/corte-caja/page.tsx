"use client"

import * as React from "react"
import Link from "next/link"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  Loader2,
  Plus,
  Search,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

type EstadoCorte = "Cuadrado" | "Sobrante" | "Faltante"

type ApiCorteCaja = {
  id: number
  fecha_corte: string
  hora_corte: string
  fecha_hora_corte: string
  id_usuario: number
  total_ventas: string
  total_tarjeta: string
  total_transferencias: string
  total_efectivo: string
  total_devoluciones: string
  total_tickets: number
  saldo_inicial: string
  efectivo_esperado: string
  efectivo_contado: string
  diferencia: string
  monto_sobrante: string
  monto_faltante: string
  tipo_resultado: "cuadrado" | "sobrante" | "faltante"
  estado_corte: "abierto" | "cerrado"
  observaciones: string
  created_at: string
}

type CorteCaja = {
  id: number
  folio: string
  fecha: string
  hora: string
  usuario: string
  ventasTotales: number
  efectivoContado: number
  diferencia: number
  totalTickets: number
  estado: EstadoCorte
  estadoCorte: string
}

const formatoMoneda = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
})

function toNumber(value: string | number | null | undefined) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "Sin fecha"

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function formatTime(value: string) {
  const date = new Date(value)

  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  return "Sin hora"
}

function getEstadoLabel(tipo: ApiCorteCaja["tipo_resultado"]): EstadoCorte {
  if (tipo === "sobrante") return "Sobrante"
  if (tipo === "faltante") return "Faltante"
  return "Cuadrado"
}

function getEstadoBadgeClasses(estado: EstadoCorte) {
  switch (estado) {
    case "Cuadrado":
      return "border-transparent bg-emerald-100 text-emerald-700"
    case "Sobrante":
      return "border-transparent bg-amber-100 text-amber-700"
    case "Faltante":
      return "border-transparent bg-red-100 text-red-700"
    default:
      return ""
  }
}

function mapCorte(api: ApiCorteCaja): CorteCaja {
  const fechaBase = api.fecha_hora_corte || api.created_at || api.fecha_corte

  return {
    id: api.id,
    folio: `CC-${api.id.toString().padStart(5, "0")}`,
    fecha: formatDate(fechaBase),
    hora: formatTime(fechaBase),
    usuario: `Usuario ${api.id_usuario}`,
    ventasTotales: toNumber(api.total_ventas),
    efectivoContado: toNumber(api.efectivo_contado),
    diferencia: toNumber(api.diferencia),
    totalTickets: api.total_tickets ?? 0,
    estado: getEstadoLabel(api.tipo_resultado),
    estadoCorte: api.estado_corte,
  }
}

export default function CorteCajaPage() {
  const [cortes, setCortes] = React.useState<CorteCaja[]>([])
  const [search, setSearch] = React.useState("")
  const [estadoFiltro, setEstadoFiltro] = React.useState("todos")
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    async function fetchCortes() {
      try {
        setLoading(true)
        setError("")

        const res = await fetch(`${API_URL}/cortes-caja`, {
          cache: "no-store",
        })

        if (!res.ok) {
          throw new Error("No se pudieron cargar los cortes de caja")
        }

        const data: ApiCorteCaja[] = await res.json()
        setCortes(data.map(mapCorte))
      } catch (error) {
        console.error(error)
        setError("No se pudo conectar con el servidor.")
      } finally {
        setLoading(false)
      }
    }

    fetchCortes()
  }, [])

  const dataFiltrada = React.useMemo(() => {
    return cortes.filter((corte) => {
      const text = search.toLowerCase()

      const coincideBusqueda =
        corte.folio.toLowerCase().includes(text) ||
        corte.usuario.toLowerCase().includes(text) ||
        corte.estadoCorte.toLowerCase().includes(text)

      const coincideEstado =
        estadoFiltro === "todos" ? true : corte.estado === estadoFiltro

      return coincideBusqueda && coincideEstado
    })
  }, [cortes, search, estadoFiltro])

  const totalVentas = dataFiltrada.reduce(
    (acc, corte) => acc + corte.ventasTotales,
    0
  )

  const totalDiferencias = dataFiltrada.reduce(
    (acc, corte) => acc + corte.diferencia,
    0
  )

  const cortesCuadrados = dataFiltrada.filter(
    (corte) => corte.estado === "Cuadrado"
  ).length

  const columns = React.useMemo<ColumnDef<CorteCaja>[]>(
    () => [
      {
        accessorKey: "folio",
        header: "Folio",
        cell: ({ row }) => (
          <div className="min-w-[130px] font-medium text-foreground">
            {row.original.folio}
          </div>
        ),
      },
      {
        accessorKey: "fecha",
        header: "Fecha",
        cell: ({ row }) => (
          <div className="min-w-[120px] leading-tight">
            <p className="font-medium text-foreground">{row.original.fecha}</p>
            <p className="text-xs text-muted-foreground">{row.original.hora}</p>
          </div>
        ),
      },
      {
        accessorKey: "usuario",
        header: "Usuario",
        cell: ({ row }) => (
          <div className="min-w-[120px]">{row.original.usuario}</div>
        ),
      },
      {
        accessorKey: "totalTickets",
        header: () => <div className="text-center">Tickets</div>,
        cell: ({ row }) => (
          <div className="min-w-[80px] text-center font-medium">
            {row.original.totalTickets}
          </div>
        ),
      },
      {
        accessorKey: "ventasTotales",
        header: () => <div className="text-right">Ventas</div>,
        cell: ({ row }) => (
          <div className="min-w-[120px] text-right font-medium">
            {formatoMoneda.format(row.original.ventasTotales)}
          </div>
        ),
      },
      {
        accessorKey: "efectivoContado",
        header: () => <div className="text-right">Efectivo contado</div>,
        cell: ({ row }) => (
          <div className="min-w-[140px] text-right">
            {formatoMoneda.format(row.original.efectivoContado)}
          </div>
        ),
      },
      {
        accessorKey: "diferencia",
        header: () => <div className="text-right">Diferencia</div>,
        cell: ({ row }) => {
          const value = row.original.diferencia

          return (
            <div
              className={`min-w-[110px] text-right font-semibold ${
                value === 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : value > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-500 dark:text-red-400"
              }`}
            >
              {value > 0 ? "+" : ""}
              {formatoMoneda.format(value)}
            </div>
          )
        },
      },
      {
        accessorKey: "estado",
        header: "Resultado",
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-none ${getEstadoBadgeClasses(
              row.original.estado
            )}`}
          >
            {row.original.estado}
          </Badge>
        ),
      },
      {
        id: "acciones",
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => (
          <div className="flex min-w-[120px] justify-end">
            <Button asChild variant="outline" size="sm" className="h-9 gap-2">
              <Link href={`/admin/reportes/corte-caja/${row.original.id}`}>
                <Eye className="h-4 w-4" />
                Ver detalle
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: dataFiltrada,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Corte de caja</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulta el historial de cortes generados y crea nuevos cierres de
            caja.
          </p>
        </div>

        <Button asChild className="h-11 gap-2 px-5 text-sm font-semibold">
          <Link href="/admin/corte-caja">
            <Plus className="h-4 w-4" />
            Nuevo corte
          </Link>
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm font-medium text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Cortes registrados
              </p>
              <p className="mt-1 text-3xl font-bold">{dataFiltrada.length}</p>
            </div>
            <div className="rounded-2xl bg-muted p-3">
              <ClipboardList className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Ventas acumuladas</p>
              <p className="mt-1 text-3xl font-bold">
                {formatoMoneda.format(totalVentas)}
              </p>
            </div>
            <div className="rounded-2xl bg-muted p-3">
              <Wallet className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Cortes cuadrados</p>
              <p className="mt-1 text-3xl font-bold">{cortesCuadrados}</p>
            </div>
            <div className="rounded-2xl bg-muted p-3">
              <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Diferencia acumulada
              </p>
              <p
                className={`mt-1 text-3xl font-bold ${
                  totalDiferencias === 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : totalDiferencias > 0
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-500 dark:text-red-400"
                }`}
              >
                {totalDiferencias > 0 ? "+" : ""}
                {formatoMoneda.format(totalDiferencias)}
              </p>
            </div>
            <div className="rounded-2xl bg-muted p-3">
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-2xl">Historial de cortes</CardTitle>
            <CardDescription className="mt-1 text-sm">
              Revisa los cortes guardados y abre cualquiera para ver su detalle.
            </CardDescription>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por folio, usuario o estado..."
                className="pl-9"
              />
            </div>

            <div className="w-full lg:w-[220px]">
              <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por resultado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los resultados</SelectItem>
                  <SelectItem value="Cuadrado">Cuadrado</SelectItem>
                  <SelectItem value="Sobrante">Sobrante</SelectItem>
                  <SelectItem value="Faltante">Faltante</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border">
            <Table className="min-w-[1080px]">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-muted/30">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="h-12 px-4 text-xs font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-28 text-center"
                    >
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando cortes de caja...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/20">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="px-4 py-4 align-middle whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No se encontraron cortes con esos filtros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Página{" "}
              {table.getPageCount() === 0
                ? 0
                : table.getState().pagination.pageIndex + 1}{" "}
              de {table.getPageCount()}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
