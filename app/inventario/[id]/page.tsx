"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
} from "lucide-react"

export default function InventarioProductoPage() {
  const producto = {
    nombre: "Cuaderno Profesional Raya",
    sku: "CUA-001",
    categoria: "Papelería",
    precio: 45,
    codigoBarras: "7501234567890",
    stockActual: 18,
    stockMinimo: 10,
    stockDeseado: 30,
    ventasHoy: 4,
    ventasSemana: 21,
  }

  const [editMode, setEditMode] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [stockActual, setStockActual] = useState(producto.stockActual)
  const [stockMinimo, setStockMinimo] = useState(producto.stockMinimo)
  const [stockDeseado, setStockDeseado] = useState(producto.stockDeseado)

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

  const handleGuardar = () => {
    setEditMode(false)
    setShowAlert(true)

    setTimeout(() => {
      setShowAlert(false)
    }, 3000)
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      {showAlert && (
        <Alert className="border-green-400 bg-green-400">
          <CheckCircle2 className="h-4 w-4 text-green-800" />
          <AlertTitle className="text-green-800">Cambios guardados</AlertTitle>
          <AlertDescription className="text-green-800">
            El stock del producto se actualizó correctamente.
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
                    {producto.categoria}
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
                <p className="font-semibold">{producto.sku}</p>
              </div>

              <div className="rounded-xl border bg-muted/30 p-3">
                <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                  <Barcode className="h-4 w-4" />
                  <span className="text-xs">Código de barras</span>
                </div>
                <p className="font-semibold">{producto.codigoBarras}</p>
              </div>

              <div className="rounded-xl border bg-muted/30 p-3 sm:col-span-2">
                <p className="text-xs text-muted-foreground">Precio de venta</p>
                <p className="text-xl font-bold">${producto.precio}</p>
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
                  onClick={() => setEditMode(true)}
                  className="h-14 w-full gap-3 rounded-xl text-lg font-semibold"
                >
                  <Pencil className="h-6 w-6" />
                  Editar
                </Button>
              ) : (
                <Button
                  onClick={handleGuardar}
                  className="h-14 w-full gap-3 rounded-xl text-lg font-semibold"
                >
                  <Save className="h-6 w-6" />
                  Guardar
                </Button>
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
              <p className="text-sm text-muted-foreground">Ventas hoy</p>
              <p className="text-2xl font-bold">{producto.ventasHoy}</p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">
                Ventas últimos 7 días
              </p>
              <p className="text-2xl font-bold">{producto.ventasSemana}</p>
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
