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
  Search,
  Users,
  Mail,
  BadgePercent,
  Plus,
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

type EstatusCliente = "activo" | "inactivo"

type ClientApi = {
  id: number
  nombre: string
  telefono: string
  correo: string
  descuento: number | string
  referencia: string
  estatus: EstatusCliente | string
  created_at?: string
  updated_at?: string
}

type Client = {
  id: number
  nombre: string
  telefono: string
  correo: string
  descuento: number
  referencia: string
  estatus: EstatusCliente
}

type NewClientForm = Omit<Client, "id" | "estatus">

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const ENDPOINTS = {
  list: `${API_BASE}/api/clientes`,
  create: `${API_BASE}/api/clientes`,
  update: (id: number) => `${API_BASE}/api/clientes/${id}`,
  updateEstatus: (id: number) => `${API_BASE}/api/clientes/${id}/estatus`,
  remove: (id: number) => `${API_BASE}/api/clientes/${id}`,
}

function normalizeEstatus(value: unknown): EstatusCliente {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (normalized === "activo" || normalized === "inactivo") {
      return normalized
    }
  }
  return "activo"
}

function normalizeClient(item: ClientApi): Client {
  return {
    id: Number(item.id),
    nombre: item.nombre ?? "",
    telefono: item.telefono ?? "",
    correo: item.correo ?? "",
    descuento: Number(item.descuento ?? 0),
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

function getDiscountStyles(descuento: number) {
  if (descuento <= 0) {
    return "bg-muted text-muted-foreground"
  }

  if (descuento <= 5) {
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
  }

  if (descuento <= 10) {
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400"
  }

  return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
}

function RequiredLabel({
  htmlFor,
  children,
}: {
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <Label htmlFor={htmlFor}>
      {children} <span className="text-red-500">*</span>
    </Label>
  )
}

function getInputErrorClass(hasError: boolean) {
  return hasError ? "border-red-500 focus-visible:ring-red-500" : ""
}

export default function ClientesPage() {
  const [data, setData] = React.useState<Client[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [showRequiredErrors, setShowRequiredErrors] = React.useState(false)

  const [newClient, setNewClient] = React.useState<NewClientForm>({
    nombre: "",
    telefono: "",
    correo: "",
    descuento: 0,
    referencia: "",
  })

  const cargarClientes = React.useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetchJson<ClientApi[]>(ENDPOINTS.list)
      const clientesNormalizados = response.map(normalizeClient)

      setData(clientesNormalizados)
    } catch (error) {
      console.error("Error al obtener clientes:", error)
      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los clientes."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    cargarClientes()
  }, [cargarClientes])

  const handleChange = (field: keyof NewClientForm, value: string) => {
    setNewClient((prev) => ({
      ...prev,
      [field]:
        field === "descuento" ? (value === "" ? 0 : Number(value)) : value,
    }))
  }

  const requiredErrors = {
    nombre: !newClient.nombre.trim(),
    telefono: !newClient.telefono.trim(),
    correo: !newClient.correo.trim(),
    referencia: !newClient.referencia.trim(),
  }

  const isFormValid =
    !requiredErrors.nombre &&
    !requiredErrors.telefono &&
    !requiredErrors.correo &&
    !requiredErrors.referencia

  const resetForm = () => {
    setNewClient({
      nombre: "",
      telefono: "",
      correo: "",
      descuento: 0,
      referencia: "",
    })
    setShowRequiredErrors(false)
  }

  const handleAddClient = async () => {
    setShowRequiredErrors(true)

    if (!isFormValid) return

    try {
      setCreating(true)

      const payload = {
        nombre: newClient.nombre.trim(),
        telefono: newClient.telefono.trim(),
        correo: newClient.correo.trim(),
        descuento: Number(newClient.descuento) || 0,
        referencia: newClient.referencia.trim(),
        estatus: "activo" as EstatusCliente,
      }

      const response = await fetchJson<ClientApi>(ENDPOINTS.create, {
        method: "POST",
        body: JSON.stringify(payload),
      })

      const clientToAdd = normalizeClient(response)

      setData((prev) => [clientToAdd, ...prev])
      resetForm()
      setOpen(false)
    } catch (error) {
      console.error("Error al crear cliente:", error)
      alert(
        error instanceof Error ? error.message : "No se pudo crear el cliente."
      )
    } finally {
      setCreating(false)
    }
  }

  const columns = React.useMemo<ColumnDef<Client>[]>(
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
            className="h-auto p-0 text-xs font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nombre
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground xl:text-sm">
              {row.original.nombre}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <p className="truncate text-[11px] text-muted-foreground">
                Ref: {row.original.referencia}
              </p>

              {row.original.estatus === "activo" ? (
                <span className="shrink-0 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
                  Activo
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400">
                  Inactivo
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "telefono",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Teléfono
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs xl:text-sm">
            {row.original.telefono}
          </span>
        ),
      },
      {
        accessorKey: "correo",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Correo
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground xl:text-sm">
            {row.original.correo}
          </span>
        ),
      },
      {
        accessorKey: "descuento",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Desc.
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => {
          const descuento = row.original.descuento

          return (
            <span
              className={[
                "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                getDiscountStyles(descuento),
              ].join(" ")}
            >
              {descuento}%
            </span>
          )
        },
      },
      {
        accessorKey: "referencia",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Referencia
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-xs xl:text-sm">{row.original.referencia}</span>
        ),
      },
      {
        id: "acciones",
        header: "Detalle",
        cell: ({ row }) => {
          const client = row.original

          return (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
            >
              <Link href={`/admin/clientes/${client.id}`}>Ver</Link>
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
        row.original.nombre.toLowerCase().includes(search) ||
        row.original.telefono.toLowerCase().includes(search) ||
        row.original.correo.toLowerCase().includes(search) ||
        row.original.referencia.toLowerCase().includes(search) ||
        String(row.original.descuento).toLowerCase().includes(search) ||
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

  const totalClientes = data.length
  const clientesConDescuento = data.filter(
    (client) => client.descuento > 0
  ).length
  const descuentoPromedio =
    data.length > 0
      ? data.reduce((acc, client) => acc + client.descuento, 0) / data.length
      : 0

  const referenciasUnicas = new Set(data.map((client) => client.referencia))
    .size

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden p-3 lg:p-4 xl:p-5">
      <div className="shrink-0 space-y-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground xl:text-2xl">
            Clientes
          </h1>
          <p className="text-xs text-muted-foreground xl:text-sm">
            Administra tu base de clientes, descuentos y canales de referencia.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="flex h-16 items-center justify-between gap-2 p-3 xl:h-20 xl:p-4">
              <div className="min-w-0">
                <p className="truncate text-[11px] text-muted-foreground xl:text-sm">
                  Total clientes
                </p>
                <p className="mt-0.5 text-lg font-bold xl:text-2xl">
                  {totalClientes}
                </p>
              </div>
              <Users className="h-5 w-5 shrink-0 text-muted-foreground xl:h-7 xl:w-7" />
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="flex h-16 items-center justify-between gap-2 p-3 xl:h-20 xl:p-4">
              <div className="min-w-0">
                <p className="truncate text-[11px] text-muted-foreground xl:text-sm">
                  Con descuento
                </p>
                <p className="mt-0.5 text-lg font-bold xl:text-2xl">
                  {clientesConDescuento}
                </p>
              </div>
              <BadgePercent className="h-5 w-5 shrink-0 text-muted-foreground xl:h-7 xl:w-7" />
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="flex h-16 items-center justify-between gap-2 p-3 xl:h-20 xl:p-4">
              <div className="min-w-0">
                <p className="truncate text-[11px] text-muted-foreground xl:text-sm">
                  Descuento promedio
                </p>
                <p className="mt-0.5 text-lg font-bold xl:text-2xl">
                  {descuentoPromedio.toFixed(1)}%
                </p>
              </div>
              <div className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 xl:px-3 xl:py-1 xl:text-sm dark:text-emerald-400">
                Beneficio
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="flex h-16 items-center justify-between gap-2 p-3 xl:h-20 xl:p-4">
              <div className="min-w-0">
                <p className="truncate text-[11px] text-muted-foreground xl:text-sm">
                  Referencias activas
                </p>
                <p className="mt-0.5 text-lg font-bold xl:text-2xl">
                  {referenciasUnicas}
                </p>
              </div>
              <Mail className="h-5 w-5 shrink-0 text-muted-foreground xl:h-7 xl:w-7" />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-3 flex min-h-0 flex-1 flex-col border-border/60 shadow-sm">
        <CardHeader className="shrink-0 p-3 xl:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-base xl:text-lg">
                Listado de clientes
              </CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground xl:text-sm">
                Consulta clientes por nombre, correo, teléfono o referencia.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <div className="relative w-full sm:w-[300px] xl:w-[340px]">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="h-9 pl-9 text-xs xl:h-10 xl:text-sm"
                />
              </div>

              <Dialog
                open={open}
                onOpenChange={(value) => {
                  setOpen(value)
                  if (!value) resetForm()
                }}
              >
                <DialogTrigger asChild>
                  <Button className="h-9 gap-2 px-3 text-xs xl:h-10 xl:text-sm">
                    <Plus className="h-4 w-4" />
                    Nuevo cliente
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[560px]">
                  <DialogHeader>
                    <DialogTitle>Agregar nuevo cliente</DialogTitle>
                    <DialogDescription>
                      Captura los datos del cliente según la estructura actual.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-3 py-2">
                    <div className="grid gap-2">
                      <RequiredLabel htmlFor="nombre">Nombre</RequiredLabel>
                      <Input
                        id="nombre"
                        value={newClient.nombre}
                        onChange={(e) => handleChange("nombre", e.target.value)}
                        placeholder="Ej. Juan Pérez"
                        className={getInputErrorClass(
                          showRequiredErrors && requiredErrors.nombre
                        )}
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="grid gap-2">
                        <RequiredLabel htmlFor="telefono">
                          Teléfono
                        </RequiredLabel>
                        <Input
                          id="telefono"
                          value={newClient.telefono}
                          onChange={(e) =>
                            handleChange("telefono", e.target.value)
                          }
                          placeholder="Ej. 8441234567"
                          className={getInputErrorClass(
                            showRequiredErrors && requiredErrors.telefono
                          )}
                        />
                      </div>

                      <div className="grid gap-2">
                        <RequiredLabel htmlFor="correo">Correo</RequiredLabel>
                        <Input
                          id="correo"
                          type="email"
                          value={newClient.correo}
                          onChange={(e) =>
                            handleChange("correo", e.target.value)
                          }
                          placeholder="Ej. cliente@correo.com"
                          className={getInputErrorClass(
                            showRequiredErrors && requiredErrors.correo
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="descuento">Descuento (%)</Label>
                        <Input
                          id="descuento"
                          type="number"
                          min={0}
                          value={newClient.descuento}
                          onChange={(e) =>
                            handleChange("descuento", e.target.value)
                          }
                          placeholder="0"
                        />
                      </div>

                      <div className="grid gap-2">
                        <RequiredLabel htmlFor="referencia">
                          Referencia
                        </RequiredLabel>
                        <Input
                          id="referencia"
                          value={newClient.referencia}
                          onChange={(e) =>
                            handleChange("referencia", e.target.value)
                          }
                          placeholder="Ej. Facebook, recomendación, volante"
                          className={getInputErrorClass(
                            showRequiredErrors && requiredErrors.referencia
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOpen(false)
                        resetForm()
                      }}
                      disabled={creating}
                    >
                      Cancelar
                    </Button>

                    <Button onClick={handleAddClient} disabled={creating}>
                      {creating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      Guardar cliente
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-2 p-3 pt-0 xl:p-4 xl:pt-0">
          {loading ? (
            <div className="flex h-full min-h-[220px] items-center justify-center rounded-xl border border-dashed">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando clientes...
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-950 dark:bg-red-950/30 dark:text-red-300">
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
                              header.column.id === "correo" ||
                              header.column.id === "referencia"

                            return (
                              <TableHead
                                key={header.id}
                                className={[
                                  "h-8 px-2 py-1 text-xs font-semibold whitespace-nowrap",
                                  hiddenColumn ? "hidden 2xl:table-cell" : "",
                                  header.column.id === "id" ? "w-[42px]" : "",
                                  header.column.id === "nombre"
                                    ? "w-[300px]"
                                    : "",
                                  header.column.id === "telefono"
                                    ? "w-[125px]"
                                    : "",
                                  header.column.id === "correo"
                                    ? "w-[230px]"
                                    : "",
                                  header.column.id === "descuento"
                                    ? "w-[78px]"
                                    : "",
                                  header.column.id === "referencia"
                                    ? "w-[140px]"
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
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            className="h-10 transition-colors hover:bg-muted/30"
                          >
                            {row.getVisibleCells().map((cell) => {
                              const hiddenColumn =
                                cell.column.id === "correo" ||
                                cell.column.id === "referencia"

                              return (
                                <TableCell
                                  key={cell.id}
                                  className={[
                                    "h-10 overflow-hidden px-2 py-1 align-middle text-xs whitespace-nowrap xl:text-sm",
                                    hiddenColumn ? "hidden 2xl:table-cell" : "",
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
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No se encontraron clientes.
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
                  {table.getFilteredRowModel().rows.length} clientes filtrados.
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
                    {table.getPageCount()}
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
