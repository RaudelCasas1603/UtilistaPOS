"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-4 text-gray-600">
        Bienvenido al panel de control. Aquí puedes gestionar tus ventas,
        productos y más.
      </p>
    </div>
  )
}
