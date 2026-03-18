"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import {
  Plus,
  Minus,
  Trash2,
  UserRound,
  ReceiptText,
  HandCoins,
  CreditCard,
  Wallet,
  Landmark,
  BadgePercent,
  Search,
  Check,
  ChevronsUpDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Product = {
  id: number
  name: string
  code: string
  price: number
  stock: number
  category: string
}

type CartItem = Product & {
  quantity: number
}

const products: Product[] = [
  {
    id: 1,
    name: "Cuaderno profesional",
    code: "CUA-001",
    price: 85,
    stock: 24,
    category: "Cuadernos",
  },
  {
    id: 2,
    name: "Pluma tinta azul",
    code: "PLU-001",
    price: 12,
    stock: 40,
    category: "Plumas",
  },
  {
    id: 3,
    name: "Resaltador amarillo",
    code: "RES-001",
    price: 18,
    stock: 14,
    category: "Plumas",
  },
  {
    id: 4,
    name: "Servicio de copias B/N",
    code: "COP-001",
    price: 1.5,
    stock: 999,
    category: "Copias",
  },
  {
    id: 5,
    name: "Folder tamaño carta",
    code: "FOL-001",
    price: 15,
    stock: 8,
    category: "Oficina",
  },
  {
    id: 6,
    name: "Paquete hojas blancas",
    code: "HOJ-001",
    price: 69,
    stock: 9,
    category: "Oficina",
  },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value)
}

