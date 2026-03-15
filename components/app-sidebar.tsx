"use client"

import { useEffect, useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
  SidebarFooter,
  SidebarMenuButton,
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
  Package,
  Package2,
  Boxes,
  Users,
  BarChart3,
  User2,
  SettingsIcon,
  Moon,
  Truck,
} from "lucide-react"

export default function AppSidebar() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const { theme, setTheme } = useTheme()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? theme === "dark" : false

  const logoIcon = isDark ? "/IconoLogoOscuro.svg" : "/IconoLogoClaro.svg"
  const logoFull = isDark ? "/LogoOscuro.svg" : "/LogoClaro.svg"

  return (
    <Sidebar collapsible="icon" className="bg-background">
      <SidebarHeader className="flex justify-center py-4">
        {collapsed ? (
          <img src={logoIcon} alt="logo" className="h-16 w-auto" />
        ) : (
          <img src={logoFull} alt="logo" className="h-32 w-auto px-4" />
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="space-y-3 px-2">
          <div className="px-2 py-2">
            {collapsed ? (
              <span className="block text-center text-base font-bold text-muted-foreground">
                M
              </span>
            ) : (
              <h1 className="text-base font-bold text-muted-foreground">
                Menu
              </h1>
            )}
          </div>

          <SidebarMenuItem>
            <Link
              href="/dashboard"
              className={`flex h-14 w-full items-center rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground ${
                collapsed ? "justify-center px-0" : "gap-4 px-4"
              }`}
            >
              <LayoutDashboard className="h-7 w-7 shrink-0" />
              {!collapsed && (
                <span className="text-lg font-medium">Dashboard</span>
              )}
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link
              href="/pedidos"
              className={`flex h-14 w-full items-center rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground ${
                collapsed ? "justify-center px-0" : "gap-4 px-4"
              }`}
            >
              <ShoppingCart className="h-7 w-7 shrink-0" />
              {!collapsed && (
                <span className="text-lg font-medium">Pedidos</span>
              )}
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link
              href="/ventas"
              className={`flex h-14 w-full items-center rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground ${
                collapsed ? "justify-center px-0" : "gap-4 px-4"
              }`}
            >
              <Package className="h-7 w-7 shrink-0" />
              {!collapsed && (
                <span className="text-lg font-medium">Ventas</span>
              )}
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link
              href="/productos"
              className={`flex h-14 w-full items-center rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground ${
                collapsed ? "justify-center px-0" : "gap-4 px-4"
              }`}
            >
              <Package2 className="h-7 w-7 shrink-0" />
              {!collapsed && (
                <span className="text-lg font-medium">Productos</span>
              )}
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link
              href="/inventario"
              className={`flex h-14 w-full items-center rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground ${
                collapsed ? "justify-center px-0" : "gap-4 px-4"
              }`}
            >
              <Boxes className="h-7 w-7 shrink-0" />
              {!collapsed && (
                <span className="text-lg font-medium">Inventario</span>
              )}
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link
              href="/clientes"
              className={`flex h-14 w-full items-center rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground ${
                collapsed ? "justify-center px-0" : "gap-4 px-4"
              }`}
            >
              <Users className="h-7 w-7 shrink-0" />
              {!collapsed && (
                <span className="text-lg font-medium">Clientes</span>
              )}
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link
              href="/provedores"
              className={`flex h-14 w-full items-center rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground ${
                collapsed ? "justify-center px-0" : "gap-4 px-4"
              }`}
            >
              <Truck className="h-7 w-7 shrink-0" />
              {!collapsed && (
                <span className="text-lg font-medium">Provedores</span>
              )}
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link
              href="/reportes"
              className={`flex h-14 w-full items-center rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground ${
                collapsed ? "justify-center px-0" : "gap-4 px-4"
              }`}
            >
              <BarChart3 className="h-7 w-7 shrink-0" />
              {!collapsed && (
                <span className="text-lg font-medium">Reportes</span>
              )}
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex w-full items-center rounded-2xl border border-border bg-background px-4 py-3 text-foreground shadow-sm transition hover:bg-accent ${
                collapsed ? "justify-center" : "gap-3"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <User2 className="h-5 w-5" />
              </div>

              {!collapsed && (
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-lg font-semibold">Usuario</span>
                  <span className="text-sm text-muted-foreground">
                    Mi cuenta
                  </span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-64 rounded-2xl border border-border bg-background p-3 text-foreground shadow-xl"
          >
            <div className="flex items-center justify-between rounded-lg px-3 py-2">
              <Moon className="mr-2 h-4 w-4" />
              <Label
                htmlFor="dark-mode"
                className="cursor-pointer text-base font-semibold text-foreground"
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
              <SettingsIcon className="mr-2 h-4 w-4" />
              Configuración
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2 text-red-500 focus:bg-accent focus:text-red-500">
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
