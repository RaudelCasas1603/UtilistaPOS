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
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Package2,
  Search,
  Wallet,
  BadgeDollarSign,
  Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Product = {
  id: number
  codigoProducto: string
  codigoBarras: string
  nombre: string
  precio: number
  costo: number
  precioPublico: number
  stock: number
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value)
}

function getProfitPercentage(costo: number, precio: number) {
  if (costo <= 0) return 0
  return ((precio - costo) / costo) * 100
}

type ProductDialogProps = {
  onAddProduct: (product: Product) => void
}

function ProductDialog({ onAddProduct }: ProductDialogProps) {
  const [open, setOpen] = React.useState(false)

  const [form, setForm] = React.useState({
    id: "",
    codigoProducto: "",
    codigoBarras: "",
    nombre: "",
    precio: "",
    costo: "",
    precioPublico: "",
    stock: "",
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }))
  }

  const resetForm = () => {
    setForm({
      id: "",
      codigoProducto: "",
      codigoBarras: "",
      nombre: "",
      precio: "",
      costo: "",
      precioPublico: "",
      stock: "",
    })
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!form.id.trim()) newErrors.id = "El ID es obligatorio"
    if (!form.codigoProducto.trim())
      newErrors.codigoProducto = "El código de producto es obligatorio"
    if (!form.codigoBarras.trim())
      newErrors.codigoBarras = "El código de barras es obligatorio"
    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio"
    if (!form.precio.trim()) newErrors.precio = "El precio es obligatorio"
    if (!form.costo.trim()) newErrors.costo = "El costo es obligatorio"
    if (!form.precioPublico.trim())
      newErrors.precioPublico = "El precio público es obligatorio"
    if (!form.stock.trim()) newErrors.stock = "El stock es obligatorio"

    if (form.id && Number.isNaN(Number(form.id))) {
      newErrors.id = "El ID debe ser numérico"
    }

    if (form.precio && Number.isNaN(Number(form.precio))) {
      newErrors.precio = "El precio debe ser numérico"
    }

    if (form.costo && Number.isNaN(Number(form.costo))) {
      newErrors.costo = "El costo debe ser numérico"
    }

    if (form.precioPublico && Number.isNaN(Number(form.precioPublico))) {
      newErrors.precioPublico = "El precio público debe ser numérico"
    }

    if (form.stock && Number.isNaN(Number(form.stock))) {
      newErrors.stock = "El stock debe ser numérico"
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return

    const newProduct: Product = {
      id: Number(form.id),
      codigoProducto: form.codigoProducto.trim(),
      codigoBarras: form.codigoBarras.trim(),
      nombre: form.nombre.trim(),
      precio: Number(form.precio),
      costo: Number(form.costo),
      precioPublico: Number(form.precioPublico),
      stock: Number(form.stock),
    }

    onAddProduct(newProduct)
    resetForm()
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo producto
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Agregar producto</DialogTitle>
          <DialogDescription>
            Captura la información del producto
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="id">ID</Label>
            <Input
              id="id"
              type="number"
              placeholder="Ej. 21"
              value={form.id}
              onChange={(e) => handleChange("id", e.target.value)}
            />
            {errors.id && <p className="text-xs text-red-500">{errors.id}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="codigoProducto">Código producto</Label>
            <Input
              id="codigoProducto"
              placeholder="Ej. PROD-021"
              value={form.codigoProducto}
              onChange={(e) => handleChange("codigoProducto", e.target.value)}
            />
            {errors.codigoProducto && (
              <p className="text-xs text-red-500">{errors.codigoProducto}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="codigoBarras">Código de barras</Label>
            <Input
              id="codigoBarras"
              placeholder="Ej. 7501234567890"
              value={form.codigoBarras}
              onChange={(e) => handleChange("codigoBarras", e.target.value)}
            />
            {errors.codigoBarras && (
              <p className="text-xs text-red-500">{errors.codigoBarras}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              placeholder="Ej. Cuaderno profesional"
              value={form.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
            />
            {errors.nombre && (
              <p className="text-xs text-red-500">{errors.nombre}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="precio">Precio</Label>
            <Input
              id="precio"
              type="number"
              step="0.01"
              placeholder="Ej. 45.5"
              value={form.precio}
              onChange={(e) => handleChange("precio", e.target.value)}
            />
            {errors.precio && (
              <p className="text-xs text-red-500">{errors.precio}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="costo">Costo</Label>
            <Input
              id="costo"
              type="number"
              step="0.01"
              placeholder="Ej. 30"
              value={form.costo}
              onChange={(e) => handleChange("costo", e.target.value)}
            />
            {errors.costo && (
              <p className="text-xs text-red-500">{errors.costo}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="precioPublico">Precio público</Label>
            <Input
              id="precioPublico"
              type="number"
              step="0.01"
              placeholder="Ej. 49.9"
              value={form.precioPublico}
              onChange={(e) => handleChange("precioPublico", e.target.value)}
            />
            {errors.precioPublico && (
              <p className="text-xs text-red-500">{errors.precioPublico}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              placeholder="Ej. 120"
              value={form.stock}
              onChange={(e) => handleChange("stock", e.target.value)}
            />
            {errors.stock && (
              <p className="text-xs text-red-500">{errors.stock}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar producto</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ProductosPage() {
  const initialData = React.useMemo<Product[]>(
    () => productsData as Product[],
    []
  )

  const [data, setData] = React.useState<Product[]>(initialData)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const handleAddProduct = (product: Product) => {
    setData((prev) => [product, ...prev])
  }

  const columns = React.useMemo<ColumnDef<Product>[]>(
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
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="h-auto p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Código producto
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        accessorKey: "codigoBarras",
        header: "Código de barras",
        cell: ({ row }) => (
          <span className="text-center font-mono text-xs md:text-sm">
            {row.original.codigoBarras}
          </span>
        ),
      },
      {
        accessorKey: "nombre",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="h-auto p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Nombre
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="min-w-[220px]">
            <p className="truncate font-semibold text-foreground">
              {row.original.nombre}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.codigoProducto}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "precio",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="h-auto p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Precio
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCurrency(row.original.precio)}
          </span>
        ),
      },
      {
        accessorKey: "costo",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="h-auto p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Costo
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatCurrency(row.original.costo)}
          </span>
        ),
      },
      {
        id: "porcentajeGanancia",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="h-auto p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              % ganancia
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        accessorFn: (row) => getProfitPercentage(row.costo, row.precio),
        cell: ({ row }) => {
          const profit = getProfitPercentage(
            row.original.costo,
            row.original.precio
          )

          return (
            <span
              className={[
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                profit < 15
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : profit < 30
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              ].join(" ")}
            >
              {profit.toFixed(1)}%
            </span>
          )
        },
      },
      {
        accessorKey: "precioPublico",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="h-auto p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Precio público
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <span className="font-semibold text-primary">
            {formatCurrency(row.original.precioPublico)}
          </span>
        ),
      },
      {
        accessorKey: "stock",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="h-auto p-0 font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Stock
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <span className="font-medium">{row.original.stock}</span>
        ),
      },
      {
        id: "acciones",
        header: "Detalle",
        cell: ({ row }) => {
          const product = row.original

          return (
            <Button asChild variant="outline" size="sm">
              <Link href={`/productos/${product.id}`}>Ver detalles</Link>
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
        row.original.nombre.toLowerCase().includes(search)
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

  const promedioCosto =
    data.length > 0
      ? data.reduce((acc, item) => acc + item.costo, 0) / data.length
      : 0

  const promedioPrecio =
    data.length > 0
      ? data.reduce((acc, item) => acc + item.precio, 0) / data.length
      : 0

  const promedioGanancia =
    data.length > 0
      ? data.reduce(
          (acc, item) => acc + getProfitPercentage(item.costo, item.precio),
          0
        ) / data.length
      : 0

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Productos
        </h1>
        <p className="text-sm text-muted-foreground">
          Administra precios, costos y margen de ganancia de tus productos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Total productos dados de alta
              </p>
              <p className="mt-1 text-2xl font-bold">{totalProductos}</p>
            </div>
            <Package2 className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Costo promedio</p>
              <p className="mt-1 text-2xl font-bold">
                {formatCurrency(promedioCosto)}
              </p>
            </div>
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Precio promedio</p>
              <p className="mt-1 text-2xl font-bold">
                {formatCurrency(promedioPrecio)}
              </p>
            </div>
            <BadgeDollarSign className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Ganancia promedio</p>
              <p className="mt-1 text-2xl font-bold">
                {promedioGanancia.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Margen
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Listado de productos</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Consulta y ordena la información de tus productos.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="relative w-full sm:w-[320px]">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Buscar por nombre, código o barras..."
                className="pl-9"
              />
            </div>

            <ProductDialog onAddProduct={handleAddProduct} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border/60">
            <div className="overflow-x-auto">
              <Table className="text-base">
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
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="transition-colors hover:bg-muted/30"
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No se encontraron productos.
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
