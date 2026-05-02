"use client"

import { useEffect, useMemo, useState } from "react"
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
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  User2,
  CalendarClock,
  FileCheckIcon,
  Loader2,
  CreditCard,
  Banknote,
  Landmark,
  CheckCircle2,
  XCircle,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

type MetodoPago = "efectivo" | "tarjeta" | "transferencia"

type TicketPendiente = {
  id: number
  folio: string | null
  fecha_hora: string
  total: string | number
  total_articulos: number
  cliente?: string | null
  cliente_nombre?: string | null
}

type ProductoDetalle = {
  id: number
  id_producto: number
  nombre?: string
  producto?: string
  codigo_producto: string | null
  cantidad: number
  precio_unitario: string | number
  descuento_unitario: string | number
  subtotal: string | number
}

type TicketDetalle = {
  id: number
  folio: string | null
  fecha_hora: string
  id_cliente: number | null
  cliente?: string | null
  cliente_nombre?: string | null
  subtotal: string | number
  descuento: string | number
  metodo_pago: MetodoPago | null
  total: string | number
  total_articulos: number
  estatus: string
  observaciones: string | null
  productos?: ProductoDetalle[]
  items?: ProductoDetalle[]
}

export default function ModuloCobro() {
  const [tickets, setTickets] = useState<TicketPendiente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [detalleAbierto, setDetalleAbierto] = useState(false)
  const [ticketDetalle, setTicketDetalle] = useState<TicketDetalle | null>(null)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)

  const [cobroAbierto, setCobroAbierto] = useState(false)
  const [ticketCobro, setTicketCobro] = useState<
    TicketPendiente | TicketDetalle | null
  >(null)

  const [metodoPago, setMetodoPago] = useState<MetodoPago | "">("")
  const [observaciones, setObservaciones] = useState("")
  const [montoRecibido, setMontoRecibido] = useState("")
  const [procesandoPago, setProcesandoPago] = useState(false)

  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const fecha = useMemo(() => new Date(), [])

  const fechaEncabezado = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
    .format(fecha)
    .replace(/^./, (letra) => letra.toUpperCase())

  useEffect(() => {
    obtenerTicketsPendientes()
  }, [])

  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => setSuccessMessage(""), 3000)
    return () => clearTimeout(timer)
  }, [successMessage])

  useEffect(() => {
    if (!errorMessage) return
    const timer = setTimeout(() => setErrorMessage(""), 3500)
    return () => clearTimeout(timer)
  }, [errorMessage])

  const formatearMoneda = (valor: string | number | null | undefined) => {
    const numero = Number(valor || 0)

    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(numero)
  }

  const formatearFecha = (fechaIso: string) => {
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).format(new Date(fechaIso))
  }

  const formatearHora = (fechaIso: string) => {
    return new Intl.DateTimeFormat("es-MX", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(fechaIso))
  }

  const obtenerCliente = (ticket: TicketPendiente | TicketDetalle | null) => {
    if (!ticket) return "Cliente general"
    return ticket.cliente_nombre || ticket.cliente || "Cliente general"
  }

  const obtenerItems = (ticket: TicketDetalle | null) => {
    if (!ticket) return []
    return ticket.items || ticket.productos || []
  }

  const obtenerTicketsPendientes = async () => {
    try {
      setLoading(true)
      setError("")

      const res = await fetch(`${API_URL}/cobros/pendientes`, {
        cache: "no-store",
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "Error al cargar tickets pendientes")
      }

      setTickets(data.tickets || [])
    } catch (err) {
      console.error(err)
      setError("No fue posible cargar los tickets pendientes.")
    } finally {
      setLoading(false)
    }
  }

  const abrirDetalle = async (id: number) => {
    try {
      setDetalleAbierto(true)
      setCargandoDetalle(true)
      setTicketDetalle(null)

      const res = await fetch(`${API_URL}/cobros/pendientes/${id}`, {
        cache: "no-store",
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "No se pudo obtener el detalle")
      }

      const ticket = data.ticket

      setTicketDetalle({
        ...ticket,
        cliente_nombre:
          ticket.cliente_nombre || ticket.cliente || "Cliente general",
        items: ticket.items || ticket.productos || [],
      })
    } catch (err) {
      console.error(err)
      setDetalleAbierto(false)
      setErrorMessage("No se pudo cargar el detalle del ticket.")
    } finally {
      setCargandoDetalle(false)
    }
  }

  const abrirCobro = (ticket: TicketPendiente | TicketDetalle) => {
    setTicketCobro(ticket)
    setMetodoPago("")
    setObservaciones(
      "observaciones" in ticket ? ticket.observaciones || "" : ""
    )
    setMontoRecibido("")
    setCobroAbierto(true)
  }

  const totalNumerico = Number(ticketCobro?.total || 0)
  const montoRecibidoNumerico = Number(montoRecibido || 0)

  const cambio =
    metodoPago === "efectivo" && montoRecibidoNumerico >= totalNumerico
      ? montoRecibidoNumerico - totalNumerico
      : 0

  const montoInsuficiente =
    metodoPago === "efectivo" &&
    (montoRecibido.trim() === "" || montoRecibidoNumerico < totalNumerico)

  const procesarPago = async () => {
    if (!ticketCobro?.id) return

    if (!metodoPago) {
      setErrorMessage("Selecciona un método de pago.")
      return
    }

    if (metodoPago === "efectivo" && montoInsuficiente) {
      setErrorMessage("El monto recibido debe ser mayor o igual al total.")
      return
    }

    try {
      setProcesandoPago(true)

      const res = await fetch(
        `${API_URL}/cobros/pendientes/${ticketCobro.id}/cobrar`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            metodo_pago: metodoPago,
            observaciones: observaciones.trim() || "",
          }),
        }
      )

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "No se pudo procesar el pago")
      }

      setTickets((prev) =>
        prev.filter((ticket) => ticket.id !== ticketCobro.id)
      )

      setCobroAbierto(false)
      setDetalleAbierto(false)
      setTicketDetalle(null)
      setTicketCobro(null)
      setMetodoPago("")
      setObservaciones("")
      setMontoRecibido("")

      const impresion = data.ticket?.impresion

      if (impresion && impresion.ok === false) {
        setSuccessMessage("Ticket cobrado, pero no se pudo imprimir.")
      } else {
        setSuccessMessage("Ticket cobrado correctamente.")
      }
    } catch (err: any) {
      console.error(err)
      setErrorMessage(err.message || "No fue posible finalizar la venta.")
    } finally {
      setProcesandoPago(false)
    }
  }

  const renderIconoMetodo = (metodo: MetodoPago | "") => {
    if (metodo === "efectivo") return <Banknote className="h-4 w-4" />
    if (metodo === "tarjeta") return <CreditCard className="h-4 w-4" />
    if (metodo === "transferencia") return <Landmark className="h-4 w-4" />
    return null
  }

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex shrink-0 items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Módulo de Cobro</h1>

        <h1 className="ml-4 rounded-md p-2 text-right text-2xl font-semibold">
          {fechaEncabezado}
        </h1>
      </div>

      <div className="mt-4 space-y-3">
        {successMessage ? (
          <Alert className="border-green-500/40">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Éxito</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : null}

        {errorMessage ? (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div className="mt-4 flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Cargando tickets pendientes...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center">
            <Alert variant="destructive" className="max-w-md">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Sin tickets pendientes</CardTitle>
                <CardDescription>
                  No hay ventas pendientes por cobrar en este momento.
                </CardDescription>
              </CardHeader>

              <CardFooter>
                <Button onClick={obtenerTicketsPendientes}>Actualizar</Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="grid h-full grid-cols-1 gap-4 overflow-y-auto pr-2 [scrollbar-width:none] sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 [&::-webkit-scrollbar]:hidden">
            {tickets.map((ticket) => {
              const cliente = obtenerCliente(ticket)

              return (
                <Card
                  key={ticket.id}
                  className="mt-2 flex h-[24rem] max-w-full flex-col rounded-2xl border border-border/60 py-4 shadow-sm transition-shadow hover:shadow-lg"
                >
                  <CardHeader className="space-y-3 px-5 pb-4">
                    <CardTitle>
                      <div className="flex items-center gap-2 text-lg">
                        <User2 className="h-4 w-4 shrink-0" />
                        <span className="truncate font-semibold">
                          {cliente}
                        </span>
                      </div>
                    </CardTitle>

                    <CardDescription className="space-y-2 text-base">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileCheckIcon className="h-4 w-4 shrink-0" />
                        <p>{ticket.folio || `Ticket #${ticket.id}`}</p>
                      </div>

                      <div className="flex items-center justify-between gap-3 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 shrink-0" />
                          <p>{formatearFecha(ticket.fecha_hora)}</p>
                        </div>

                        <p className="shrink-0">
                          {formatearHora(ticket.fecha_hora)}
                        </p>
                      </div>

                      <div className="border-t border-border/70 pt-1" />
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 px-5">
                    <div className="rounded-xl border p-4">
                      <p className="text-sm text-muted-foreground">Artículos</p>

                      <p className="mt-1 text-3xl font-bold tabular-nums">
                        {ticket.total_articulos || 0}
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter className="mx-5 mb-2 flex-col items-stretch gap-4 border-t border-border/70 bg-card pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-lg text-muted-foreground">
                        Total a pagar
                      </p>

                      <p className="text-xl font-bold tabular-nums">
                        {formatearMoneda(ticket.total)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => abrirDetalle(ticket.id)}
                        className="rounded-xl py-5 text-sm font-medium"
                      >
                        Ver detalles
                      </Button>

                      <Button
                        onClick={() => abrirCobro(ticket)}
                        className="rounded-xl bg-accent py-5 text-sm font-semibold text-foreground hover:bg-accent/80"
                      >
                        Procesar pago
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={detalleAbierto} onOpenChange={setDetalleAbierto}>
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>Detalles de la orden</DialogTitle>

            <DialogDescription>
              {ticketDetalle
                ? `${ticketDetalle.folio || `Ticket #${ticketDetalle.id}`} · Cliente: ${obtenerCliente(ticketDetalle)}`
                : "Cargando detalle del ticket..."}
            </DialogDescription>
          </DialogHeader>

          {cargandoDetalle ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Cargando detalle...</span>
              </div>
            </div>
          ) : ticketDetalle ? (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium">
                      {formatearFecha(ticketDetalle.fecha_hora)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Hora</p>
                    <p className="font-medium">
                      {formatearHora(ticketDetalle.fecha_hora)}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-3 grid grid-cols-[1fr_90px_120px] gap-2 font-semibold">
                    <p>Producto</p>
                    <p className="text-center">Cantidad</p>
                    <p className="text-right">Subtotal</p>
                  </div>

                  <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
                    {obtenerItems(ticketDetalle).map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[1fr_90px_120px] gap-2 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {item.nombre || item.producto || "Producto"}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {item.codigo_producto || "Sin código"}
                          </p>
                        </div>

                        <p className="text-center tabular-nums">
                          {item.cantidad}
                        </p>

                        <p className="text-right tabular-nums">
                          {formatearMoneda(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatearMoneda(ticketDetalle.subtotal)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Descuento</span>
                      <span>{formatearMoneda(ticketDetalle.descuento)}</span>
                    </div>

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatearMoneda(ticketDetalle.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setDetalleAbierto(false)}
                >
                  Cerrar
                </Button>

                <Button
                  onClick={() => abrirCobro(ticketDetalle)}
                  className="bg-accent font-semibold text-foreground hover:bg-accent/80"
                >
                  Procesar pago
                </Button>
              </DialogFooter>
            </>
          ) : (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                No fue posible cargar el detalle del ticket.
              </AlertDescription>
            </Alert>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={cobroAbierto} onOpenChange={setCobroAbierto}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Finalizar venta</DialogTitle>

            <DialogDescription>
              {ticketCobro
                ? `${ticketCobro.folio || `Ticket #${ticketCobro.id}`} · Cliente: ${obtenerCliente(ticketCobro)}`
                : "Selecciona el método de pago para finalizar la venta."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total a pagar</p>
                <p className="text-xl font-bold">
                  {formatearMoneda(ticketCobro?.total || 0)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metodo_pago">Método de pago</Label>

              <Select
                value={metodoPago}
                onValueChange={(value: MetodoPago) => setMetodoPago(value)}
              >
                <SelectTrigger id="metodo_pago" className="w-full">
                  <SelectValue placeholder="Selecciona un método de pago" />
                </SelectTrigger>

                <SelectContent
                  className="rounded-lg border border-border bg-background shadow-lg"
                  position="popper"
                >
                  <SelectItem value="efectivo">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Efectivo
                    </div>
                  </SelectItem>

                  <SelectItem value="tarjeta">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Tarjeta
                    </div>
                  </SelectItem>

                  <SelectItem value="transferencia">
                    <div className="flex items-center gap-2">
                      <Landmark className="h-4 w-4" />
                      Transferencia
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {metodoPago ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {renderIconoMetodo(metodoPago)}
                  <span>
                    Método seleccionado:{" "}
                    <span className="font-medium capitalize">{metodoPago}</span>
                  </span>
                </div>
              ) : null}
            </div>

            {metodoPago === "efectivo" ? (
              <div className="rounded-xl border p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="monto_recibido">Monto recibido</Label>

                    <Input
                      id="monto_recibido"
                      type="number"
                      min="0"
                      step="0.01"
                      value={montoRecibido}
                      onChange={(e) => setMontoRecibido(e.target.value)}
                      placeholder="0.00"
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground">Total a cobrar</p>
                      <p className="font-semibold">
                        {formatearMoneda(totalNumerico)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground">Monto recibido</p>
                      <p className="font-semibold">
                        {formatearMoneda(montoRecibidoNumerico)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold">Cambio</p>

                      <p
                        className={`text-2xl font-bold ${
                          montoInsuficiente ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {formatearMoneda(cambio)}
                      </p>
                    </div>

                    {montoInsuficiente ? (
                      <p className="text-sm text-red-500">
                        El monto recibido es menor al total a cobrar.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>

              <Textarea
                id="observaciones"
                placeholder="Opcional: notas del cobro, referencia, caja, etc."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="min-h-[110px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setCobroAbierto(false)}
              disabled={procesandoPago}
            >
              Cancelar
            </Button>

            <Button
              onClick={procesarPago}
              disabled={!metodoPago || procesandoPago || montoInsuficiente}
              className="bg-accent font-semibold text-foreground hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {procesandoPago ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Finalizar venta"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
