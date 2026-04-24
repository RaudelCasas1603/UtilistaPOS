import { Card, CardHeader, CardTitle } from "@/components/ui/card"

import { ShoppingCart, Wallet, Boxes } from "lucide-react"

import Link from "next/link"

const reportes = [
  {
    title: "Ventas",
    icon: ShoppingCart,
    ruta: "/ventas",
  },
  {
    title: "Corte de Caja",
    icon: Wallet,
    ruta: "/corte-caja",
  },
  {
    title: "Inventario",
    icon: Boxes,
    ruta: "/inventario",
  },
]

export default function ReportesPage() {
  return (
    <>
      {/* Header */}
      <div className="p-6 text-left">
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="mt-2 text-muted-foreground">
          Selecciona el reporte que deseas consultar
        </p>
      </div>

      {/* Cards centradas */}
      <div className="flex h-[80%] items-center justify-center">
        <div className="grid w-full max-w-5xl grid-cols-1 gap-8 px-6 md:grid-cols-3">
          {reportes.map((reporte, index) => {
            const Icon = reporte.icon

            return (
              <Link key={index} href={`/admin/reportes${reporte.ruta}`}>
                <Card className="flex h-52 cursor-pointer items-center justify-center rounded-2xl transition-all hover:shadow-xl">
                  <CardHeader className="flex w-48 flex-col items-center justify-center gap-4 text-center">
                    <Icon className="h-14 w-14 text-primary" />
                    <CardTitle className="text-lg">{reporte.title}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
