"use client"

import { use, useEffect, useMemo, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Tooltip,
} from "recharts"
import { Pencil, Save, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { Package, Hash, Barcode, DollarSign, Coins, Boxes } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

type Props = {
  params: Promise<{
    id: string
  }>
}

type SalesTooltipProps = {
  active?: boolean
  payload?: Array<{
    value: number
    color?: string
    payload?: {
      fecha?: string
      cantidad?: number
    }
  }>
  label?: string
}

type ApiProducto = {
  id: number
  codigo_producto: string | null
  codigo_barras: string | null
  nombre: string
  precio_compra: number | string | null
  precio_venta: number | string | null
  porcentaje_ganancia?: number | string | null
  id_proveedor: number | null
  id_categoria: number | null
  stock: number | null
}

type ProductoDetalle = {
  id: number
  nombre: string
  codigo: string
  codigo_barras: string
  precio: number
  costo: number
  precio_publico: number
  stock: number
  ventas: { fecha: string; cantidad: number }[]
}

function SalesTooltip({ active, payload, label }: SalesTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const item = payload[0]

  return (
    <div className="bg-popover text-popover-foreground rounded-lg border border-border px-3 py-2 shadow-md">
      <p className="mb-1 text-sm font-semibold">{label}</p>
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: "#6366f1" }}
        />
        <span className="text-sm text-muted-foreground">Unidades:</span>
        <span className="text-sm font-bold">{item.value}</span>
      </div>
    </div>
  )
}

function mapApiProductoToDetalle(item: ApiProducto): ProductoDetalle {
  return {
    id: item.id,
    nombre: item.nombre ?? "",
    codigo: item.codigo_producto ?? "",
    codigo_barras: item.codigo_barras ?? "",
    precio: Number(item.precio_venta ?? 0),
    costo: Number(item.precio_compra ?? 0),
    precio_publico: Number(item.precio_venta ?? 0),
    stock: Number(item.stock ?? 0),
    ventas: [
      { fecha: "Lun", cantidad: 5 },
      { fecha: "Mar", cantidad: 8 },
      { fecha: "Mié", cantidad: 4 },
      { fecha: "Jue", cantidad: 10 },
      { fecha: "Vie", cantidad: 6 },
      { fecha: "Sáb", cantidad: 12 },
      { fecha: "Dom", cantidad: 3 },
    ],
  }
}

