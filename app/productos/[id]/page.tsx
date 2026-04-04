"use client"

import { use, useMemo, useState } from "react"
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

function SalesTooltip({ active, payload, label }: SalesTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const item = payload[0]

  return (
    <div className="bg-popover text-popover-foreground rounded-lg border border-border bg-border px-3 py-2 shadow-md">
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

export default function ProductoDetallePage({ params }: Props) {
  const { id } = use(params)

  const [isEditing, setIsEditing] = useState(false)
  const [showAlert, setShowAlert] = useState(false) // ✅ agregado

  const [producto, setProducto] = useState({
    id,
    nombre: "Cuaderno Profesional 100 hojas",
    codigo: "PROD-001",
    codigo_barras: "7501234567890",
    precio: 25,
    costo: 15,
    precio_publico: 30,
    stock: 120,
    ventas: [
      { fecha: "Lun", cantidad: 5 },
      { fecha: "Mar", cantidad: 8 },
      { fecha: "Mié", cantidad: 4 },
      { fecha: "Jue", cantidad: 10 },
      { fecha: "Vie", cantidad: 6 },
      { fecha: "Sáb", cantidad: 12 },
      { fecha: "Dom", cantidad: 3 },
    ],
  })

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
    setProducto((prev) => ({
      ...prev,
      [field]:
        field === "precio" || field === "costo" || field === "precio_publico"
          ? Number(value)
          : value,
    }))
  }

  const handleToggleEdit = () => {
    if (isEditing) {
      console.log("Guardando producto:", producto)

      // ✅ ALERT
      setShowAlert(true)
      setTimeout(() => {
        setShowAlert(false)
      }, 2500)
    }

    setIsEditing((prev) => !prev)
  }

  const utilidad = useMemo(
    () => producto.precio_publico - producto.costo,
    [producto.costo, producto.precio_publico]
  )

  const margenPorcentaje = useMemo(() => {
    if (!producto.precio_publico) return "0.0"
    return ((utilidad / producto.precio_publico) * 100).toFixed(1)
  }, [producto.precio_publico, utilidad])

  const margenData = useMemo(
    () => [
      { nombre: "Costo", valor: producto.costo },
      { nombre: "Precio", valor: producto.precio },
      { nombre: "Público", valor: producto.precio_publico },
      { nombre: "Utilidad", valor: utilidad },
    ],
    [producto.costo, producto.precio, producto.precio_publico, utilidad]
  )

  const inputClassName =
    "h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring/40"

  return (
    <div className="h-full overflow-hidden bg-background p-4 xl:p-5">
      <div className="mx-auto flex h-full max-w-[90%] flex-col gap-4">
        {/* ✅ ALERT */}
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
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar
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
                <span className="font-semibold">Nombre:</span>
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
                <span className="font-semibold">Código del producto:</span>
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
                <span className="font-semibold">Código de barras:</span>
                {isEditing ? (
                  <input
                    className={inputClassName}
                    value={producto.codigo_barras}
                    onChange={(e) =>
                      handleInputChange("codigo_barras", e.target.value)
                    }
                  />
                ) : (
                  <span>{producto.codigo_barras}</span>
                )}
              </div>

              <div className="grid grid-cols-[170px_1fr] items-center gap-3">
                <span className="font-semibold">Precio:</span>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClassName}
                    value={producto.precio}
                    onChange={(e) =>
                      handleInputChange("precio", e.target.value)
                    }
                  />
                ) : (
                  <span>${producto.precio}</span>
                )}
              </div>

              <div className="grid grid-cols-[170px_1fr] items-center gap-3">
                <span className="font-semibold">Costo:</span>
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
                <span className="font-semibold">Precio público:</span>
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
                <span className="font-semibold">Stock:</span>
                <span className="text-muted-foreground">{producto.stock}</span>
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
