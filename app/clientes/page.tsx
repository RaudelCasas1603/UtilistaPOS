"use client"

import * as React from "react"
import Link from "next/link"
import clientsData from "./clientes.json"

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

type Client = {
  id: number
  nombre: string
  telefono: string
  correo: string
  descuento: number
  referencia: string
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

export default function ClientesPage() {
  const [data, setData] = React.useState<Client[]>(clientsData as Client[])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [open, setOpen] = React.useState(false)

  const [newClient, setNewClient] = React.useState<Omit<Client, "id">>({
    nombre: "",
    telefono: "",
    correo: "",
    descuento: 0,
    referencia: "",
  })

  const handleChange = (field: keyof Omit<Client, "id">, value: string) => {
    setNewClient((prev) => ({
      ...prev,
      [field]: field === "descuento" ? Number(value) : value,
    }))
  }

  const handleAddClient = () => {
    if (
      !newClient.nombre.trim() ||
      !newClient.telefono.trim() ||
      !newClient.correo.trim() ||
      !newClient.referencia.trim()
    ) {
      return
    }

    const nextId =
      data.length > 0 ? Math.max(...data.map((client) => client.id)) + 1 : 1

    const clientToAdd: Client = {
      id: nextId,
      ...newClient,
    }

    setData((prev) => [clientToAdd, ...prev])

    setNewClient({
      nombre: "",
      telefono: "",
      correo: "",
      descuento: 0,
      referencia: "",
    })

    setOpen(false)
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
            className="h-auto p-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nombre
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="min-w-[220px]">
            <p className="font-semibold text-foreground">
              {row.original.nombre}
            </p>
            <p className="text-xs text-muted-foreground">
              Ref: {row.original.referencia}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "telefono",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Teléfono
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.telefono}</span>
        ),
      },
      {
        accessorKey: "correo",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Correo
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.correo}
          </span>
        ),
      },
      {
        accessorKey: "descuento",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Descuento
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const descuento = row.original.descuento

          return (
            <span
              className={[
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
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
            className="h-auto p-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Referencia
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.referencia}</span>
        ),
      },
      {
        id: "acciones",
        header: "Detalle",
        cell: ({ row }) => {
          const client = row.original

          return (
            <Button asChild variant="outline" size="sm">
              <Link href={`/clientes/${client.id}`}>Ver detalles</Link>
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
        String(row.original.descuento).toLowerCase().includes(search)
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
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Clientes
        </h1>
        <p className="text-sm text-muted-foreground">
          Administra tu base de clientes, descuentos y canales de referencia.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Total clientes</p>
              <p className="mt-1 text-2xl font-bold">{totalClientes}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Con descuento</p>
              <p className="mt-1 text-2xl font-bold">{clientesConDescuento}</p>
            </div>
            <BadgePercent className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Descuento promedio
              </p>
              <p className="mt-1 text-2xl font-bold">
                {descuentoPromedio.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Beneficio
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Referencias activas
              </p>
              <p className="mt-1 text-2xl font-bold">{referenciasUnicas}</p>
            </div>
            <Mail className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Listado de clientes</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Consulta clientes por nombre, correo, teléfono o referencia.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="relative w-full sm:w-[320px]">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Buscar cliente..."
                className="pl-9"
              />
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="px-5 text-base">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo cliente
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                  <DialogTitle>Agregar nuevo cliente</DialogTitle>
                  <DialogDescription>
                    Captura los datos del cliente según la estructura actual.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={newClient.nombre}
                      onChange={(e) => handleChange("nombre", e.target.value)}
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={newClient.telefono}
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
                        value={newClient.correo}
                        onChange={(e) => handleChange("correo", e.target.value)}
                        placeholder="Ej. cliente@correo.com"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
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
                      <Label htmlFor="referencia">Referencia</Label>
                      <Input
                        id="referencia"
                        value={newClient.referencia}
                        onChange={(e) =>
                          handleChange("referencia", e.target.value)
                        }
                        placeholder="Ej. Facebook, recomendación, volante"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddClient}>Guardar cliente</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                        No se encontraron clientes.
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
              {table.getFilteredRowModel().rows.length} clientes filtrados.
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
