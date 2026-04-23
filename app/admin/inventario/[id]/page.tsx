"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import {
  Pencil,
  Save,
  Package,
  Boxes,
  TriangleAlert,
  Tag,
  Barcode,
  ChartColumn,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react"

type InventarioProducto = {
  id: number
  id_producto: number
  stock_actual: number
  stock_minimo: number
  stock_deseado: number
  codigo_producto: string
  codigo_barras: string
  nombre: string
  precio?: number
  costo?: number
  precio_publico?: number
  precio_venta?: number
  categoria?: string
  ventasHoy?: number
  ventasSemana?: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export default function InventarioProductoPage() {
  const params = useParams()
  const id = params?.id as string

  const [producto, setProducto] = useState<InventarioProducto | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)

  const [stockActual, setStockActual] = useState(0)
  const [stockMinimo, setStockMinimo] = useState(0)
  const [stockDeseado, setStockDeseado] = useState(0)
  const [motivo, setMotivo] = useState("")

  const [alertSuccess, setAlertSuccess] = useState(false)
  const [alertError, setAlertError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        setLoading(true)
        setAlertError("")

        const res = await fetch(`${API_URL}/inventario/${id}`, {
          method: "GET",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) {
          throw new Error("No se pudo obtener el producto de inventario")
        }

        const data: InventarioProducto = await res.json()

        setProducto(data)
        setStockActual(Number(data.stock_actual ?? 0))
        setStockMinimo(Number(data.stock_minimo ?? 0))
        setStockDeseado(Number(data.stock_deseado ?? 0))
      } catch (error) {
        console.error(error)
        setAlertError("No se pudo cargar la información del inventario.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProducto()
    }
  }, [id])

  const handleGuardar = async () => {
    if (!producto) return

    const motivoLimpio = motivo.trim()

    if (!motivoLimpio) {
      setAlertError("Debes escribir el motivo del ajuste de inventario.")
      return
    }

    try {
      setSaving(true)
      setAlertError("")
      setAlertSuccess(false)

      const res = await fetch(`${API_URL}/inventario/${producto.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_producto: producto.id_producto,
          stock_actual: Number(stockActual),
          stock_minimo: Number(stockMinimo),
          stock_deseado: Number(stockDeseado),
          motivo: motivoLimpio,
          id_usuario: 1,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(
          errorData?.message || "No se pudo actualizar el inventario"
        )
      }

      const data = await res.json()

      setProducto(data)
      setStockActual(Number(data.stock_actual ?? 0))
      setStockMinimo(Number(data.stock_minimo ?? 0))
      setStockDeseado(Number(data.stock_deseado ?? 0))

      setMotivo("")
      setEditMode(false)
      setAlertSuccess(true)

      setTimeout(() => {
        setAlertSuccess(false)
      }, 3000)
    } catch (error: any) {
      console.error(error)
      setAlertError(error.message || "Ocurrió un error al guardar los cambios.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Cargando inventario...</p>
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="flex h-full flex-col gap-4 p-6">
        {alertError && (
          <Alert className="border-red-400 bg-red-400">
            <XCircle className="h-4 w-4 text-red-800" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-800">
              {alertError}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              No se encontró el producto de inventario.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const estado =
    stockActual === 0
      ? "Agotado"
      : stockActual <= stockMinimo
        ? "Bajo stock"
        : "Disponible"

  const faltante = Math.max(stockDeseado - stockActual, 0)

  const badgeEstado =
    stockActual === 0 ? (
      <Badge variant="destructive" className="px-3 py-1 text-sm">
        Agotado
      </Badge>
    ) : stockActual <= stockMinimo ? (
      <Badge className="bg-yellow-500 px-3 py-1 text-sm text-white hover:bg-yellow-500">
        Bajo stock
      </Badge>
    ) : (
      <Badge className="bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-600">
        Disponible
      </Badge>
    )

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      {alertSuccess && (
        <Alert className="border-green-400 bg-green-400">
          <CheckCircle2 className="h-4 w-4 text-green-800" />
          <AlertTitle className="text-green-800">Cambios guardados</AlertTitle>
          <AlertDescription className="text-green-800">
            El stock del producto se actualizó correctamente.
          </AlertDescription>
        </Alert>
      )}

      {alertError && (
        <Alert className="border-red-400 bg-red-400">
          <XCircle className="h-4 w-4 text-red-800" />
          <AlertTitle className="text-red-800">Error</AlertTitle>
          <AlertDescription className="text-red-800">
            {alertError}
          </AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden border shadow-sm">
        <CardContent className="p-0">
          <div className="flex h-full flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Package className="h-8 w-8 text-primary" />
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Producto</p>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {producto.nombre}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {badgeEstado}
                  <Badge variant="outline" className="px-3 py-1">
                    {producto.categoria || "Sin categoría"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
              <div className="rounded-xl border bg-muted/30 p-3">
                <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span className="text-xs">SKU</span>
                </div>
                <p className="font-semibold">{producto.codigo_producto}</p>
              </div>

              <div className="rounded-xl border bg-muted/30 p-3">
                <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                  <Barcode className="h-4 w-4" />
                  <span className="text-xs">Código de barras</span>
                </div>
                <p className="font-semibold">{producto.codigo_barras}</p>
              </div>

              <div className="rounded-xl border bg-muted/30 p-3 sm:col-span-2">
                <p className="text-xs text-muted-foreground">Precio de venta</p>
                <p className="text-xl font-bold">
                  ${Number(producto.precio_venta ?? 0)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid flex-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold tracking-tight">
              Control de inventario
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border bg-gradient-to-br from-background to-muted/30 p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Boxes className="h-4 w-4" />
                  <span className="text-sm font-medium">Stock actual</span>
                </div>

                {editMode ? (
                  <Input
                    type="number"
                    value={stockActual}
                    onChange={(e) => setStockActual(Number(e.target.value))}
                    className="h-12 !text-3xl font-bold tracking-tight"
                  />
                ) : (
                  <p className="text-4xl leading-none font-extrabold tracking-tight">
                    {stockActual}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border bg-gradient-to-br from-background to-muted/30 p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <TriangleAlert className="h-4 w-4" />
                  <span className="text-sm font-medium">Stock mínimo</span>
                </div>

                {editMode ? (
                  <Input
                    type="number"
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(Number(e.target.value))}
                    className="h-12 !text-3xl font-bold tracking-tight"
                  />
                ) : (
                  <p className="text-4xl leading-none font-extrabold tracking-tight">
                    {stockMinimo}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border bg-gradient-to-br from-background to-muted/30 p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <ChartColumn className="h-4 w-4" />
                  <span className="text-sm font-medium">Stock deseado</span>
                </div>

                {editMode ? (
                  <Input
                    type="number"
                    value={stockDeseado}
                    onChange={(e) => setStockDeseado(Number(e.target.value))}
                    className="h-12 !text-3xl font-bold tracking-tight"
                  />
                ) : (
                  <p className="text-4xl leading-none font-extrabold tracking-tight">
                    {stockDeseado}
                  </p>
                )}
              </div>
            </div>

            {editMode && (
              <div className="rounded-2xl border bg-muted/20 p-4">
                <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">Motivo del ajuste</span>
                </div>

                <Textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej. Ajuste manual por conteo físico, mercancía dañada, reposición, corrección de captura..."
                  className="min-h-[110px] resize-none"
                />

                <p className="mt-2 text-xs text-muted-foreground">
                  Este texto se guardará en el movimiento de inventario.
                </p>
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Estado del inventario
                </p>

                <div className="mt-3">{badgeEstado}</div>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {stockActual === 0
                    ? "El producto está agotado y necesita reposición inmediata."
                    : stockActual <= stockMinimo
                      ? "El producto ya está en nivel de alerta y conviene reponer pronto."
                      : "El producto mantiene un nivel de inventario saludable."}
                </p>
              </div>

              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Reposición sugerida
                </p>
                <p className="mt-2 text-5xl leading-none font-extrabold tracking-tight">
                  {faltante}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Unidades necesarias para llegar al stock deseado.
                </p>
              </div>
            </div>

            <div className="w-full pt-2">
              {!editMode ? (
                <Button
                  onClick={() => {
                    setEditMode(true)
                    setAlertError("")
                  }}
                  className="h-14 w-full gap-3 rounded-xl text-lg font-semibold"
                >
                  <Pencil className="h-6 w-6" />
                  Editar
                </Button>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    onClick={handleGuardar}
                    disabled={saving}
                    className="h-14 w-full gap-3 rounded-xl text-lg font-semibold"
                  >
                    <Save className="h-6 w-6" />
                    {saving ? "Guardando..." : "Guardar"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditMode(false)
                      setMotivo("")
                      setAlertError("")
                      setStockActual(Number(producto.stock_actual ?? 0))
                      setStockMinimo(Number(producto.stock_minimo ?? 0))
                      setStockDeseado(Number(producto.stock_deseado ?? 0))
                    }}
                    className="h-14 w-full rounded-xl text-lg font-semibold"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información complementaria</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">Estado actual</p>
              <p className="text-2xl font-bold">{estado}</p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">Stock faltante</p>
              <p className="text-2xl font-bold">{faltante}</p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">Lectura rápida</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Este panel te ayuda a decidir si el producto necesita
                reposición, si ya entró en zona de riesgo y cuántas unidades
                faltan para llegar al objetivo de inventario.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
