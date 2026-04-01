import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { UserRound, ShoppingCart, Package, Wallet, Boxes, Calendar } from "lucide-react"

import Link from "next/link"


const reportes = [
  { title: "Ventas", description: "Reporte de ventas", icon: ShoppingCart , ruta:"/ventas"},
  { title: "Clientes", description: "Reporte de clientes", icon: UserRound, ruta:"/clientes"},
  { title: "Productos", description: "Reporte de productos", icon: Package, ruta:"/productos"},
  { title: "Corte de Caja", description: "Reportes de caja", icon: Wallet , ruta:"/corte-caja"},
  { title: "Inventario", description: "Reporte de inventario", icon: Boxes, ruta:"/invetario"},
  { title: "Ventas por Día", description: "Resumen diario", icon: Calendar, ruta:"/resumen"},
  { title: "Corte de Caja", description: "Reportes de caja", icon: Wallet , ruta:"/resumen"},
  { title: "Inventario", description: "Reporte de inventario", icon: Boxes, ruta:"/resumen"},
  { title: "Ventas por Día", description: "Resumen diario", icon: Calendar, ruta:"/resumen"},
  
]


export default function ReportesPage() {
  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Reportes</h1>
        <p className="mt-4 text-muted-foreground">
          Aquí puedes ver los reportes de ventas, inventario y más.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {reportes.map((reporte, index) => {
          const Icon = reporte.icon
          return (
  
            <Card
              key={index}
              className="
                rounded-2xl
                hover:shadow-lg
                transition-all
                cursor-pointer
                h-full w-full
              "
            >
              <Link href={`/reportes${reporte.ruta}`}>
              
              <CardHeader className=" space-y-4 flex flex-col items-center justify-center text-center gap-3 h-full">
                  <Icon className="h-10 w-10 text-primary" />

                <CardTitle>{reporte.title}</CardTitle>
              </CardHeader>
              </Link>
            </Card>
          )
        })}
      </div>
    </>
  )
}


