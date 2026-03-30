import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"

import { User2, CalendarClock, FileCheckIcon } from "lucide-react"

export default function ModuloCobro() {
  const fecha = new Date()

  const fechaFormateada = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(fecha)

  const capitalizar = (texto: string) =>
    texto.charAt(0).toUpperCase() + texto.slice(1)

  const fechaformateada = capitalizar(fechaFormateada)

  const tickets = Array.from({ length: 15 }, (_, i) => ({
    id: 1000 + i,
    cliente: `Cliente ${i + 1}`,
    fecha: new Date().toLocaleDateString(),
    hora: "12:00 PM",
    items: [
      { nombre: "Producto 1", cantidad: 2, precio: 10 },
      { nombre: "Producto 2", cantidad: 1, precio: 5 },
      { nombre: "Producto 3", cantidad: 3, precio: 15 },
      { nombre: "Producto 3", cantidad: 3, precio: 15 },
    ],
  }))

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex shrink-0 items-center justify-between">
        <h1 className="text-2xl font-bold">Módulo de Cobro</h1>
        <h1 className="ml-4 rounded-md border p-2 text-2xl font-semibold">
          {fechaformateada}
        </h1>
      </div>
      <div className="mt-4 flex-1 overflow-hidden">
        <div className="scrollbar-thin scrollbar-thumb-muted-foreground/30 grid h-full grid-cols-4 gap-4 overflow-y-auto pr-2">
          {tickets.map((ticket) => {
            const total = ticket.items.reduce(
              (acc, item) => acc + item.precio,
              0
            )

            return (
              <Card
                key={ticket.id}
                className="mt-6 h-96 max-w-96 border border-accent-foreground py-4 hover:shadow-lg"
              >
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2 text-lg">
                      <User2 className="mr-2 inline-block h-4 w-4" />
                      {ticket.cliente}
                    </div>
                  </CardTitle>
                  <CardDescription className="text-base">
                    <div className="flex items-center gap-2">
                      <FileCheckIcon className="mr-2 inline-block h-4 w-4" />
                      <p>id del ticket: {ticket.id}</p>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarClock className="mr-2 inline-block h-4 w-4" />
                        <p>{ticket.fecha}</p>
                      </div>
                      <p>{ticket.hora}</p>
                    </div>
                    <div className="mt-4 border border-muted-foreground"></div>
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="mt-2 flex justify-between text-card-foreground">
                    <p>items</p>
                    <p>cantidad</p>
                    <p>precio</p>
                  </div>

                  <div className="space-y-1">
                    {ticket.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-card-foreground"
                      >
                        <p>{item.nombre}</p>
                        <p>{item.cantidad}</p>
                        <p>${item.precio}.00</p>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="mx-4 mb-2 flex-col items-stretch gap-4 bg-card">
                  <div className="flex items-center justify-between">
                    <p className="text-lg text-muted-foreground">
                      Total a pagar
                    </p>
                    <p className="text-lg font-bold">${total}.00</p>
                  </div>

                  <div className="flex w-full justify-center gap-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="secondary"
                          className="rounded-xl bg-secondary px-6 py-5 text-sm font-medium text-foreground hover:bg-secondary/80"
                        >
                          Ver detalles
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Detalles de la orden</DialogTitle>
                          <DialogDescription>
                            Ticket #{ticket.id} · Cliente: {ticket.cliente}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Fecha
                              </p>
                              <p className="font-medium">{ticket.fecha}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Hora
                              </p>
                              <p className="font-medium">{ticket.hora}</p>
                            </div>
                          </div>

                          <div className="rounded-lg border p-4">
                            <div className="mb-3 grid grid-cols-3 font-semibold">
                              <p>Producto</p>
                              <p className="text-center">Cantidad</p>
                              <p className="text-right">Subtotal</p>
                            </div>

                            <div className="space-y-2">
                              {ticket.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-3">
                                  <p>{item.nombre}</p>
                                  <p className="text-center">{item.cantidad}</p>
                                  <p className="text-right">
                                    ${item.precio}.00
                                  </p>
                                </div>
                              ))}
                            </div>

                            <div className="mt-4 border-t pt-4">
                              <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>${total}.00</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button className="bg-accent/80 font-semibold text-foreground hover:bg-warning">
                            Procesar Pago
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button className="rounded-xl bg-accent px-6 py-5 text-sm font-semibold text-foreground hover:bg-warning">
                      Procesar Pago
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