export default function VentasPage() {
  const [search, setSearch] = useState("")
  const [directCode, setDirectCode] = useState("")
  const [codeError, setCodeError] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<
    "efectivo" | "tarjeta" | "transferencia" | ""
  >("")
  const [ticketComboOpen, setTicketComboOpen] = useState(false)
  const [selectedPendingTicket, setSelectedPendingTicket] = useState("")
  const [cashReceived, setCashReceived] = useState("")
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 1,
      name: "Cuaderno profesional",
      code: "CUA-001",
      price: 85,
      stock: 24,
      category: "Cuadernos",
      quantity: 2,
    },
    {
      id: 2,
      name: "Pluma tinta azul",
      code: "PLU-001",
      price: 12,
      stock: 40,
      category: "Plumas",
      quantity: 3,
    },
    {
      id: 4,
      name: "Servicio de copias B/N",
      code: "COP-001",
      price: 1.5,
      stock: 999,
      category: "Copias",
      quantity: 20,
    },
  ])

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) return products

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.code.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
    )
  }, [search])

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...prev, { ...product, quantity: 1 }]
    })

    setModalOpen(false)
    setSearch("")
    setCodeError("")
  }

  const handleDirectCodeSubmit = () => {
    const normalizedCode = directCode.trim().toLowerCase()

    if (!normalizedCode) {
      setCodeError("Ingresa una clave de producto.")
      return
    }

    const product = products.find(
      (item) => item.code.toLowerCase() === normalizedCode
    )

    if (!product) {
      setCodeError("No se encontró un producto con esa clave.")
      return
    }

    addToCart(product)
    setDirectCode("")
    setCodeError("")
  }

  const increaseQty = (id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    )
  }

  const decreaseQty = (id: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  }, [cart])

  const discount = 25
  const total = subtotal - discount
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)

  const cashReceivedNumber = Number(cashReceived || 0)
  const cashChange = cashReceivedNumber - total
  const isCashInsufficient =
    paymentMethod === "efectivo" &&
    cashReceived !== "" &&
    cashReceivedNumber < total

  const [modalOpen, setModalOpen] = useState(false)
  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [clientSearch, setClientSearch] = useState("")

  const [selectedClient, setSelectedClient] = useState({
    id: "general",
    name: "Cliente general",
    phone: "",
    email: "",
  })

  const pendingTickets = [
    {
      id: "T-001",
      folio: "T-001",
      customer: "Cliente general",
      items: 3,
      total: 289.5,
      createdAt: "10:35 AM",
    },
    {
      id: "T-002",
      folio: "T-002",
      customer: "María López",
      items: 5,
      total: 640,
      createdAt: "11:10 AM",
    },
    {
      id: "T-003",
      folio: "T-003",
      customer: "Carlos Ruiz",
      items: 2,
      total: 159.9,
      createdAt: "11:42 AM",
    },
    {
      id: "T-004",
      folio: "T-004",
      customer: "Carlos Ruiz",
      items: 2,
      total: 159.9,
      createdAt: "11:42 AM",
    },
    {
      id: "T-005",
      folio: "T-005",
      customer: "Carlos Ruiz",
      items: 2,
      total: 159.9,
      createdAt: "11:42 AM",
    },
    {
      id: "T-006",
      folio: "T-006",
      customer: "Carlos Ruiz",
      items: 2,
      total: 159.9,
      createdAt: "11:42 AM",
    },
  ]
  const selectedPendingTicketData = pendingTickets.find(
    (t) => t.id === selectedPendingTicket
  )

  const clients = [
    {
      id: "general",
      name: "Cliente general",
      phone: "",
      email: "",
    },
    {
      id: "1",
      name: "María López",
      phone: "3312345678",
      email: "maria@email.com",
    },
    {
      id: "2",
      name: "Carlos Ruiz",
      phone: "3323456789",
      email: "carlos@email.com",
    },
    {
      id: "3",
      name: "Papelería Centro",
      phone: "3334567890",
      email: "contacto@papeleriacentro.com",
    },
  ]

  const filteredClients = useMemo(() => {
    const term = clientSearch.toLowerCase().trim()
    if (!term) return clients

    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) ||
        client.phone.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term)
    )
  }, [clientSearch])

  const handleRecoverTicket = (ticketId: string) => {
    const ticket = pendingTickets.find((t) => t.id === ticketId)
    if (!ticket) return

    setSelectedPendingTicket(ticketId)
    setTicketComboOpen(false)

    // Aquí recuperas la venta real
    // setCart(ticket.items)
    // setSelectedClient(ticket.customer ?? generalClient)
    // setDirectCode("")
    // setCodeError("")
  }

  const handleSelectClient = (client: {
    id: string
    name: string
    phone: string
    email: string
  }) => {
    setSelectedClient(client)
    setClientModalOpen(false)
    setClientSearch("")
  }

  const handleNewSale = () => {
    // Limpias el ticket actual y vuelves al cliente general
    // setCart([])
    setSelectedClient({
      id: "general",
      name: "Cliente general",
      phone: "",
      email: "",
    })
    setDirectCode("")
    setCodeError("")
  }

  return (
    <div className="h-full min-h-0 overflow-hidden bg-background">
      <div className="mx-auto flex h-full min-h-0 max-w-[1900px] flex-col gap-6 overflow-hidden">
        <Card className="shrink-0 border-border/60 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Ventas
                </h1>
                <p className="text-sm text-muted-foreground">
                  Caja rápida para registrar y cobrar ventas
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                {/* Buscar productos */}
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-10 w-10">
                      <Search className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="!w-[95vw] !max-w-6xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">
                        Buscar productos
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <Input
                        placeholder="Buscar por nombre, código o categoría..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />

                      <div className="max-h-[750px] space-y-3 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {filteredProducts.length === 0 ? (
                          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                            No se encontraron productos.
                          </div>
                        ) : (
                          filteredProducts.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center justify-between gap-4 rounded-xl border border-border/60 p-4"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-foreground md:text-base">
                                  {product.name}
                                </p>
                                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                  <span>{product.code}</span>
                                  <span>•</span>
                                  <span>{product.category}</span>
                                  <span>•</span>
                                  <span>Stock: {product.stock}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <p className="min-w-[90px] text-right text-sm font-bold text-foreground">
                                  {formatCurrency(product.price)}
                                </p>
                                <Button
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => addToCart(product)}
                                >
                                  <Plus className="h-4 w-4" />
                                  Agregar
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Tickets pendientes */}
                <Popover
                  open={ticketComboOpen}
                  onOpenChange={setTicketComboOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={ticketComboOpen}
                      className="h-10 w-full justify-between sm:w-[280px]"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <ReceiptText className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {selectedPendingTicketData
                            ? `${selectedPendingTicketData.folio} · ${selectedPendingTicketData.customer}`
                            : "Tickets pendientes"}
                        </span>
                      </div>

                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    align="start"
                    side="bottom"
                    className="w-[280px] overflow-hidden rounded-xl border border-border bg-background p-0 shadow-md"
                  >
                    <Command className="bg-popover rounded-lg border-0">
                      <CommandInput
                        placeholder="Buscar ticket..."
                        className="h-11"
                      />

                      <CommandList className="max-h-72 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <CommandEmpty>No hay tickets pendientes.</CommandEmpty>

                        <CommandGroup className="p-1">
                          {pendingTickets.map((ticket) => (
                            <CommandItem
                              key={ticket.id}
                              value={`${ticket.folio} ${ticket.customer} ${ticket.total} ${ticket.createdAt}`}
                              onSelect={() => handleRecoverTicket(ticket.id)}
                              className="mt-1 flex items-start justify-between gap-2 rounded-sm px-3 py-2"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">
                                  {ticket.folio} · {ticket.customer}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {ticket.items} productos ·{" "}
                                  {formatCurrency(ticket.total)} ·{" "}
                                  {ticket.createdAt}
                                </p>
                              </div>

                              <Check
                                className={cn(
                                  "mt-0.5 h-4 w-4 shrink-0",
                                  selectedPendingTicket === ticket.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Modal de clientes */}
                <Dialog
                  open={clientModalOpen}
                  onOpenChange={setClientModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <UserRound className="h-4 w-4" />
                      <span className="max-w-[140px] truncate">
                        {selectedClient.name}
                      </span>
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="!w-[95vw] !max-w-3xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">
                        Seleccionar cliente
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <Input
                        placeholder="Buscar cliente por nombre, teléfono o correo..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                      />

                      <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {filteredClients.length === 0 ? (
                          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                            No se encontraron clientes.
                          </div>
                        ) : (
                          filteredClients.map((client) => (
                            <button
                              key={client.id}
                              type="button"
                              onClick={() => handleSelectClient(client)}
                              className={`w-full rounded-xl border p-4 text-left transition ${
                                selectedClient.id === client.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border/60 hover:bg-muted/40"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-foreground md:text-base">
                                    {client.name}
                                  </p>

                                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <span>
                                      {client.phone || "Sin teléfono"}
                                    </span>
                                    <span>•</span>
                                    <span>{client.email || "Sin correo"}</span>
                                  </div>
                                </div>

                                {selectedClient.id === client.id && (
                                  <span className="text-xs font-semibold text-primary">
                                    Seleccionado
                                  </span>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button className="gap-2" onClick={handleNewSale}>
                  <Plus className="h-4 w-4" />
                  Nueva venta
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                <Input
                  value={directCode}
                  onChange={(e) => {
                    setDirectCode(e.target.value)
                    if (codeError) setCodeError("")
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleDirectCodeSubmit()
                    }
                  }}
                  placeholder="Ingresa la clave del producto..."
                  className="h-11"
                />

                <Button onClick={handleDirectCodeSubmit} className="h-11 px-6">
                  Agregar
                </Button>
              </div>
            </div>

            {codeError ? (
              <p className="text-sm font-medium text-destructive">
                {codeError}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Captura la clave directamente o usa la lupa para buscar
                productos.
              </p>
            )}
          </CardContent>
        </Card>
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden xl:grid-cols-[1.55fr_0.95fr]">
          <div className="flex min-h-0 flex-col overflow-hidden">
            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-border/60 shadow-sm">
              <CardHeader className="shrink-0 border-b border-border/60 pb-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ReceiptText className="h-5 w-5" />
                    Ticket actual
                  </CardTitle>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="px-3 py-1">
                      {selectedClient?.name || "Cliente general"}
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1">
                      {totalItems} artículos
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {cart.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No hay productos en el ticket.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-border/60 bg-card p-4 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-semibold text-foreground md:text-base">
                              {item.name}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span>Código: {item.code}</span>
                              <span>•</span>
                              <span>{item.category}</span>
                              <span>•</span>
                              <span>{formatCurrency(item.price)} c/u</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => decreaseQty(item.id)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>

                            <div className="min-w-[42px] text-center text-sm font-semibold">
                              {item.quantity}
                            </div>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => increaseQty(item.id)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-rose-600" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Subtotal de línea
                          </p>
                          <p className="text-base font-bold text-foreground">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex min-h-0 flex-col overflow-hidden">
            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-border/60 shadow-sm">
              <CardHeader className="shrink-0 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HandCoins className="h-5 w-5" />
                  Resumen de cobro
                </CardTitle>
              </CardHeader>

              <CardContent className="flex min-h-0 flex-1 flex-col justify-between gap-4 overflow-hidden pb-4">
                <div className="space-y-5">
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Subtotal
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BadgePercent className="h-4 w-4" />
                        Descuento
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        - {formatCurrency(discount)}
                      </span>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-foreground">
                        Total a cobrar
                      </span>
                      <span className="text-3xl font-bold tracking-tight text-foreground">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">
                      Métodos de pago
                    </p>

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                      <Button
                        variant={
                          paymentMethod === "efectivo" ? "default" : "outline"
                        }
                        className="h-12 gap-3"
                        onClick={() => setPaymentMethod("efectivo")}
                      >
                        <Wallet className="h-5 w-5" />
                        Efectivo
                      </Button>

                      <Button
                        variant={
                          paymentMethod === "tarjeta" ? "default" : "outline"
                        }
                        className="h-12 gap-3"
                        onClick={() => setPaymentMethod("tarjeta")}
                      >
                        <CreditCard className="h-5 w-5" />
                        Tarjeta
                      </Button>

                      <Button
                        variant={
                          paymentMethod === "transferencia"
                            ? "default"
                            : "outline"
                        }
                        className="h-12 gap-3"
                        onClick={() => setPaymentMethod("transferencia")}
                      >
                        <Landmark className="h-5 w-5" />
                        Transferencia
                      </Button>
                    </div>

                    {paymentMethod === "efectivo" && (
                      <div className="space-y-3 rounded-xl border border-border/60 p-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            Monto recibido
                          </label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Ej. 300"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            className="h-11"
                          />
                        </div>

                        {cashReceived !== "" && (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Total a cobrar
                              </span>
                              <span className="font-semibold text-foreground">
                                {formatCurrency(total)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Monto recibido
                              </span>
                              <span className="font-semibold text-foreground">
                                {formatCurrency(cashReceivedNumber)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">
                                Cambio
                              </span>
                              <span
                                className={`text-lg font-bold ${
                                  isCashInsufficient
                                    ? "text-destructive"
                                    : "text-secondary"
                                }`}
                              >
                                {isCashInsufficient
                                  ? formatCurrency(0)
                                  : formatCurrency(cashChange)}
                              </span>
                            </div>

                            {isCashInsufficient && (
                              <p className="text-sm font-medium text-destructive">
                                El monto recibido es menor al total a cobrar.
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 space-y-3 pt-2">
                  <Separator />

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="h-11">
                      Guardar
                    </Button>
                    <Button variant="destructive" className="h-11">
                      Cancelar
                    </Button>
                  </div>

                  <Button
                    size="lg"
                    className="h-12 w-full text-base font-semibold"
                    disabled={
                      paymentMethod === "efectivo" &&
                      (cashReceived === "" || cashReceivedNumber < total)
                    }
                  >
                    Cobrar {formatCurrency(total)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
