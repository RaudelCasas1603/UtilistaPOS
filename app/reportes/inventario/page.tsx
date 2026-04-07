"use client"

import { useMemo, useState } from "react"
import { Building2, ClipboardList, FileText } from "lucide-react"

type ProductoInventario = {
  id: number
  nombre: string
  proveedor: string
  stockActual: number
  stockMinimo: number
  stockIdeal: number
}

const inventarioData: ProductoInventario[] = [
  {
    id: 1,
    nombre: "Cuaderno profesional raya",
    proveedor: "Scribe",
    stockActual: 0,
    stockMinimo: 8,
    stockIdeal: 20,
  },
  {
    id: 2,
    nombre: "Lápiz HB",
    proveedor: "Maped",
    stockActual: 3,
    stockMinimo: 10,
    stockIdeal: 30,
  },
  {
    id: 3,
    nombre: "Bolígrafo azul",
    proveedor: "Bic",
    stockActual: 12,
    stockMinimo: 10,
    stockIdeal: 35,
  },
  {
    id: 4,
    nombre: "Marcador permanente negro",
    proveedor: "Sharpie",
    stockActual: 0,
    stockMinimo: 6,
    stockIdeal: 18,
  },
  {
    id: 5,
    nombre: "Resma carta",
    proveedor: "Office Depot",
    stockActual: 4,
    stockMinimo: 8,
    stockIdeal: 15,
  },
  {
    id: 6,
    nombre: "Pegamento en barra",
    proveedor: "Pritt",
    stockActual: 1,
    stockMinimo: 5,
    stockIdeal: 16,
  },
  {
    id: 7,
    nombre: "Carpeta tamaño carta",
    proveedor: "Scribe",
    stockActual: 9,
    stockMinimo: 12,
    stockIdeal: 25,
  },
  {
    id: 8,
    nombre: "Tijera escolar",
    proveedor: "Maped",
    stockActual: 6,
    stockMinimo: 4,
    stockIdeal: 18,
  },
]

type TipoReporte = "sin-stock" | "debajo-minimo" | "hacia-ideal"

