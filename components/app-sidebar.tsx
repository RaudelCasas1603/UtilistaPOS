"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import Link from "next/link"

import {
  LayoutDashboard,
  ShoppingCart,
  Package2,
  Boxes,
  Users,
  BarChart3,
  User2,
  SettingsIcon,
  Moon,
  Truck,
  LogOut,
  FileCheck,
  HandCoins,
  History,
  TicketX,
} from "lucide-react"

type Usuario = {
  id: number
  nombre: string
  username: string
  rol: string
  estatus: string
}

export default function AppSidebar() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  useEffect(() => {
    setMounted(true)

    const rawUser = localStorage.getItem("usuario")
    if (rawUser) {
      setUsuario(JSON.parse(rawUser))
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem("usuario")
    router.replace("/auth/login")
  }

  const isDark = mounted ? theme === "dark" : false

  const logoIcon = isDark ? "/IconoLogoOscuro.svg" : "/IconoLogoClaro.svg"
  const logoFull = isDark ? "/LogoOscuro.svg" : "/LogoClaro.svg"

  const linkClass = `flex w-full items-center rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground ${
    collapsed
      ? "h-11 justify-center px-0 lg:h-12 xl:h-13 2xl:h-14"
      : "h-11 gap-3 px-3 lg:h-12 lg:gap-3 lg:px-3 xl:h-13 xl:gap-4 xl:px-4 2xl:h-14"
  }`

  const iconClass =
    "h-5 w-5 shrink-0 lg:h-6 lg:w-6 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7"

  const textClass =
    "truncate text-sm font-medium lg:text-[15px] xl:text-base 2xl:text-lg"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex shrink-0 justify-center py-3 lg:py-3 xl:py-4">
        {collapsed ? (
          <img
            src={logoIcon}
            alt="logo"
            className="h-11 w-auto lg:h-12 xl:h-14 2xl:h-16"
          />
        ) : (
          <img
            src={logoFull}
            alt="logo"
            className="h-14 w-auto px-3 lg:h-16 xl:h-18 xl:px-4 2xl:h-20"
          />
        )}
      </SidebarHeader>

      <SidebarContent className="min-h-0 overflow-x-hidden overflow-y-auto">
        <SidebarMenu className="space-y-1 px-2 pb-2 lg:space-y-1.5 xl:space-y-2 2xl:space-y-3">
          <div className="px-2 py-1 lg:py-1.5 xl:py-2">
            {collapsed ? (
              <span className="block text-center text-sm font-bold text-muted-foreground lg:text-base">
                M
              </span>
            ) : (
              <h1 className="text-sm font-bold text-muted-foreground lg:text-base">
                Menu
              </h1>
            )}
          </div>

          <SidebarMenuItem>
            <Link href="/admin/dashboard" className={linkClass}>
              <LayoutDashboard className={iconClass} />
              {!collapsed && <span className={textClass}>Dashboard</span>}
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link href="/admin/ventas" className={linkClass}>
              <ShoppingCart className={iconClass} />
              {!collapsed && <span className={textClass}>Ventas</span>}
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link href="/admin/modulo-cobro" className={linkClass}>
              <HandCoins className={iconClass} />
              {!collapsed && (
                <span className={textClass}>Modulo de cobros</span>
              )}
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link href="/admin/corte-caja" className={linkClass}>
              <FileCheck className={iconClass} />
              {!collapsed && <span className={textClass}>Corte de Caja</span>}
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link href="/admin/productos" className={linkClass}>
              <Package2 className={iconClass} />
              {!collapsed && <span className={textClass}>Productos</span>}
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link href="/admin/inventario" className={linkClass}>
              <Boxes className={iconClass} />
              {!collapsed && <span className={textClass}>Inventario</span>}
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link href="/admin/clientes" className={linkClass}>
              <Users className={iconClass} />
              {!collapsed && <span className={textClass}>Clientes</span>}
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link href="/admin/provedores" className={linkClass}>
              <Truck className={iconClass} />
              {!collapsed && <span className={textClass}>Provedores</span>}
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link href="/admin/historial-ventas" className={linkClass}>
              <History className={iconClass} />
              {!collapsed && (
                <span className={textClass}>Historial de Ventas</span>
              )}
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link href="/admin/devoluciones" className={linkClass}>
              <TicketX className={iconClass} />
              {!collapsed && <span className={textClass}>Devoluciones</span>}
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link href="/admin/reportes" className={linkClass}>
              <BarChart3 className={iconClass} />
              {!collapsed && <span className={textClass}>Reportes</span>}
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="shrink-0 p-2 lg:p-2 xl:p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex w-full items-center rounded-2xl border border-border bg-background text-foreground shadow-sm transition hover:bg-accent ${
                collapsed
                  ? "justify-center px-2 py-2"
                  : "gap-2 px-3 py-2 lg:gap-3 lg:px-3 xl:px-4 xl:py-3"
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted lg:h-9 lg:w-9 xl:h-10 xl:w-10">
                <User2 className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>

              {!collapsed && (
                <div className="flex min-w-0 flex-col items-start leading-tight">
                  <span className="max-w-full truncate text-sm font-semibold lg:text-base xl:text-lg">
                    {usuario?.nombre || "Usuario"}
                  </span>
                  <span className="max-w-full truncate text-xs text-muted-foreground capitalize lg:text-sm">
                    {usuario?.rol || "Sin rol"}
                  </span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-60 rounded-2xl border border-border bg-background p-3 text-foreground shadow-xl lg:w-64"
          >
            <div className="flex items-center justify-between rounded-lg px-3 py-2">
              <Moon className="mr-2 h-4 w-4" />
              <Label
                htmlFor="dark-mode"
                className="cursor-pointer text-sm font-semibold text-foreground lg:text-base"
              >
                Modo oscuro
              </Label>

              <Switch
                id="dark-mode"
                checked={mounted && theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
            </div>

            <div className="my-2 h-px bg-border" />

            <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2 text-foreground focus:bg-accent focus:text-accent-foreground">
              <Link
                href="/admin/configuracion"
                className="flex items-center text-sm font-semibold lg:text-base"
              >
                <SettingsIcon className="mr-5 h-5 w-5 lg:mr-6" />
                Configuración
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2 text-red-500 focus:bg-accent focus:text-red-500">
              <button
                type="button"
                onClick={handleLogout}
                className="flex text-sm font-semibold lg:text-base"
              >
                <LogOut className="mr-5 h-5 w-5 lg:mr-6" />
                Cerrar sesión
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
