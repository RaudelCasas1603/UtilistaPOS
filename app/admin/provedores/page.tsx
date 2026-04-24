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
            <div className="mt-1 flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                Ref: {row.original.referencia}
              </p>

              {row.original.estatus === "activo" ? (
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[11px] font-semibold text-green-600 dark:text-green-400">
                  Activo
                </span>
              ) : (
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-600 dark:text-red-400">
                  Inactivo
                </span>
              )}
            </div>
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
    <div className="w-full space-y-6 p-6 pb-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Proveedores</h1>
        <p className="text-sm text-muted-foreground">
          Administra tu directorio de proveedores y empresas relacionadas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Total proveedores</p>
              <p className="mt-1 text-2xl font-bold">{totalProveedores}</p>
            </div>
            <Truck className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Empresas únicas</p>
              <p className="mt-1 text-2xl font-bold">{empresasUnicas}</p>
            </div>
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Correos registrados
              </p>
              <p className="mt-1 text-2xl font-bold">{correosRegistrados}</p>
            </div>
            <Mail className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Referencias activas
              </p>
              <p className="mt-1 text-2xl font-bold">{referenciasUnicas}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">Listado de proveedores</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Busca por nombre, empresa, correo, teléfono o referencia.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="relative w-full sm:w-[340px]">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Buscar proveedor..."
                className="pl-9 text-[15px]"
              />
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="px-5 text-base">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo proveedor
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                  <DialogTitle>Agregar nuevo proveedor</DialogTitle>
                  <DialogDescription>
                    Captura los datos del proveedor según la estructura actual.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={newProvider.nombre}
                      onChange={(e) => handleChange("nombre", e.target.value)}
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={newProvider.telefono}
                        onChange={(e) =>
                          handleChange("telefono", e.target.value)
                        }
                        placeholder="Ej. 8441234567"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="correo">Correo</Label>
                      <Input
                        id="correo"
                        type="email"
                        value={newProvider.correo}
                        onChange={(e) => handleChange("correo", e.target.value)}
                        placeholder="Ej. proveedor@correo.com"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="empresa">Empresa</Label>
                      <Input
                        id="empresa"
                        value={newProvider.empresa}
                        onChange={(e) =>
                          handleChange("empresa", e.target.value)
                        }
                        placeholder="Ej. Papeles del Norte"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="referencia">Referencia</Label>
                      <Input
                        id="referencia"
                        value={newProvider.referencia}
                        onChange={(e) =>
                          handleChange("referencia", e.target.value)
                        }
                        placeholder="Ej. Recomendación, Expo, Facebook"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false)
                      setNewProvider({
                        nombre: "",
                        telefono: "",
                        correo: "",
                        empresa: "",
                        referencia: "",
                      })
                    }}
                    disabled={creating}
                  >
                    Cancelar
                  </Button>

                  <Button onClick={handleAddProvider} disabled={creating}>
                    {creating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Guardar proveedor
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="pb-2">
          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando proveedores...
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-950 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-border/60">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              className="text-xs whitespace-nowrap"
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
                                className="align-middle text-xs whitespace-nowrap"
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
                            className="h-24 text-center text-xs text-muted-foreground"
                          >
                            No se encontraron proveedores.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {table.getRowModel().rows.length} de{" "}
                  {table.getFilteredRowModel().rows.length} proveedores
                  filtrados.
                </p>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="min-w-[140px] text-center text-sm text-muted-foreground">
                    Página {table.getState().pagination.pageIndex + 1} de{" "}
                    {table.getPageCount()}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
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
