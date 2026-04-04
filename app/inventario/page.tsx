"use client"

import * as React from "react"
import Link from "next/link"
import productsData from "./products.json"

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
  AlertTriangle,
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

type ProductInventory = {
  id: number
  codigoProducto: string
  codigoBarras: string
  nombre: string
  precio: number
  costo: number
  precioPublico: number
  stockActual: number
  stockMinimo: number
  stockDeseado: number
}

function getInventoryStatus(product: ProductInventory) {
  if (product.stockActual === 0) {
    return {
      label: "Agotado",
      className: "bg-red-500/10 text-red-600 dark:text-red-400",
      rowClassName: "bg-red-500/5",
    }
  }

  if (product.stockActual < product.stockMinimo) {
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
  const data = React.useMemo<ProductInventory[]>(
    () => productsData as ProductInventory[],
    []
  )

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

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
        accessorKey: "codigoProducto",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Código producto
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "nombre",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Producto
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="min-w-[220px]">
            <p className="font-semibold text-foreground">
              {row.original.nombre}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.codigoBarras}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "stockActual",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Stock actual
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const stock = row.original.stockActual
          const status = getInventoryStatus(row.original)

          return (
            <span
              className={[
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                status.className,
              ].join(" ")}
            >
              {stock} pzs
            </span>
          )
        },
      },
      {
        accessorKey: "stockMinimo",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Stock mínimo
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium text-muted-foreground">
            {row.original.stockMinimo} pzs
          </span>
        ),
      },
      {
        accessorKey: "stockDeseado",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Stock deseado
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.stockDeseado} pzs
          </span>
        ),
      },
      {
        id: "faltante",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Reponer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        accessorFn: (row) => Math.max(row.stockDeseado - row.stockActual, 0),
        cell: ({ row }) => {
          const faltante = Math.max(
            row.original.stockDeseado - row.original.stockActual,
            0
          )

          return (
            <span className="font-semibold text-primary">{faltante} pzs</span>
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
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
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
            <Button asChild variant="outline" size="sm">
              <Link href={`/inventario/${product.id}`}>Ver detalles</Link>
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
      const search = String(filterValue).toLowerCase()

      return (
        String(row.original.id).toLowerCase().includes(search) ||
        row.original.codigoProducto.toLowerCase().includes(search) ||
        row.original.codigoBarras.toLowerCase().includes(search) ||
        row.original.nombre.toLowerCase().includes(search) ||
        String(row.original.stockActual).toLowerCase().includes(search) ||
        String(row.original.stockMinimo).toLowerCase().includes(search) ||
        String(row.original.stockDeseado).toLowerCase().includes(search)
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
  const stockTotal = data.reduce((acc, item) => acc + item.stockActual, 0)
  const agotados = data.filter((item) => item.stockActual === 0).length
  const bajoMinimo = data.filter(
    (item) => item.stockActual > 0 && item.stockActual < item.stockMinimo
  ).length

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Inventario
        </h1>
        <p className="text-sm text-muted-foreground">
          Supervisa existencias, mínimos y reabasto de tus productos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Productos</p>
              <p className="mt-1 text-2xl font-bold">{totalProductos}</p>
            </div>
            <Boxes className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Stock total</p>
              <p className="mt-1 text-2xl font-bold">{stockTotal}</p>
            </div>
            <Warehouse className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Bajo mínimo</p>
              <p className="mt-1 text-2xl font-bold">{bajoMinimo}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Agotados</p>
              <p className="mt-1 text-2xl font-bold">{agotados}</p>
            </div>
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Control de inventario</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Identifica productos con faltante, agotados o por debajo del
              mínimo.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="relative w-full sm:w-[340px]">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Buscar producto, código o stock..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border/60">
            <div className="overflow-x-auto">
              <Table className="text-lg">
                <TableHeader className="bg-muted/40">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="whitespace-nowrap"
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
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => {
                      const status = getInventoryStatus(row.original)

                      return (
                        <TableRow
                          key={row.id}
                          className={`transition-colors hover:bg-muted/30 ${status.rowClassName}`}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className="align-middle whitespace-nowrap"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {table.getRowModel().rows.length} de{" "}
              {table.getFilteredRowModel().rows.length} productos filtrados.
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="min-w-[120px] text-center text-sm text-muted-foreground">
                Página {table.getState().pagination.pageIndex + 1} de{" "}
                {table.getPageCount()}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
