import {
  Users,
  ShieldCheck,
  KeyRound,
  UserPlus,
  ChevronRight,
  Search,
  Ban,
  Save,
  Hash,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ConfiguracionPage() {
  return (
    <div className="flex min-h-screen w-full flex-col gap-6 bg-background p-6">
      {/* Usuarios y roles */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-primary/10 p-3">
              <Users className="h-6 w-6" />
            </div>

            <div>
              <CardTitle className="text-2xl">Usuarios y roles</CardTitle>
              <CardDescription className="mt-1 text-base">
                Crea usuarios, asigna permisos y controla el acceso al sistema.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* métricas */}
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              title="Usuarios activos"
              value="12"
              subtitle="2 administradores, 4 cajeros, 6 vendedores"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />

            <InfoCard
              title="Roles creados"
              value="4"
              subtitle="Admin, gerente, cajero y almacén"
              icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
            />

            <InfoCard
              title="Permisos críticos"
              value="8"
              subtitle="Corte, devoluciones, descuentos, eliminación, etc."
              icon={<KeyRound className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          {/* acciones */}
          <div className="space-y-3">
            <QuickAccessItem
              icon={UserPlus}
              title="Crear nuevo usuario"
              subtitle="Registrar cajeros, vendedores, administradores o personal de almacén."
            />

            <QuickAccessItem
              icon={ShieldCheck}
              title="Asignar roles y permisos"
              subtitle="Definir quién puede vender, editar precios, cancelar tickets o ver reportes."
            />

            <QuickAccessItem
              icon={KeyRound}
              title="Restablecer contraseñas"
              subtitle="Administrar accesos, bloqueo de sesión y recuperación de cuentas."
            />
          </div>
        </CardContent>
      </Card>

      {/* Número de transferencia */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Número de transferencia</CardTitle>
          <CardDescription>
            Guarda el número o referencia bancaria que usará el administrador.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Hash className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ej. 1234567890 / CLABE / referencia"
                className="pl-9"
              />
            </div>

            <Button className="rounded-xl">
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cancelar ventas */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Cancelar ventas</CardTitle>
          <CardDescription>
            Busca un folio, ticket o venta para cancelarla manualmente.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por folio, ticket o ID de venta"
                className="pl-9"
              />
            </div>

            <Button variant="destructive" className="rounded-xl">
              <Ban className="mr-2 h-4 w-4" />
              Cancelar venta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{title}</span>
        {icon}
      </div>

      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
}

function QuickAccessItem({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType
  title: string
  subtitle: string
}) {
  return (
    <button className="flex w-full items-center justify-between rounded-2xl border p-4 text-left transition hover:bg-muted/40">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-muted p-3">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </button>
  )
}
