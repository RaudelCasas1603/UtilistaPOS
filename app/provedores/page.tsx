"use client"

import * as React from "react"
import providersData from "./providers.json"

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
  MoreHorizontal,
  Search,
  Truck,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Provider = {
  id: number
  nombre: string
  telefono: string
  correo: string
  empresa: string
  referencia: string
}

export default function ProveedoresPage() {
  const data = React.useMemo<Provider[]>(() => providersData as Provider[], [])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

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
              {row.original.empresa}
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
        accessorKey: "empresa",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Empresa
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.empresa}</span>
        ),
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
          <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {row.original.referencia}
          </span>
        ),
      },
      {
        id: "acciones",
        header: "",
        cell: ({ row }) => {
          const provider = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="border border-border/60 bg-background shadow-lg"
              >
                <DropdownMenuItem
                  onClick={() => console.log("Ver proveedor", provider)}
                >
                  Ver detalle
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => console.log("Editar proveedor", provider)}
                >
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => console.log("Contactar proveedor", provider)}
                >
                  Contactar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
        row.original.empresa.toLowerCase().includes(search) ||
        row.original.referencia.toLowerCase().includes(search)
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
  const referenciasUnicas = new Set(data.map((provider) => provider.referencia))
    .size
  const proveedoresConCorreo = data.filter((provider) => provider.correo).length

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Proveedores
        </h1>
        <p className="text-sm text-muted-foreground">
          Administra contactos, empresas y categorías de tus proveedores.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Total proveedores</p>
              <p className="mt-1 text-2xl font-bold">{totalProveedores}</p>
            </div>
            <Truck className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Empresas activas</p>
              <p className="mt-1 text-2xl font-bold">{empresasUnicas}</p>
            </div>
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Con correo</p>
              <p className="mt-1 text-2xl font-bold">{proveedoresConCorreo}</p>
            </div>
            <Mail className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Categorías</p>
              <p className="mt-1 text-2xl font-bold">{referenciasUnicas}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Listado de proveedores</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Consulta proveedores por nombre, empresa, correo o referencia.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="relative w-full sm:w-[320px]">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Buscar proveedor..."
                className="pl-9"
              />
            </div>

            <Button onClick={() => console.log("Nuevo proveedor")}>
              Nuevo proveedor
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border/60">
            <div className="overflow-x-auto">
              <Table>
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
                        No se encontraron proveedores.
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
              {table.getFilteredRowModel().rows.length} proveedores filtrados.
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