export default function ProductoDetallePage({ params }: Props) {
  const { id } = use(params)

  const [isEditing, setIsEditing] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [producto, setProducto] = useState<ProductoDetalle | null>(null)

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(`${API_URL}/productos/${id}`, {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("No se pudo cargar el producto")
        }

        const result: ApiProducto = await response.json()
        setProducto(mapApiProductoToDetalle(result))
      } catch (err) {
        console.error(err)
        setError("No se pudo cargar la información del producto")
      } finally {
        setLoading(false)
      }
    }

    fetchProducto()
  }, [id])

  const handleInputChange = (
    field:
      | "nombre"
      | "codigo"
      | "codigo_barras"
      | "precio"
      | "costo"
      | "precio_publico",
    value: string
  ) => {
    if (!producto) return

    setProducto((prev) =>
      prev
        ? {
            ...prev,
            [field]:
              field === "precio" ||
              field === "costo" ||
              field === "precio_publico"
                ? Number(value)
                : value,
          }
        : prev
    )
  }

  const handleToggleEdit = async () => {
    if (!producto) return

    if (isEditing) {
      try {
        setSaving(true)
        setError("")

        const payload = {
          codigo_producto: producto.codigo.trim(),
          codigo_barras: producto.codigo_barras.trim(),
          nombre: producto.nombre.trim(),
          precio_compra: producto.costo,
          precio_venta: producto.precio_publico,
        }

        const updateResponse = await fetch(
          `${API_URL}/productos/${producto.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        )

        const updateResult = await updateResponse.json()

        if (!updateResponse.ok) {
          throw new Error(
            updateResult?.message || "No se pudo actualizar el producto"
          )
        }

        // volver a pedir el producto completo con stock
        const refreshResponse = await fetch(
          `${API_URL}/productos/${producto.id}`,
          {
            cache: "no-store",
          }
        )

        const refreshResult = await refreshResponse.json()

        if (!refreshResponse.ok) {
          throw new Error(
            refreshResult?.message || "No se pudo recargar el producto"
          )
        }

        setProducto(mapApiProductoToDetalle(refreshResult))
        setShowAlert(true)

        setTimeout(() => {
          setShowAlert(false)
        }, 2500)

        setIsEditing(false)
      } catch (err) {
        console.error(err)
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el producto"
        )
      } finally {
        setSaving(false)
      }

      return
    }

    setIsEditing(true)
  }
  const utilidad = useMemo(() => {
    if (!producto) return 0
    return producto.precio_publico - producto.costo
  }, [producto])

  const margenPorcentaje = useMemo(() => {
    if (!producto?.precio_publico) return "0.0"
    return ((utilidad / producto.precio_publico) * 100).toFixed(1)
  }, [producto, utilidad])

  const margenData = useMemo(() => {
    if (!producto) return []

    return [
      { nombre: "Costo", valor: producto.costo },
      { nombre: "Precio Publico", valor: producto.precio },
      { nombre: "Utilidad", valor: utilidad },
    ]
  }, [producto, utilidad])

  const inputClassName =
    "h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring/40"

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
        Cargando producto...
      </div>
    )
  }

  if (error && !producto) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-red-500">
        {error}
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
        Producto no encontrado
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden bg-background p-4 xl:p-5">
      <div className="mx-auto flex h-full max-w-[90%] flex-col gap-4">
        {showAlert && (
          <Alert className="border-green-400 bg-green-400">
            <CheckCircle2 className="h-4 w-4 text-green-800" />
            <AlertTitle className="text-green-800">
              Cambios guardados
            </AlertTitle>
            <AlertDescription className="text-green-800">
              La información del producto se actualizó correctamente.
            </AlertDescription>
          </Alert>
        )}

        {error && producto && (
          <Alert className="border-red-400 bg-red-400">
            <CheckCircle2 className="h-4 w-4 text-red-800" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div>
          <h1 className="text-3xl font-bold text-foreground">Detalles</h1>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">
                Información del producto
              </h2>

              <button
                type="button"
                onClick={handleToggleEdit}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4" />
                    {saving ? "Guardando..." : "Guardar"}
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4" />
                    Editar
                  </>
                )}
              </button>
            </div>

            <div className="grid gap-4 text-sm sm:text-base">
              <div className="grid grid-cols-[170px_1fr] items-center gap-3">
                <span className="flex items-center gap-2 font-semibold">
                  <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                  Nombre:
                </span>
                {isEditing ? (
                  <input
                    className={inputClassName}
                    value={producto.nombre}
                    onChange={(e) =>
                      handleInputChange("nombre", e.target.value)
                    }
                  />
                ) : (
                  <span>{producto.nombre}</span>
                )}
              </div>

              <div className="grid grid-cols-[170px_1fr] items-center gap-3">
                <span className="flex items-center gap-2 font-semibold">
                  <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                  Código del producto:
                </span>
                {isEditing ? (
                  <input
                    className={inputClassName}
                    value={producto.codigo}
                    onChange={(e) =>
                      handleInputChange("codigo", e.target.value)
                    }
                  />
                ) : (
                  <span>{producto.codigo}</span>
                )}
              </div>

              <div className="grid grid-cols-[170px_1fr] items-center gap-3">
                <span className="flex items-center gap-2 font-semibold">
                  <Barcode className="mr-2 h-4 w-4 text-muted-foreground" />
                  Código de barras:
                </span>
                {isEditing ? (
                  <input
                    className={inputClassName}
                    value={producto.codigo_barras}
                    onChange={(e) =>
                      handleInputChange("codigo_barras", e.target.value)
                    }
                  />
                ) : (
                  <span>
                    {producto.codigo_barras || "Sin código de barras"}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-[170px_1fr] items-center gap-3">
                <span className="flex items-center gap-2 font-semibold">
                  <Coins className="mr-2 h-4 w-4 text-muted-foreground" />
                  Costo:
                </span>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClassName}
                    value={producto.costo}
                    onChange={(e) => handleInputChange("costo", e.target.value)}
                  />
                ) : (
                  <span>${producto.costo}</span>
                )}
              </div>

              <div className="grid grid-cols-[170px_1fr] items-center gap-3">
                <span className="flex items-center gap-2 font-semibold">
                  <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                  Precio público:
                </span>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClassName}
                    value={producto.precio_publico}
                    onChange={(e) =>
                      handleInputChange("precio_publico", e.target.value)
                    }
                  />
                ) : (
                  <span>${producto.precio_publico}</span>
                )}
              </div>

              <div className="grid grid-cols-[170px_1fr] items-center gap-3">
                <span className="flex items-center gap-2 font-semibold">
                  <Boxes className="mr-2 h-4 w-4 text-muted-foreground" />
                  Stock:
                </span>
                <span
                  className={`font-semibold ${
                    producto.stock === 0
                      ? "text-red-500"
                      : producto.stock < 10
                        ? "text-amber-500"
                        : "text-green-600"
                  }`}
                >
                  {producto.stock}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Margen de ganancia</h2>
                <p className="text-sm text-muted-foreground">
                  Comparativo entre costo, precio y utilidad por pieza
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background px-4 py-3 text-right">
                <p className="text-xs text-muted-foreground">Margen actual</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {margenPorcentaje}%
                </p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Costo</p>
                <p className="text-lg font-bold">${producto.costo}</p>
              </div>

              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Precio público</p>
                <p className="text-lg font-bold">${producto.precio_publico}</p>
              </div>

              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Utilidad</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  ${utilidad}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Margen</p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {margenPorcentaje}%
                </p>
              </div>
            </div>

            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={margenData}
                  margin={{ top: 6, right: 8, left: -24, bottom: 0 }}
                  barCategoryGap={26}
                >
                  <CartesianGrid
                    stroke="hsl(var(--border))"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="nombre"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Bar
                    dataKey="valor"
                    radius={[10, 10, 0, 0]}
                    activeBar={false}
                  >
                    <Cell fill="#6366f1" />
                    <Cell fill="#22c55e" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Ventas últimos 7 días</h2>
            <p className="text-sm text-muted-foreground">
              Comportamiento reciente del producto
            </p>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={producto.ventas}
                margin={{ top: 6, right: 8, left: -24, bottom: 12 }}
                barCategoryGap={22}
              >
                <CartesianGrid
                  stroke="hsl(var(--border))"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="fecha"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<SalesTooltip />}
                  wrapperStyle={{ outline: "none" }}
                />
                <Bar
                  dataKey="cantidad"
                  name="Unidades"
                  radius={[10, 10, 0, 0]}
                  activeBar={false}
                >
                  <Cell fill="#6366f1" />
                  <Cell fill="#22c55e" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#06b6d4" />
                  <Cell fill="#8b5cf6" />
                  <Cell fill="#ec4899" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
