"use client"

import Image from "next/image"
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
import { useTheme } from "next-themes"

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  BarChart3,
  Settings,
  User2,
  SettingsIcon,
} from "lucide-react"

export default function AppSidebar() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const { theme, setTheme } = useTheme()

  const isDark = theme === "dark"
  const logoIcon = isDark ? "/IconoLogoOscuro.svg" : "/IconoLogoClaro.svg"

  const logoFull = isDark ? "/LogoOscuro.svg" : "/LogoClaro.svg"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="mt-8 flex justify-center border-b border-muted pb-4">
        {collapsed ? (
          <img src={logoIcon} alt="logo" className="h-12" />
        ) : (
          <img src={logoFull} alt="logo" className="h-12 px-4" />
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="font-serif- mt-8 space-y-8 text-2xl">
          <SidebarHeader className="mt-10 flex justify-center">
            {collapsed ? (
              <span className="text-md text-center font-bold text-foreground">
                M
              </span>
            ) : (
              <h1 className="text-md text-center font-bold text-foreground">
                Menu
              </h1>
            )}
          </SidebarHeader>
          <SidebarMenuItem className="flex items-center gap-3 px-3">
            <LayoutDashboard size={24} className="text-foreground" />
            {!collapsed && <span className="font-medium">Dashboard</span>}
          </SidebarMenuItem>
          <SidebarMenuItem className="flex items-center gap-3 px-3">
            <ShoppingCart size={24} className="text-foreground" />

            {!collapsed && <span className="font-medium">Pedidos</span>}
          </SidebarMenuItem>
          <SidebarMenuItem className="flex items-center gap-3 px-3">
            <Package size={24} className="text-foreground" />

            {!collapsed && <span className="font-medium">Ventas</span>}
          </SidebarMenuItem>
          <SidebarMenuItem className="flex items-center gap-3 px-3">
            <Package size={24} className="text-foreground" />
            {!collapsed && <span className="font-medium">Productos</span>}
          </SidebarMenuItem>
          <SidebarMenuItem className="flex items-center gap-3 px-3">
            <Boxes size={24} className="text-foreground" />

            {!collapsed && <span className="font-medium">Inventario</span>}
          </SidebarMenuItem>
          <SidebarMenuItem className="flex items-center gap-3 px-3">
            <Users size={24} className="text-foreground" />

            {!collapsed && <span className="font-medium">Clientes</span>}
          </SidebarMenuItem>
          <SidebarMenuItem className="flex items-center gap-3 px-3">
            <BarChart3 size={24} className="text-foreground" />

            {!collapsed && <span className="font-medium">Reportes</span>}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="flex items-center gap-2">
              <User2 size={20} />
              {!collapsed && <span>Usuario</span>}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Tema claro
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Tema oscuro
            </DropdownMenuItem>

            <DropdownMenuItem>
              <SettingsIcon size={18} className="mr-2" />
              Configuración
            </DropdownMenuItem>

            <DropdownMenuItem className="text-red-500">
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
