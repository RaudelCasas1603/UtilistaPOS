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
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
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

type EstadoCorte = "Cuadrado" | "Sobrante" | "Faltante"

type CorteCaja = {
  id: number
  folio: string
  fecha: string
  hora: string
  caja: string
  usuario: string
  ventasTotales: number
  efectivoContado: number
  diferencia: number
  estado: EstadoCorte
}

const cortesData: CorteCaja[] = [
  {
    id: 1,
    folio: "CC-20260401-001",
    fecha: "01/04/2026",
    hora: "09:15 PM",
    caja: "Caja principal",
    usuario: "Raudel Casas",
    ventasTotales: 18450.75,
    efectivoContado: 9816.25,
    diferencia: 0,
    estado: "Cuadrado",
  },
  {
    id: 2,
    folio: "CC-20260402-001",
    fecha: "02/04/2026",
    hora: "09:09 PM",
    caja: "Caja principal",
    usuario: "Raudel Casas",
    ventasTotales: 17230.5,
    efectivoContado: 9250,
    diferencia: 180,
    estado: "Sobrante",
  },
  {
    id: 3,
    folio: "CC-20260403-001",
    fecha: "03/04/2026",
    hora: "09:22 PM",
    caja: "Caja principal",
    usuario: "Andrea López",
    ventasTotales: 19640.3,
    efectivoContado: 10010,
    diferencia: -250.5,
    estado: "Faltante",
  },
  {
    id: 4,
    folio: "CC-20260404-001",
    fecha: "04/04/2026",
    hora: "09:18 PM",
    caja: "Caja 2",
    usuario: "Carlos Díaz",
    ventasTotales: 14320,
    efectivoContado: 7450,
    diferencia: 0,
    estado: "Cuadrado",
  },
  {
    id: 5,
    folio: "CC-20260405-001",
    fecha: "05/04/2026",
    hora: "09:11 PM",
    caja: "Caja principal",
    usuario: "Raudel Casas",
    ventasTotales: 21100.9,
    efectivoContado: 11035.2,
    diferencia: -95,
    estado: "Faltante",
  },
  {
    id: 6,
    folio: "CC-20260406-001",
    fecha: "06/04/2026",
    hora: "09:26 PM",
    caja: "Caja 2",
    usuario: "Mariana Torres",
    ventasTotales: 15890,
    efectivoContado: 8420,
    diferencia: 75,
    estado: "Sobrante",
  },
]

const formatoMoneda = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
})

function getEstadoBadgeClasses(estado: EstadoCorte) {
  switch (estado) {
    case "Cuadrado":
      return "border-transparent dark:bg-emerald-300 dark:text-emerald-700 bg-red-500 text-emerald-400"
    case "Sobrante":
      return "border-transparent dark:bg-amber-300 dark:text-amber-700 bg-amber-950/40 text-amber-400"
    case "Faltante":
      return "border-transparent dark:bg-red-300 dark:text-red-700 bg-red-950/40 text-red-400"
    default:
      return ""
  }
}

export default function CorteCajaPage() {
  const [search, setSearch] = React.useState("")
  const [estadoFiltro, setEstadoFiltro] = React.useState("todos")

  const dataFiltrada = React.useMemo(() => {
    return cortesData.filter((corte) => {
      const coincideBusqueda =
        corte.folio.toLowerCase().includes(search.toLowerCase()) ||
        corte.usuario.toLowerCase().includes(search.toLowerCase()) ||
        corte.caja.toLowerCase().includes(search.toLowerCase())

      const coincideEstado =
        estadoFiltro === "todos" ? true : corte.estado === estadoFiltro

      return coincideBusqueda && coincideEstado
    })
  }, [search, estadoFiltro])

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

  const ultimoCorte = dataFiltrada[0]

  const columns = React.useMemo<ColumnDef<CorteCaja>[]>(
    () => [
      {
        accessorKey: "folio",
        header: "Folio",
        cell: ({ row }) => (
          <div className="min-w-[170px] font-medium text-foreground">
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
        accessorKey: "caja",
        header: "Caja",
        cell: ({ row }) => (
          <div className="min-w-[130px]">{row.original.caja}</div>
        ),
      },
      {
        accessorKey: "usuario",
        header: "Usuario",
        cell: ({ row }) => (
          <div className="min-w-[150px]">{row.original.usuario}</div>
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
                  ? "text-emerald-400 dark:text-emerald-600"
                  : value > 0
                    ? "text-amber-400 dark:text-amber-600"
                    : "text-red-400 dark:text-red-500"
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
        header: "Estado",
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.01em] shadow-none ${getEstadoBadgeClasses(
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
                placeholder="Buscar por folio, caja o usuario..."
                className="pl-9"
              />
            </div>

            <div className="w-full lg:w-[220px]">
              <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border border-border bg-background shadow-lg">
                  <SelectItem value="todos">Todos los estados</SelectItem>
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
                {table.getRowModel().rows.length ? (
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
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
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
