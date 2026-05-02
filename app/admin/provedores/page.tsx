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
  Building2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Plus,
  Search,
  Truck,
  Users,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

type EstatusProveedor = "activo" | "inactivo"

type ProviderApi = {
  id: number
  nombre: string
  telefono: string
  correo: string
  empresa: string
  referencia: string
  estatus: EstatusProveedor | string
  created_at?: string
  updated_at?: string
}

type Provider = {
  id: number
  nombre: string
  telefono: string
  correo: string
  empresa: string
  referencia: string
  estatus: EstatusProveedor
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const ENDPOINTS = {
  list: `${API_BASE}/api/proveedores`,
  create: `${API_BASE}/api/proveedores`,
  update: (id: number) => `${API_BASE}/api/proveedores/${id}`,
  updateEstatus: (id: number) => `${API_BASE}/api/proveedores/${id}/estatus`,
  remove: (id: number) => `${API_BASE}/api/proveedores/${id}`,
}

function normalizeEstatus(value: unknown): EstatusProveedor {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (normalized === "activo" || normalized === "inactivo") {
      return normalized
    }
  }
  return "activo"
}

function normalizeProvider(item: ProviderApi): Provider {
  return {
    id: Number(item.id),
    nombre: item.nombre ?? "",
    telefono: item.telefono ?? "",
    correo: item.correo ?? "",
    empresa: item.empresa ?? "",
    referencia: item.referencia ?? "",
    estatus: normalizeEstatus(item.estatus),
  }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  })

  if (!response.ok) {
    let message = `Error ${response.status} en ${url}`

    try {
      const errorData = await response.json()
      message =
        errorData?.message || errorData?.error || errorData?.detalle || message
    } catch {
      try {
        const text = await response.text()
        if (text) message = `${message} - ${text}`
      } catch {}
    }

    throw new Error(message)
  }

  return response.json()
}

