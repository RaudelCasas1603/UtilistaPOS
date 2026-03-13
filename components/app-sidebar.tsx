"use client"

import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"

export default function AppSidebar() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="mt-10">
        {!collapsed && (
          <h1 className="text-center text-xl font-bold">Mi App</h1>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="font-serif- mt-8 space-y-8 text-2xl">
          <SidebarHeader className="mt-10 flex justify-center">
            {collapsed ? (
              <span className="text-md text-center font-bold text-gray-200">
                M
              </span>
            ) : (
              <h1 className="text-md text-center font-bold text-gray-200">
                Menu
              </h1>
            )}
          </SidebarHeader>
          <SidebarMenuItem className="flex items-center gap-3 px-3">
            <Image
              src="/src/icons/dashboardIcon.svg"
              alt="dashboard"
              width={24}
              height={24}
            />

            {!collapsed && <span className="font-medium">Dashboard</span>}
          </SidebarMenuItem>
          <SidebarMenuItem className="flex items-center gap-3 px-3">
            <Image
              src="/src/icons/dashboardIcon.svg"
              alt="dashboard"
              width={24}
              height={24}
            />

            {!collapsed && <span className="font-medium">Dashboard</span>}
          </SidebarMenuItem>
          <SidebarMenuItem className="flex items-center gap-3 px-3">
            <Image
              src="/src/icons/dashboardIcon.svg"
              alt="dashboard"
              width={24}
              height={24}
            />

            {!collapsed && <span className="font-medium">Ventas</span>}
          </SidebarMenuItem>
          <SidebarMenuItem className="flex items-center gap-3 px-3">
            <Image
              src="/src/icons/dashboardIcon.svg"
              alt="dashboard"
              width={24}
              height={24}
            />

            {!collapsed && <span className="font-medium">Pedidos</span>}
          </SidebarMenuItem>
          <SidebarMenuItem className="flex items-center gap-3 px-3">
            <Image
              src="/src/icons/dashboardIcon.svg"
              alt="dashboard"
              width={24}
              height={24}
            />

            {!collapsed && <span className="font-medium">Inventario</span>}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
