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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Product = {
  id: number
  codigoProducto: string
  codigoBarras: string
  nombre: string
  precio: number
  costo: number
  precioPublico: number
  stock: number
  idProveedor?: number | null
  idCategoria?: number | null
}

type ApiProducto = {
  id: number
  codigo_producto: string | null
  codigo_barras: string | null
  nombre: string
  precio_compra: number | string | null
  precio_venta: number | string | null
  porcentaje_ganancia: number | string | null
  id_proveedor: number | null
  id_categoria: number | null
  stock: number | null
}

type ApiProveedor = {
  id: number
  empresa: string
}

type ApiCategoria = {
  id: number
  nombre: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

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

function mapApiProductoToProduct(item: ApiProducto): Product {
  const costo = Number(item.precio_compra ?? 0)
  const precio = Number(item.precio_venta ?? 0)

  return {
    id: item.id,
    codigoProducto: item.codigo_producto ?? "",
    codigoBarras: item.codigo_barras ?? "",
    nombre: item.nombre,
    precio,
    costo,
    precioPublico: precio,
    stock: Number(item.stock ?? 0),
    idProveedor: item.id_proveedor,
    idCategoria: item.id_categoria,
  }
}

type ProductDialogPayload = {
  codigoProducto: string
  codigoBarras: string
  nombre: string
  precioCompra: number
  precioVenta: number
  stock: number
  idProveedor: number | null
  idCategoria: number | null
}

type ProductDialogProps = {
  onAddProduct: (product: ProductDialogPayload) => Promise<void>
}

function ProductDialog({ onAddProduct }: ProductDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [loadingCatalogs, setLoadingCatalogs] = React.useState(false)

  const [proveedores, setProveedores] = React.useState<ApiProveedor[]>([])
  const [categorias, setCategorias] = React.useState<ApiCategoria[]>([])

  const [form, setForm] = React.useState({
    codigoProducto: "",
    codigoBarras: "",
    nombre: "",
    precioCompra: "",
    precioVenta: "",
    stock: "",
    idProveedor: "",
    idCategoria: "",
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
      codigoProducto: "",
      codigoBarras: "",
      nombre: "",
      precioCompra: "",
      precioVenta: "",
      stock: "",
      idProveedor: "",
      idCategoria: "",
    })
    setErrors({})
  }

  const fetchCatalogs = React.useCallback(async () => {
    try {
      setLoadingCatalogs(true)

      const [proveedoresRes, categoriasRes] = await Promise.all([
        fetch(`${API_URL}/proveedores`, { cache: "no-store" }),
        fetch(`${API_URL}/categorias`, { cache: "no-store" }),
      ])

      if (!proveedoresRes.ok) {
        throw new Error("No se pudieron cargar los proveedores")
      }

      if (!categoriasRes.ok) {
        throw new Error("No se pudieron cargar las categorías")
      }

      const proveedoresData: ApiProveedor[] = await proveedoresRes.json()
      const categoriasData: ApiCategoria[] = await categoriasRes.json()

      setProveedores(proveedoresData)
      setCategorias(categoriasData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingCatalogs(false)
    }
  }, [])

  React.useEffect(() => {
    if (open) {
      fetchCatalogs()
    }
  }, [open, fetchCatalogs])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    if (!form.precioCompra.trim()) {
      newErrors.precioCompra = "El precio de compra es obligatorio"
    }

    if (!form.precioVenta.trim()) {
      newErrors.precioVenta = "El precio de venta es obligatorio"
    }

    if (!form.stock.trim()) {
      newErrors.stock = "El stock inicial es obligatorio"
    }

    if (!form.idProveedor) {
      newErrors.idProveedor = "Selecciona un proveedor"
    }

    if (!form.idCategoria) {
      newErrors.idCategoria = "Selecciona una categoría"
    }

    if (form.precioCompra && Number.isNaN(Number(form.precioCompra))) {
      newErrors.precioCompra = "El precio de compra debe ser numérico"
    }

    if (form.precioVenta && Number.isNaN(Number(form.precioVenta))) {
      newErrors.precioVenta = "El precio de venta debe ser numérico"
    }

    if (form.stock && Number.isNaN(Number(form.stock))) {
      newErrors.stock = "El stock inicial debe ser numérico"
    }

    if (
      form.precioCompra &&
      !Number.isNaN(Number(form.precioCompra)) &&
      Number(form.precioCompra) < 0
    ) {
      newErrors.precioCompra = "El precio de compra no puede ser negativo"
    }

    if (
      form.precioVenta &&
      !Number.isNaN(Number(form.precioVenta)) &&
      Number(form.precioVenta) < 0
    ) {
      newErrors.precioVenta = "El precio de venta no puede ser negativo"
    }

    if (
      form.stock &&
      !Number.isNaN(Number(form.stock)) &&
      Number(form.stock) < 0
    ) {
      newErrors.stock = "El stock inicial no puede ser negativo"
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      setSaving(true)

      await onAddProduct({
        codigoProducto: form.codigoProducto.trim(),
        codigoBarras: form.codigoBarras.trim(),
        nombre: form.nombre.trim(),
        precioCompra: Number(form.precioCompra),
        precioVenta: Number(form.precioVenta),
        stock: Number(form.stock),
        idProveedor: form.idProveedor ? Number(form.idProveedor) : null,
        idCategoria: form.idCategoria ? Number(form.idCategoria) : null,
      })

      resetForm()
      setOpen(false)
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
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
            Captura la información del producto para darlo de alta.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 md:grid-cols-2">
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

          <div className="grid gap-2 md:col-span-2">
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
            <Label htmlFor="precioCompra">Precio compra</Label>
            <Input
              id="precioCompra"
              type="number"
              step="0.01"
              placeholder="Ej. 30"
              value={form.precioCompra}
              onChange={(e) => handleChange("precioCompra", e.target.value)}
            />
            {errors.precioCompra && (
              <p className="text-xs text-red-500">{errors.precioCompra}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="precioVenta">Precio venta</Label>
            <Input
              id="precioVenta"
              type="number"
              step="0.01"
              placeholder="Ej. 45"
              value={form.precioVenta}
              onChange={(e) => handleChange("precioVenta", e.target.value)}
            />
            {errors.precioVenta && (
              <p className="text-xs text-red-500">{errors.precioVenta}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Proveedor</Label>
            <Select
              value={form.idProveedor}
              onValueChange={(value) => handleChange("idProveedor", value)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingCatalogs
                      ? "Cargando proveedores..."
                      : "Selecciona un proveedor"
                  }
                />
              </SelectTrigger>
              <SelectContent
                className="max-h-40 rounded-lg border border-border bg-background shadow-lg"
                position="popper"
              >
                {proveedores.map((proveedor) => (
                  <SelectItem key={proveedor.id} value={String(proveedor.id)}>
                    {proveedor.empresa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.idProveedor && (
              <p className="text-xs text-red-500">{errors.idProveedor}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Categoría</Label>
            <Select
              value={form.idCategoria}
              onValueChange={(value) => handleChange("idCategoria", value)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingCatalogs
                      ? "Cargando categorías..."
                      : "Selecciona una categoría"
                  }
                />
              </SelectTrigger>
              <SelectContent
                className="max-h-40 rounded-lg border border-border bg-background shadow-lg"
                position="popper"
              >
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={String(categoria.id)}>
                    {categoria.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.idCategoria && (
              <p className="text-xs text-red-500">{errors.idCategoria}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stock">Stock inicial</Label>
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
          <Button onClick={handleSave} disabled={saving || loadingCatalogs}>
            {saving ? "Guardando..." : "Guardar producto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ProductosPage() {
  const [data, setData] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const fetchProductos = React.useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`${API_URL}/productos`, {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("No se pudieron cargar los productos")
      }

      const result: ApiProducto[] = await response.json()
      setData(result.map(mapApiProductoToProduct))
    } catch (err) {
      console.error(err)
      setError("Ocurrió un error al cargar los productos")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchProductos()
  }, [fetchProductos])

  const handleAddProduct = async (product: ProductDialogPayload) => {
    const payload = {
      codigo_producto: product.codigoProducto,
      codigo_barras: product.codigoBarras,
      nombre: product.nombre,
      precio_compra: product.precioCompra,
      precio_venta: product.precioVenta,
      id_proveedor: product.idProveedor,
      id_categoria: product.idCategoria,
    }

    const response = await fetch(`${API_URL}/productos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result?.message || "No se pudo guardar el producto")
    }

    const nuevoProducto = mapApiProductoToProduct(result)

    setData((prev) => [nuevoProducto, ...prev])

    if (product.stock > 0) {
      try {
        await fetch(`${API_URL}/inventario`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_producto: nuevoProducto.id,
            stock_actual: product.stock,
            stock_minimo: 0,
            stock_deseado: product.stock,
          }),
        })
      } catch (inventoryError) {
        console.error("Error al crear inventario inicial:", inventoryError)
      }
    }
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
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nombre
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
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
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Precio
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCurrency(row.original.precio)}
          </span>
        ),
      },
      {
        accessorKey: "costo",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Costo
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatCurrency(row.original.costo)}
          </span>
        ),
      },
      {
        id: "porcentajeGanancia",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            % ganancia
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
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
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Precio público
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-primary">
            {formatCurrency(row.original.precioPublico)}
          </span>
        ),
      },
      {
        accessorKey: "stock",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Stock
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
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
              <Link href={`/admin/productos/${product.id}`}>Ver detalles</Link>
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

      <Card className="mt-10 border-border/60 shadow-sm">
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
          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Cargando productos...
            </div>
          ) : error ? (
            <div className="flex h-40 items-center justify-center text-sm text-red-500">
              {error}
            </div>
          ) : (
            <>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
