"use client"

import { useEffect, useState } from "react"
import { ClipboardList, FileText, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

type TipoReporte = "sin-stock" | "debajo-minimo" | "hacia-ideal"

type ProductoReporte = {
  id: number
  id_producto: number
  nombre: string
  codigo_producto: string | null
  codigo_barras: string | null
  stock_actual: number
  stock_minimo: number
  stock_deseado: number
  faltantes: number
}

type GrupoProveedor = {
  empresa: string
  totalProductos: number
  productos: ProductoReporte[]
}

type RespuestaProveedores = {
  ok: boolean
  proveedores: string[]
}

type RespuestaReporte = {
  ok: boolean
  filtros: {
    proveedor: string
    tipoReporte: TipoReporte
  }
  totalProductos: number
  proveedores: GrupoProveedor[]
}

export default function ReporteInventarioPage() {
  const [proveedores, setProveedores] = useState<string[]>(["Todos"])
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("Todos")
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>("debajo-minimo")

  const [reporteGenerado, setReporteGenerado] = useState(false)
  const [loadingProveedores, setLoadingProveedores] = useState(true)
  const [loadingReporte, setLoadingReporte] = useState(false)
  const [error, setError] = useState("")

  const [reporte, setReporte] = useState<RespuestaReporte | null>(null)

  useEffect(() => {
    cargarProveedores()
  }, [])

  const cargarProveedores = async () => {
    try {
      setLoadingProveedores(true)
      setError("")

      const res = await fetch(`${API_URL}/inventario/reportes/proveedores`, {
        cache: "no-store",
      })

      const data: RespuestaProveedores = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error("No se pudieron cargar los proveedores")
      }

      setProveedores(data.proveedores || ["Todos"])
    } catch (err) {
      console.error(err)
      setError("No fue posible cargar los proveedores.")
      setProveedores(["Todos"])
    } finally {
      setLoadingProveedores(false)
    }
  }

  const generarReporte = async () => {
    try {
      setLoadingReporte(true)
      setError("")
      setReporteGenerado(true)

      const params = new URLSearchParams({
        proveedor: proveedorSeleccionado,
        tipoReporte,
      })

      const res = await fetch(
        `${API_URL}/inventario/reportes/faltantes?${params.toString()}`,
        {
          cache: "no-store",
        }
      )

      const data: RespuestaReporte = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error("No se pudo generar el reporte")
      }

      setReporte(data)
    } catch (err) {
      console.error(err)
      setReporte(null)
      setError("No fue posible generar el reporte de inventario.")
    } finally {
      setLoadingReporte(false)
    }
  }

  const tituloTipoReporte = {
    "sin-stock": "Productos sin existencia",
    "debajo-minimo": "Productos por debajo del mínimo",
    "hacia-ideal": "Productos para llegar al ideal",
  }

  const totalProductos = reporte?.totalProductos || 0
  const grupos = reporte?.proveedores || []

  return (
    <div className="h-[calc(100vh-64px)] min-h-0 w-full overflow-hidden bg-background">
      <div className="h-full w-full overflow-x-hidden overflow-y-auto p-4 pb-12 md:p-6 md:pb-16">
        <div className="flex w-full flex-col gap-4">
          {/* Header */}
          <div className="shrink-0 overflow-hidden rounded-3xl border bg-background shadow-sm">
            <div className="bg-muted/30 px-4 py-5 md:px-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl">
                    <ClipboardList className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                      Reporte de inventario
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Configura el reporte y genera el listado de faltantes por
                      proveedor.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[220px_1fr_220px]">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Empresa</label>
                    <Select
                      value={proveedorSeleccionado}
                      onValueChange={(value) => setProveedorSeleccionado(value)}
                    >
                      <SelectTrigger className="h-11 w-full rounded-2xl">
                        <SelectValue placeholder="Selecciona empresa" />
                      </SelectTrigger>

                      <SelectContent
                        className="rounded-lg border border-border bg-background shadow-lg"
                        position="popper"
                      >
                        {proveedores
                          .filter(
                            (proveedor) => proveedor && proveedor.trim() !== ""
                          )
                          .map((proveedor) => (
                            <SelectItem key={proveedor} value={proveedor}>
                              {proveedor}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Tipo de reporte
                    </label>
                    <Select
                      value={tipoReporte}
                      onValueChange={(value) =>
                        setTipoReporte(value as TipoReporte)
                      }
                    >
                      <SelectTrigger className="h-11 w-full rounded-2xl">
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>

                      <SelectContent
                        className="rounded-lg border border-border bg-background shadow-lg"
                        position="popper"
                      >
                        <SelectItem value="sin-stock">
                          Solo productos que no hay
                        </SelectItem>
                        <SelectItem value="debajo-minimo">
                          Productos debajo del mínimo
                        </SelectItem>
                        <SelectItem value="hacia-ideal">
                          Todos para llegar al ideal
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col justify-end space-y-2">
                    <button
                      onClick={generarReporte}
                      disabled={loadingReporte || loadingProveedores}
                      className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loadingReporte ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          Generar reporte
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        const params = new URLSearchParams({
                          proveedor: proveedorSeleccionado,
                          tipoReporte,
                        })

                        window.open(
                          `${API_URL}/inventario/reportes/faltantes/excel?${params.toString()}`,
                          "_blank"
                        )
                      }}
                      disabled={loadingReporte || loadingProveedores}
                      className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Exportar Excel
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-full border px-3 py-1 text-xs font-medium dark:border-sky-900 dark:bg-sky-500/10 dark:text-sky-600">
                    {tituloTipoReporte[tipoReporte]}
                  </span>

                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-600">
                    {proveedorSeleccionado}
                  </span>

                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-600">
                    {totalProductos} productos
                  </span>
                </div>

                {error ? (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}
              </div>
            </div>
          </div>

          {/* Resultado */}
          <div className="shrink-0 overflow-hidden rounded-3xl">
            <div className="bg-muted/30 px-4 py-4 md:px-6">
              <h2 className="text-base font-bold md:text-lg">
                Resultado del reporte
              </h2>
              <p className="text-sm text-muted-foreground">
                Productos agrupados por proveedor
              </p>
            </div>

            <div className="px-4 py-4 md:px-6">
              {!reporteGenerado ? (
                <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-dashed bg-muted/20 px-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Configura los filtros y presiona{" "}
                    <span className="font-semibold text-foreground">
                      Generar reporte
                    </span>
                  </p>
                </div>
              ) : loadingReporte ? (
                <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-dashed bg-muted/20 px-6 text-center">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando reporte...
                  </div>
                </div>
              ) : grupos.length === 0 ? (
                <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-dashed bg-muted/20 px-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No se encontraron productos para este reporte.
                  </p>
                </div>
              ) : (
                <div className="space-y-5 pb-6">
                  {grupos.map((grupo, index) => (
                    <section
                      key={`${grupo.empresa}-${index}`}
                      className="overflow-hidden rounded-2xl border bg-gradient-to-br from-background to-muted/20"
                    >
                      <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-3 md:px-5">
                        <div className="rounded-xl bg-sky-500/10 p-2 dark:bg-sky-500/15">
                          <ClipboardList className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold">
                            {grupo.empresa}
                          </h3>
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {grupo.totalProductos} producto
                            {grupo.totalProductos !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      <div className="px-4 py-4 md:px-5">
                        <ul className="space-y-3">
                          {grupo.productos.map((producto) => (
                            <li
                              key={producto.id}
                              className="rounded-2xl border bg-background/80 px-4 py-3 shadow-sm"
                            >
                              <div className="flex gap-3">
                                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500" />

                                <div className="min-w-0 flex-1">
                                  <div className="text-sm leading-6 text-foreground">
                                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                                      <span className="font-semibold">
                                        {producto.nombre}
                                      </span>

                                      {producto.codigo_producto ? (
                                        <span className="text-xs text-muted-foreground">
                                          {producto.codigo_producto}
                                        </span>
                                      ) : null}
                                    </div>

                                    <div className="mt-1 text-end">
                                      <span className="text-muted-foreground">
                                        Hay{" "}
                                      </span>
                                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                        {producto.stock_actual} piezas
                                      </span>
                                      <span className="text-muted-foreground">
                                        {" "}
                                        y faltan{" "}
                                      </span>
                                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                                        {producto.faltantes} piezas
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
