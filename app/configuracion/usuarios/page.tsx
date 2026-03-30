import { UserPlus, ShieldCheck, KeyRound, ChevronRight } from "lucide-react"

export default function AdminUsuarios() {
  return (
    <>
      {/* acciones */}
      <div className="grid grid-cols-3 h-[10%]">
        <QuickAccessItem
          icon={UserPlus}
          title="Crear nuevo usuario"
          subtitle="Registrar cajeros, vendedores, administradores"
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
    </>
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
    <button className="flex w-7/8 items-center justify-center rounded-2xl border p-4 text-left transition hover:bg-muted/40">
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
