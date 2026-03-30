import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"

export default function ModuloCobro() {
  const fecha = new Date()

  /* Función para obtener la fecha actual */

  const fechaFormateada = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(fecha)

  /* Función para capitalizar la primera letra de cada palabra */

  const capitalizar = (texto: string) =>
    texto.charAt(0).toUpperCase() + texto.slice(1)

  const fechaformateada = capitalizar(fechaFormateada)

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Módulo de Cobro</h1>
        <h1 className="ml-4 text-2xl font-semibold">{fechaformateada}</h1>
      </div>
      {/* Contenedor de la seccion de tickets pendientes */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="mt-4 h-auto">
          <CardHeader>
            <CardTitle>Nombre del Cliente</CardTitle>
            <CardDescription>
              <p>id del ticket: 12345</p>
              <div className="flex justify-between">
                <p>{new Date().toLocaleDateString()}</p>
                <p>12:00 PM</p>
              </div>
              <div className="mt-2 border bg-accent-foreground"></div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row justify-between gap-2 text-card-foreground">
              <p>items</p>
              <p>cantidad</p>
              <p>precio</p>
            </div>
            <div className="space-y-1">
              <div className="flex flex-row justify-between gap-2 text-card-foreground">
                <p>Producto 1</p>
                <p>2</p>
                <p>$10.00</p>
              </div>
              <div className="flex flex-row justify-between gap-2 text-card-foreground">
                <p>Producto 2</p>
                <p>1</p>
                <p>$5.00</p>
              </div>
              <div className="flex flex-row justify-between gap-2 text-card-foreground">
                <p>Producto 3</p>
                <p>3</p>
                <p>$15.00</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="mx-4">
            <div className="flex w-full justify-center gap-4">
              <Button
                variant="secondary"
                className="rounded-xl bg-secondary px-6 py-5 text-sm font-medium text-foreground hover:bg-secondary/80"
              >
                Ver detalles
              </Button>

              <Button className="rounded-xl bg-accent/80 px-6 py-5 text-sm font-semibold text-foreground hover:bg-warning">
                Procesar Pago
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
