"use client"

import { use, useMemo, useState } from "react"
import providersData from "../providers.json"
import {
  Activity,
  BadgePercent,
  Boxes,
  Building2,
  ClipboardList,
  Mail,
  PackageSearch,
  Pencil,
  Phone,
  Save,
  TrendingUp,
  Truck,
  User2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

type Provider = {
  id: number
  nombre: string
  telefono: string
  correo: string
  empresa: string
  referencia: string
}

type Props = {
  params: Promise<{
    id: string
  }>
}

export default function ProveedorDetallePage({ params }: Props) {
  const { id } = use(params)

  const proveedorInicial = (providersData as Provider[]).find(
    (p) => String(p.id) === id
  )

  const [editMode, setEditMode] = useState(false)
  const [proveedor, setProveedor] = useState<Provider | null>(
    proveedorInicial ?? null
  )

  if (!proveedor) {
    return (
      <div className="p-6 text-base font-medium">Proveedor no encontrado</div>
    )
  }

  const handleChange = (field: keyof Provider, value: string) => {
    setProveedor((prev) =>
      prev
        ? {
            ...prev,
            [field]: field === "id" ? Number(value) : value,
          }
        : prev
    )
  }

  const metricasProveedor = useMemo(() => {
    const base = proveedor.id || 1

    const productosRegistrados = 12 + (base % 18)
    const rotacion = ["Baja", "Media", "Alta"][base % 3]
    const rotacionValor =
      rotacion === "Alta" ? 82 : rotacion === "Media" ? 56 : 28
    const surtidoMensual = 3 + (base % 9)
    const participacionInventario = 8 + (base % 27)

    return {
      productosRegistrados,
      rotacion,
      rotacionValor,
      surtidoMensual,
      participacionInventario,
    }
  }, [proveedor.id])

  const infoResumen = useMemo(() => {
    return {
      tieneCorreo: proveedor.correo ? "Sí" : "No",
      tieneTelefono: proveedor.telefono ? "Sí" : "No",
      empresa: proveedor.empresa || "Sin empresa",
      referencia: proveedor.referencia || "Sin referencia",
    }
  }, [proveedor])

  const handleGuardar = () => {
    setEditMode(false)
    console.log("Proveedor actualizado:", proveedor)
  }

  return (
    <div className="flex h-full w-full flex-col gap-6 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Detalle del proveedor</h1>
          <p className="text-sm text-muted-foreground">
            Consulta y edita la información del proveedor
          </p>
        </div>

        {!editMode ? (
          <Button
            onClick={() => setEditMode(true)}
            className="h-12 min-w-[170px] gap-2 text-base"
          >
            <Pencil className="h-5 w-5" />
            Editar
          </Button>
        ) : (
          <Button
            onClick={handleGuardar}
            className="h-12 min-w-[170px] gap-2 text-base"
          >
            <Save className="h-5 w-5" />
            Guardar
          </Button>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card className="overflow-hidden border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <Truck className="h-8 w-8 text-muted-foreground" />
                  </div>

                  <div>
                    <CardTitle className="text-2xl font-bold">
                      {proveedor.nombre}
                    </CardTitle>
                  </div>
                </div>

                <Badge
                  variant="secondary"
                  className="w-fit px-4 py-1.5 text-sm"
                >
                  ID #{proveedor.id}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold">Nombre</Label>
                  <div className="relative">
                    <User2 className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={proveedor.nombre}
                      onChange={(e) => handleChange("nombre", e.target.value)}
                      disabled={!editMode}
                      className="h-12 pl-10 !text-xl"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-sm font-semibold">Empresa</Label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={proveedor.empresa}
                      onChange={(e) => handleChange("empresa", e.target.value)}
                      disabled={!editMode}
                      className="h-12 pl-10 !text-xl"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-sm font-semibold">Teléfono</Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={proveedor.telefono}
                      onChange={(e) => handleChange("telefono", e.target.value)}
                      disabled={!editMode}
                      className="h-12 pl-10 !text-xl"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-sm font-semibold">Correo</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={proveedor.correo}
                      onChange={(e) => handleChange("correo", e.target.value)}
                      disabled={!editMode}
                      className="h-12 pl-10 !text-xl"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-2">
                <Label className="text-sm font-semibold">Referencia</Label>
                <div className="relative">
                  <ClipboardList className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={proveedor.referencia}
                    onChange={(e) => handleChange("referencia", e.target.value)}
                    disabled={!editMode}
                    className="h-12 pl-10 !text-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border shadow-sm">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Productos de este proveedor
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {metricasProveedor.productosRegistrados}
                  </p>
                </div>
                <Boxes className="h-8 w-8 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">Rotación</p>
                  <p className="mt-1 text-2xl font-bold">
                    {metricasProveedor.rotacion}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Surtidos este mes
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {metricasProveedor.surtidoMensual}
                  </p>
                </div>
                <PackageSearch className="h-8 w-8 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Participación en inventario
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {metricasProveedor.participacionInventario}%
                  </p>
                </div>
                <BadgePercent className="h-8 w-8 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>

          <Card className="border py-4 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">
                Rendimiento del proveedor
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="w-auto rounded-2xl border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <p className="font-semibold">Nivel de rotación</p>
                </div>
                <div className="space-y-2">
                  <Progress value={metricasProveedor.rotacionValor} />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{metricasProveedor.rotacion}</span>
                    <span>{metricasProveedor.rotacionValor}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border p-4">
                <p className="text-sm text-muted-foreground">Empresa</p>
                <p className="text-base font-semibold">{infoResumen.empresa}</p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-sm text-muted-foreground">
                  Correo registrado
                </p>
                <p className="text-base font-semibold">
                  {infoResumen.tieneCorreo}
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-sm text-muted-foreground">
                  Teléfono registrado
                </p>
                <p className="text-base font-semibold">
                  {infoResumen.tieneTelefono}
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-sm text-muted-foreground">Referencia</p>
                <p className="text-base font-semibold">
                  {infoResumen.referencia}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Estado de relación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border p-4">
                <p className="text-sm text-muted-foreground">
                  Nivel de importancia
                </p>
                <p className="mt-2 text-lg font-bold">
                  {metricasProveedor.productosRegistrados >= 20
                    ? "Proveedor clave"
                    : metricasProveedor.productosRegistrados >= 10
                      ? "Proveedor frecuente"
                      : "Proveedor secundario"}
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-sm text-muted-foreground">
                  Comportamiento comercial
                </p>
                <p className="mt-2 text-lg font-bold">
                  {metricasProveedor.rotacion}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Basado en movimiento de productos y frecuencia de surtido.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