export default function ReporteInventarioPage() {
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("Todos")
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>("debajo-minimo")
  const [reporteGenerado, setReporteGenerado] = useState(false)

  const proveedores = useMemo(() => {
    const unicos = Array.from(new Set(inventarioData.map((p) => p.proveedor)))
    return ["Todos", ...unicos]
  }, [])

  const productosFiltrados = useMemo(() => {
    let productos = [...inventarioData]

    if (proveedorSeleccionado !== "Todos") {
      productos = productos.filter(
        (producto) => producto.proveedor === proveedorSeleccionado
      )
    }

    if (tipoReporte === "sin-stock") {
      productos = productos.filter((producto) => producto.stockActual === 0)
    }

    if (tipoReporte === "debajo-minimo") {
      productos = productos.filter(
        (producto) => producto.stockActual < producto.stockMinimo
      )
    }

    if (tipoReporte === "hacia-ideal") {
      productos = productos.filter(
        (producto) => producto.stockActual < producto.stockIdeal
      )
    }

    return productos
  }, [proveedorSeleccionado, tipoReporte])

  const productosAgrupados = useMemo(() => {
    return productosFiltrados.reduce(
      (acc, producto) => {
        if (!acc[producto.proveedor]) {
          acc[producto.proveedor] = []
        }
        acc[producto.proveedor].push(producto)
        return acc
      },
      {} as Record<string, ProductoInventario[]>
    )
  }, [productosFiltrados])

  const totalProductos = productosFiltrados.length

  const generarReporte = async () => {
    setReporteGenerado(true)

    // Aquí luego conectas tu endpoint
    // const res = await fetch("/api/reportes/inventario", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     proveedor: proveedorSeleccionado,
    //     tipoReporte,
    //   }),
    // })
    //
    // const data = await res.json()
    // console.log(data)
  }

  const obtenerFaltantes = (producto: ProductoInventario) => {
    if (tipoReporte === "sin-stock") {
      return producto.stockIdeal - producto.stockActual
    }

    if (tipoReporte === "debajo-minimo") {
      return producto.stockMinimo - producto.stockActual
    }

    return producto.stockIdeal - producto.stockActual
  }

  const tituloTipoReporte = {
    "sin-stock": "Productos sin existencia",
    "debajo-minimo": "Productos por debajo del mínimo",
    "hacia-ideal": "Productos para llegar al ideal",
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4 md:p-6">
      <div className="overflow-hidden rounded-3xl border bg-background shadow-sm">
        <div className="bg-muted/30 px-4 py-5 md:px-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="borderp-2.5 rounded-2xl">
                <ClipboardList className="h-5 w-5" />
              </div>

              <div>
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
                <label className="text-sm font-medium">Proveedor</label>
                <select
                  value={proveedorSeleccionado}
                  onChange={(e) => setProveedorSeleccionado(e.target.value)}
                  className="h-11 w-full rounded-2xl border bg-background px-3 text-sm shadow-sm transition outline-none focus:ring-2 focus:ring-sky-500/30"
                >
                  {proveedores.map((proveedor) => (
                    <option key={proveedor} value={proveedor}>
                      {proveedor}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de reporte</label>
                <select
                  value={tipoReporte}
                  onChange={(e) =>
                    setTipoReporte(e.target.value as TipoReporte)
                  }
                  className="h-11 w-full rounded-2xl border bg-background px-3 text-sm shadow-sm transition outline-none focus:ring-2 focus:ring-sky-500/30"
                >
                  <option value="sin-stock">Solo productos que no hay</option>
                  <option value="debajo-minimo">
                    Productos debajo del mínimo
                  </option>
                  <option value="hacia-ideal">
                    Todos para llegar al ideal
                  </option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <button
                  onClick={generarReporte}
                  className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
                >
                  <FileText className="h-4 w-4" />
                  Generar reporte
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-full border px-3 py-1 text-xs font-medium dark:border-sky-900 dark:bg-sky-500/10 dark:text-sky-300">
                {tituloTipoReporte[tipoReporte]}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300">
                {proveedorSeleccionado}
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-300">
                {totalProductos} productos
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-3xl border bg-background shadow-sm">
        <div className="border-b bg-muted/30 px-4 py-4 md:px-6">
          <h2 className="text-base font-bold md:text-lg">
            Resultado del reporte
          </h2>
          <p className="text-sm text-muted-foreground">
            Productos agrupados por proveedor
          </p>
        </div>

        <div className="h-[90%] overflow-y-auto scroll-smooth px-4 py-4 [scrollbar-width:none] md:px-6 [&::-webkit-scrollbar]:hidden">
          {!reporteGenerado ? (
            <div className="flex h-full items-center justify-center rounded-3xl border border-dashed bg-muted/20 px-6 text-center">
              <p className="text-sm text-muted-foreground">
                Configura los filtros y presiona{" "}
                <span className="font-semibold text-foreground">
                  Generar reporte
                </span>
              </p>
            </div>
          ) : Object.keys(productosAgrupados).length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-3xl border border-dashed bg-muted/20 px-6 text-center">
              <p className="text-sm text-muted-foreground">
                No se encontraron productos para este reporte.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(productosAgrupados).map(
                ([proveedor, productos]) => (
                  <section
                    key={proveedor}
                    className="overflow-hidden rounded-2xl border bg-gradient-to-br from-background to-muted/20"
                  >
                    <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-3 md:px-5">
                      <div className="rounded-xl bg-sky-500/10 p-2 dark:bg-sky-500/15">
                        <Building2 className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold">{proveedor}</h3>
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {productos.length} producto
                          {productos.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="px-4 py-4 md:px-5">
                      <ul className="space-y-3">
                        {productos.map((producto) => {
                          const faltantes = Math.max(
                            obtenerFaltantes(producto),
                            0
                          )

                          return (
                            <li
                              key={producto.id}
                              className="rounded-2xl border bg-background/80 px-4 py-3 shadow-sm"
                            >
                              <div className="flex gap-3">
                                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500" />

                                <div className="flex items-center">
                                  <div className="text-sm leading-6 text-foreground">
                                    <span className="font-semibold">
                                      {producto.nombre}
                                    </span>
                                    <div className="text-end">
                                      <span className="text-muted-foreground">
                                        {" "}
                                        Hay{" "}
                                      </span>
                                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                        {producto.stockActual} piezas
                                      </span>
                                      <span className="text-muted-foreground">
                                        {" "}
                                        y faltan{" "}
                                      </span>
                                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                                        {faltantes} piezas
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </section>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
