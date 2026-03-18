"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />

        <main className="relative flex min-w-0 flex-1 overflow-hidden">
          <div className="absolute top-4 left-4 z-20">
            <SidebarTrigger />
          </div>

          <div className="h-full w-full overflow-hidden p-6 pt-16">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
