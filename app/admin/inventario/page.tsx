"use client"

import * as React from "react"
import Link from "next/link"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"

import {
  ArrowUpDown,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldAlert,
  Warehouse,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

type ProductInventory = {
  id: number
  id_producto: number
  codigo_producto: string | null
  codigo_barras: string | null
  nombre: string | null
  precio: number | string | null
  costo: number | string | null
  precio_publico: number | string | null
  stock_actual: number
  stock_minimo: number
  stock_deseado: number
}

function safeText(value: unknown) {
  return String(value ?? "").toLowerCase()
}

function getInventoryStatus(product: ProductInventory) {
  const stockActual = Number(product.stock_actual ?? 0)
  const stockMinimo = Number(product.stock_minimo ?? 0)

  if (stockActual === 0) {
    return {
      label: "Agotado",
      className: "bg-red-500/10 text-red-600 dark:text-red-400",
      rowClassName: "bg-red-500/5",
    }
  }

  if (stockActual < stockMinimo) {
    return {
      label: "Stock bajo",
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      rowClassName: "bg-amber-500/5",
    }
  }

  return {
    label: "Óptimo",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    rowClassName: "",
  }
}

export default function InventarioPage() {
  const [data, setData] = React.useState<ProductInventory[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  React.useEffect(() => {
    const fetchInventario = async () => {
      try {
        setLoading(true)
        setError("")

        const res = await fetch(`${API_URL}/inventario`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        })

        if (!res.ok) {
          throw new Error("No se pudo obtener el inventario")
        }

        const result = await res.json()
        setData(Array.isArray(result) ? result : [])
      } catch (err) {
        console.error(err)
        setError("Ocurrió un error al cargar el inventario.")
      } finally {
        setLoading(false)
      }
    }

    fetchInventario()
  }, [])

  const columns = React.useMemo<ColumnDef<ProductInventory>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.id}</span>
        ),
      },
      {
        accessorKey: "codigo_producto",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Código
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-xs xl:text-sm">
            {row.original.codigo_producto || "Sin código"}
          </span>
        ),
      },
      {
        accessorKey: "codigo_barras",
        header: "Barras",
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.codigo_barras || "Sin barras"}
          </span>
        ),
      },
      {
        accessorKey: "nombre",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Producto
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground xl:text-sm">
              {row.original.nombre || "Sin nombre"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {row.original.codigo_barras || "Sin código de barras"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "stock_actual",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Actual
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => {
          const stock = Number(row.original.stock_actual ?? 0)
          const status = getInventoryStatus(row.original)

          return (
            <span
              className={[
                "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                status.className,
              ].join(" ")}
            >
              {stock} pzs
            </span>
          )
        },
      },
      {
        accessorKey: "stock_minimo",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Mín.
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-xs font-medium text-muted-foreground xl:text-sm">
            {Number(row.original.stock_minimo ?? 0)} pzs
          </span>
        ),
      },
      {
        accessorKey: "stock_deseado",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Deseado
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-xs font-medium text-foreground xl:text-sm">
            {Number(row.original.stock_deseado ?? 0)} pzs
          </span>
        ),
      },
      {
        id: "faltante",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Reponer
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        accessorFn: (row) =>
          Math.max(
            Number(row.stock_deseado ?? 0) - Number(row.stock_actual ?? 0),
            0
          ),
        cell: ({ row }) => {
          const faltante = Math.max(
            Number(row.original.stock_deseado ?? 0) -
              Number(row.original.stock_actual ?? 0),
            0
          )

          return (
            <span className="text-xs font-semibold text-primary xl:text-sm">
              {faltante} pzs
            </span>
          )
        },
      },
      {
        id: "estado",
        header: "Estado",
        cell: ({ row }) => {
          const status = getInventoryStatus(row.original)

          return (
            <span
              className={[
                "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                status.className,
              ].join(" ")}
            >
              {status.label}
            </span>
          )
        },
      },
      {
        id: "acciones",
        header: "Detalle",
        cell: ({ row }) => {
          const product = row.original

          return (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
            >
              <Link href={`/admin/inventario/${product.id}`}>Ver</Link>
            </Button>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = safeText(filterValue)

      return (
        safeText(row.original.id).includes(search) ||
        safeText(row.original.id_producto).includes(search) ||
        safeText(row.original.codigo_producto).includes(search) ||
        safeText(row.original.codigo_barras).includes(search) ||
        safeText(row.original.nombre).includes(search) ||
        safeText(row.original.stock_actual).includes(search) ||
        safeText(row.original.stock_minimo).includes(search) ||
        safeText(row.original.stock_deseado).includes(search)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  })

  const totalProductos = data.length
  const stockTotal = data.reduce(
    (acc, item) => acc + Number(item.stock_actual ?? 0),
    0
  )
  const agotados = data.filter(
    (item) => Number(item.stock_actual ?? 0) === 0
  ).length
  const bajoMinimo = data.filter(
    (item) =>
      Number(item.stock_actual ?? 0) > 0 &&
      Number(item.stock_actual ?? 0) < Number(item.stock_minimo ?? 0)
  ).length

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden p-3 lg:p-4 xl:p-5">
      <div className="shrink-0 space-y-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground xl:text-2xl">
            Inventario
          </h1>
          <p className="text-xs text-muted-foreground xl:text-sm">
            Supervisa existencias, mínimos y reabasto de tus productos.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="flex h-16 items-center justify-between gap-2 p-3 xl:h-20 xl:p-4">
              <div className="min-w-0">
                <p className="truncate text-[11px] text-muted-foreground xl:text-sm">
                  Productos
                </p>
                <p className="mt-0.5 text-lg font-bold xl:text-2xl">
                  {totalProductos}
                </p>
              </div>
              <Boxes className="h-5 w-5 shrink-0 text-muted-foreground xl:h-7 xl:w-7" />
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="flex h-16 items-center justify-between gap-2 p-3 xl:h-20 xl:p-4">
              <div className="min-w-0">
                <p className="truncate text-[11px] text-muted-foreground xl:text-sm">
                  Stock total
                </p>
                <p className="mt-0.5 text-lg font-bold xl:text-2xl">
                  {stockTotal}
                </p>
              </div>
              <Warehouse className="h-5 w-5 shrink-0 text-muted-foreground xl:h-7 xl:w-7" />
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="flex h-16 items-center justify-between gap-2 p-3 xl:h-20 xl:p-4">
              <div className="min-w-0">
                <p className="truncate text-[11px] text-muted-foreground xl:text-sm">
                  Agotados
                </p>
                <p className="mt-0.5 text-lg font-bold xl:text-2xl">
                  {agotados}
                </p>
              </div>
              <ShieldAlert className="h-5 w-5 shrink-0 text-red-500 xl:h-7 xl:w-7" />
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="flex h-16 items-center justify-between gap-2 p-3 xl:h-20 xl:p-4">
              <div className="min-w-0">
                <p className="truncate text-[11px] text-muted-foreground xl:text-sm">
                  Stock bajo
                </p>
                <p className="mt-0.5 text-lg font-bold xl:text-2xl">
                  {bajoMinimo}
                </p>
              </div>
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-500 xl:h-7 xl:w-7" />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-3 flex min-h-0 flex-1 flex-col border-border/60 shadow-sm">
        <CardHeader className="shrink-0 p-3 xl:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-base xl:text-lg">
                Control de inventario
              </CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground xl:text-sm">
                Identifica productos con faltante, agotados o por debajo del
                mínimo.
              </p>
            </div>

            <div className="relative w-full lg:w-[340px] xl:w-[380px]">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Buscar producto, código o stock..."
                className="h-9 pl-9 text-xs xl:h-10 xl:text-sm"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-2 p-3 pt-0 xl:p-4 xl:pt-0">
          {loading ? (
            <div className="flex h-full min-h-[220px] items-center justify-center text-sm text-muted-foreground">
              Cargando inventario...
            </div>
          ) : error ? (
            <div className="flex h-full min-h-[220px] items-center justify-center text-sm text-red-500">
              {error}
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border/60">
                <div className="h-full overflow-x-hidden overflow-y-auto">
                  <Table className="w-full table-fixed text-xs xl:text-sm">
                    <TableHeader className="sticky top-0 z-10 bg-muted/40">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="h-8">
                          {headerGroup.headers.map((header) => {
                            const hiddenColumn =
                              header.column.id === "codigo_barras" ||
                              header.column.id === "stock_minimo" ||
                              header.column.id === "stock_deseado"

                            return (
                              <TableHead
                                key={header.id}
                                className={[
                                  "h-8 px-2 py-1 text-xs font-semibold whitespace-nowrap",
                                  hiddenColumn ? "hidden 2xl:table-cell" : "",
                                  header.column.id === "id" ? "w-[42px]" : "",
                                  header.column.id === "codigo_producto"
                                    ? "w-[95px]"
                                    : "",
                                  header.column.id === "nombre"
                                    ? "w-[320px]"
                                    : "",
                                  header.column.id === "stock_actual"
                                    ? "w-[78px]"
                                    : "",
                                  header.column.id === "stock_minimo"
                                    ? "w-[78px]"
                                    : "",
                                  header.column.id === "stock_deseado"
                                    ? "w-[90px]"
                                    : "",
                                  header.column.id === "faltante"
                                    ? "w-[78px]"
                                    : "",
                                  header.column.id === "estado"
                                    ? "w-[85px]"
                                    : "",
                                  header.column.id === "acciones"
                                    ? "w-[65px]"
                                    : "",
                                ].join(" ")}
                              >
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </TableHead>
                            )
                          })}
                        </TableRow>
                      ))}
                    </TableHeader>

                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => {
                          const status = getInventoryStatus(row.original)

                          return (
                            <TableRow
                              key={row.id}
                              className={`h-10 transition-colors hover:bg-muted/30 ${status.rowClassName}`}
                            >
                              {row.getVisibleCells().map((cell) => {
                                const hiddenColumn =
                                  cell.column.id === "codigo_barras" ||
                                  cell.column.id === "stock_minimo" ||
                                  cell.column.id === "stock_deseado"

                                return (
                                  <TableCell
                                    key={cell.id}
                                    className={[
                                      "h-10 overflow-hidden px-2 py-1 align-middle text-xs whitespace-nowrap xl:text-sm",
                                      hiddenColumn
                                        ? "hidden 2xl:table-cell"
                                        : "",
                                    ].join(" ")}
                                  >
                                    <div className="truncate">
                                      {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                      )}
                                    </div>
                                  </TableCell>
                                )
                              })}
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No se encontraron productos en inventario.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Mostrando {table.getRowModel().rows.length} de{" "}
                  {table.getFilteredRowModel().rows.length} productos filtrados.
                </p>

                <div className="flex items-center justify-between gap-2 sm:justify-start">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="min-w-[95px] text-center text-xs text-muted-foreground">
                    Página {table.getState().pagination.pageIndex + 1} de{" "}
                    {Math.max(table.getPageCount(), 1)}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
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