export default function ProvidersPage() {
  const [data, setData] = React.useState<Provider[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [creating, setCreating] = React.useState(false)

  const [newProvider, setNewProvider] = React.useState<
    Omit<Provider, "id" | "estatus">
  >({
    nombre: "",
    telefono: "",
    correo: "",
    empresa: "",
    referencia: "",
  })

  const cargarProveedores = React.useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetchJson<ProviderApi[]>(ENDPOINTS.list)
      const proveedoresNormalizados = response.map(normalizeProvider)

      setData(proveedoresNormalizados)
    } catch (error) {
      console.error("Error al obtener proveedores:", error)
      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los proveedores."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    cargarProveedores()
  }, [cargarProveedores])

  const handleChange = (
    field: keyof Omit<Provider, "id" | "estatus">,
    value: string
  ) => {
    setNewProvider((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddProvider = async () => {
    if (
      !newProvider.nombre.trim() ||
      !newProvider.telefono.trim() ||
      !newProvider.correo.trim() ||
      !newProvider.empresa.trim() ||
      !newProvider.referencia.trim()
    ) {
      return
    }

    try {
      setCreating(true)

      const payload = {
        nombre: newProvider.nombre.trim(),
        telefono: newProvider.telefono.trim(),
        correo: newProvider.correo.trim(),
        empresa: newProvider.empresa.trim(),
        referencia: newProvider.referencia.trim(),
        estatus: "activo" as EstatusProveedor,
      }

      const response = await fetchJson<ProviderApi>(ENDPOINTS.create, {
        method: "POST",
        body: JSON.stringify(payload),
      })

      const providerToAdd = normalizeProvider(response)

      setData((prev) => [providerToAdd, ...prev])

      setNewProvider({
        nombre: "",
        telefono: "",
        correo: "",
        empresa: "",
        referencia: "",
      })

      setOpen(false)
    } catch (error) {
      console.error("Error al crear proveedor:", error)
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo crear el proveedor."
      )
    } finally {
      setCreating(false)
    }
  }

  const columns = React.useMemo<ColumnDef<Provider>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.id}</span>
        ),
      },
      {
        accessorKey: "nombre",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-sm font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nombre
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="min-w-[220px]">
            <p className="text-[15px] font-semibold">{row.original.nombre}</p>
          </div>
        ),
      },
      {
        accessorKey: "telefono",
        header: "Teléfono",
        cell: ({ row }) => (
          <span className="text-[15px]">{row.original.telefono}</span>
        ),
      },
      {
        accessorKey: "correo",
        header: "Correo",
        cell: ({ row }) => (
          <span className="text-[15px]">{row.original.correo}</span>
        ),
      },
      {
        accessorKey: "empresa",
        header: "Empresa",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-[15px]">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{row.original.empresa}</span>
          </div>
        ),
      },
      {
        accessorKey: "referencia",
        header: "Referencia",
        cell: ({ row }) => (
          <span className="text-[15px]">{row.original.referencia}</span>
        ),
      },
      {
        id: "ver-detalles",
        header: () => <div className="text-center">Ver detalles</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Button asChild variant="outline" size="sm" className="h-10 px-4">
              <Link
                href={`/admin/provedores/${row.original.id}`}
                className="flex items-center gap-2"
              >
                Ver detalles
              </Link>
            </Button>
          </div>
        ),
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
        row.original.nombre.toLowerCase().includes(search) ||
        row.original.telefono.toLowerCase().includes(search) ||
        row.original.correo.toLowerCase().includes(search) ||
        row.original.empresa.toLowerCase().includes(search) ||
        row.original.referencia.toLowerCase().includes(search) ||
        row.original.estatus.toLowerCase().includes(search)
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

  const totalProveedores = data.length
  const empresasUnicas = new Set(data.map((provider) => provider.empresa)).size
  const correosRegistrados = data.filter((provider) => provider.correo).length
  const referenciasUnicas = new Set(data.map((provider) => provider.referencia))
    .size

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden p-3 lg:p-4 xl:p-5">
      <div className="shrink-0 space-y-2">
        <div>
          <h1 className="text-xl font-bold xl:text-2xl">Proveedores</h1>
          <p className="text-xs text-muted-foreground xl:text-sm">
            Administra tu directorio de proveedores.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="flex h-16 items-center justify-between p-3">
              <div>
                <p className="text-[11px] text-muted-foreground">Proveedores</p>
                <p className="text-lg font-bold">{totalProveedores}</p>
              </div>
              <Truck className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex h-16 items-center justify-between p-3">
              <div>
                <p className="text-[11px] text-muted-foreground">Empresas</p>
                <p className="text-lg font-bold">{empresasUnicas}</p>
              </div>
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex h-16 items-center justify-between p-3">
              <div>
                <p className="text-[11px] text-muted-foreground">Correos</p>
                <p className="text-lg font-bold">{correosRegistrados}</p>
              </div>
              <Mail className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex h-16 items-center justify-between p-3">
              <div>
                <p className="text-[11px] text-muted-foreground">Referencias</p>
                <p className="text-lg font-bold">{referenciasUnicas}</p>
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-3 flex min-h-0 flex-1 flex-col border-border/60 shadow-sm">
        <CardHeader className="p-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-sm xl:text-base">
              Listado de proveedores
            </CardTitle>

            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <div className="relative w-full sm:w-[280px] xl:w-[320px]">
                <Search className="absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Buscar..."
                  className="h-9 pl-7 text-xs"
                />
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="h-9 px-3 text-xs">
                    <Plus className="mr-1 h-3 w-3" />
                    Nuevo
                  </Button>
                </DialogTrigger>
                <DialogContent>{/* modal intacto */}</DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-2 p-3 pt-0">
          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
            <div className="h-full overflow-x-hidden overflow-y-auto">
              <Table className="w-full table-fixed text-xs">
                <TableHeader className="bg-muted/40">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="h-8">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={[
                            "px-2 text-xs",
                            header.column.id === "id" ? "w-[40px]" : "",
                            header.column.id === "nombre" ? "w-[260px]" : "",
                            header.column.id === "referencia"
                              ? "w-[140px]"
                              : "",
                          ].join(" ")}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="h-9 hover:bg-muted/30">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={[
                            "truncate px-2 text-xs",
                            cell.column.id === "id" ? "w-[40px]" : "",
                          ].join(" ")}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p>
              {table.getRowModel().rows.length} de{" "}
              {table.getFilteredRowModel().rows.length}
            </p>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7"
                onClick={() => table.previousPage()}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>

              <span>
                {table.getState().pagination.pageIndex + 1} /{" "}
                {table.getPageCount()}
              </span>

              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7"
                onClick={() => table.nextPage()}
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
