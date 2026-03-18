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

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 px-6 pt-4 pb-2">
            <SidebarTrigger />
          </div>

          <div className="min-h-0 flex-1 overflow-hidden px-6 pb-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
