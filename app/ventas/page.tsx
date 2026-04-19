"use client"

import { useEffect, useMemo, useState } from "react"
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
  Loader2,
  CheckCircle2,
  Info,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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

type PaymentMethod = "efectivo" | "tarjeta" | "transferencia" | ""
type SaleStatus = "pendiente" | "finalizada" | "cancelada" | ""

type ProductApi = {
  id: number
  nombre?: string
  name?: string
  codigo_producto?: string
  code?: string
  precio_venta?: number | string
  price?: number | string
  stock_actual?: number | string
  stock?: number | string
  categoria_nombre?: string
  category?: string
}

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

type ClientApi = {
  id: number | string
  nombre?: string
  name?: string
  telefono?: string
  phone?: string
  correo?: string
  email?: string
  descuento?: number | string
}

type Client = {
  id: string
  name: string
  phone: string
  email: string
  discount: number
}

type PendingTicketApi = {
  id: number | string
  folio: string
  cliente_nombre?: string
  customer?: string
  total: number | string
  total_articulos?: number | string
  items?: number | string
  fecha_hora?: string
  createdAt?: string
}

type PendingTicket = {
  id: string
  folio: string
  customer: string
  items: number
  total: number
  createdAt: string
}

type VentaDetalleApi = {
  id_producto: number | string
  nombre?: string
  name?: string
  codigo_producto?: string
  code?: string
  cantidad: number | string
  precio_unitario: number | string
  categoria_nombre?: string
  category?: string
  stock_actual?: number | string
}

type VentaApi = {
  id: number | string
  folio: string
  estatus: SaleStatus
  metodo_pago?: PaymentMethod | null
  id_cliente?: number | string
  cliente_nombre?: string
  cliente_telefono?: string
  cliente_correo?: string
  descuento?: number | string
  total?: number | string
  subtotal?: number | string
  total_articulos?: number | string
  items: VentaDetalleApi[]
}

type UiAlert = {
  type: "success" | "error" | "info"
  title: string
  message: string
} | null

type PersistedSale = {
  currentSaleId: string | null
  currentSaleStatus: SaleStatus
  selectedPendingTicket: string
  paymentMethod: PaymentMethod
  cashReceived: string
  cart: CartItem[]
  selectedClientId: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
const STORAGE_KEY = "utilista_venta_borrador"

const ENDPOINTS = {
  productos: `${API_BASE}/api/productos`,
  clientes: `${API_BASE}/api/clientes`,
  ventasPendientes: `${API_BASE}/api/ventas/pendientes`,
  ventaById: (id: string | number) => `${API_BASE}/api/ventas/${id}`,
  crearVenta: `${API_BASE}/api/ventas`,
  actualizarVenta: (id: string | number) => `${API_BASE}/api/ventas/${id}`,
  finalizarVenta: (id: string | number) =>
    `${API_BASE}/api/ventas/${id}/finalizar`,
  cancelarVenta: (id: string | number) =>
    `${API_BASE}/api/ventas/${id}/cancelar`,
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value)
}

function formatTimeLabel(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  })
}

function normalizeProduct(item: ProductApi): Product {
  return {
    id: Number(item.id),
    name: item.nombre ?? item.name ?? "Producto",
    code: item.codigo_producto ?? item.code ?? "",
    price: Number(item.precio_venta ?? item.price ?? 0),
    stock: Number(item.stock_actual ?? item.stock ?? 0),
    category: item.categoria_nombre ?? item.category ?? "General",
  }
}

function normalizeClient(item: ClientApi): Client {
  return {
    id: String(item.id),
    name: item.nombre ?? item.name ?? "Cliente",
    phone: item.telefono ?? item.phone ?? "",
    email: item.correo ?? item.email ?? "",
    discount: Number(item.descuento ?? 0),
  }
}

function normalizePendingTicket(item: PendingTicketApi): PendingTicket {
  return {
    id: String(item.id),
    folio: item.folio,
    customer: item.cliente_nombre ?? item.customer ?? "Cliente general",
    items: Number(item.total_articulos ?? item.items ?? 0),
    total: Number(item.total ?? 0),
    createdAt: formatTimeLabel(item.fecha_hora ?? item.createdAt),
  }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  })

  if (!response.ok) {
    let message = `Error ${response.status} en ${url}`

    try {
      const errorData = await response.json()
      message =
        errorData?.message || errorData?.error || errorData?.detalle || message
    } catch {
      try {
        const text = await response.text()
        if (text) message = text
      } catch {}
    }

    throw new Error(message)
  }

  return response.json()
}

export default function VentasPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [pendingTickets, setPendingTickets] = useState<PendingTicket[]>([])

  const [loadingCatalogs, setLoadingCatalogs] = useState(true)
  const [loadingTicket, setLoadingTicket] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [uiAlert, setUiAlert] = useState<UiAlert>(null)

  const [search, setSearch] = useState("")
  const [directCode, setDirectCode] = useState("")
  const [codeError, setCodeError] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("")
  const [ticketComboOpen, setTicketComboOpen] = useState(false)
  const [selectedPendingTicket, setSelectedPendingTicket] = useState("")
  const [cashReceived, setCashReceived] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [clientSearch, setClientSearch] = useState("")

  const [currentSaleId, setCurrentSaleId] = useState<string | null>(null)
  const [currentSaleStatus, setCurrentSaleStatus] = useState<SaleStatus>("")
  const [restoredDraft, setRestoredDraft] = useState(false)

  const [selectedClient, setSelectedClient] = useState<Client>({
    id: "1",
    name: "Cliente general",
    phone: "",
    email: "",
    discount: 0,
  })

  const selectedPendingTicketData = pendingTickets.find(
    (t) => t.id === selectedPendingTicket
  )

  const showAlert = (
    type: "success" | "error" | "info",
    title: string,
    message: string
  ) => {
    setUiAlert({ type, title, message })
  }

  const clearPersistedSale = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  useEffect(() => {
    if (!uiAlert) return

    const timeout = setTimeout(() => {
      setUiAlert(null)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [uiAlert])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingCatalogs(true)
        setError("")

        const [productsRes, clientsRes, pendingRes] = await Promise.all([
          fetchJson<ProductApi[]>(ENDPOINTS.productos),
          fetchJson<ClientApi[]>(ENDPOINTS.clientes),
          fetchJson<PendingTicketApi[]>(ENDPOINTS.ventasPendientes),
        ])

        const normalizedProducts = productsRes.map(normalizeProduct)
        const normalizedClients = clientsRes.map(normalizeClient)
        const normalizedPending = pendingRes.map(normalizePendingTicket)

        setProducts(normalizedProducts)
        setClients(normalizedClients)
        setPendingTickets(normalizedPending)

        const generalClient = normalizedClients.find(
          (client) => client.id === "1"
        ) ?? {
          id: "1",
          name: "Cliente general",
          phone: "",
          email: "",
          discount: 0,
        }

        if (!restoredDraft) {
          setSelectedClient(generalClient)
        }

        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(STORAGE_KEY)

          if (stored) {
            try {
              const parsed: PersistedSale = JSON.parse(stored)

              const restoredClient =
                normalizedClients.find(
                  (client) => client.id === parsed.selectedClientId
                ) ?? generalClient

              setCurrentSaleId(parsed.currentSaleId)
              setCurrentSaleStatus(parsed.currentSaleStatus ?? "")
              setSelectedPendingTicket(parsed.selectedPendingTicket ?? "")
              setPaymentMethod(parsed.paymentMethod ?? "")
              setCashReceived(parsed.cashReceived ?? "")
              setCart(parsed.cart ?? [])
              setSelectedClient(restoredClient)
              setRestoredDraft(true)

              if ((parsed.cart ?? []).length > 0) {
                showAlert(
                  "info",
                  "Ticket recuperado",
                  "Se restauró el ticket que tenías sin guardar."
                )
              }
            } catch {
              localStorage.removeItem(STORAGE_KEY)
            }
          }
        }
      } catch (err) {
        console.error(err)
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar la información de ventas."
        )
      } finally {
        setLoadingCatalogs(false)
      }
    }

    loadData()
  }, [restoredDraft])

  useEffect(() => {
    if (loadingCatalogs) return
    if (typeof window === "undefined") return

    const payload: PersistedSale = {
      currentSaleId,
      currentSaleStatus,
      selectedPendingTicket,
      paymentMethod,
      cashReceived,
      cart,
      selectedClientId: selectedClient.id,
    }

    const hasSomethingToSave =
      cart.length > 0 ||
      !!currentSaleId ||
      !!selectedPendingTicket ||
      !!paymentMethod ||
      cashReceived !== "" ||
      selectedClient.id !== "1"

    if (hasSomethingToSave) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [
    loadingCatalogs,
    currentSaleId,
    currentSaleStatus,
    selectedPendingTicket,
    paymentMethod,
    cashReceived,
    cart,
    selectedClient,
  ])

  const refreshPendingTickets = async () => {
    try {
      const pendingRes = await fetchJson<PendingTicketApi[]>(
        ENDPOINTS.ventasPendientes
      )
      setPendingTickets(pendingRes.map(normalizePendingTicket))
    } catch (err) {
      console.error("Error al refrescar pendientes:", err)
    }
  }

  const resetSaleState = (keepClients = true) => {
    const generalClient = clients.find((client) => client.id === "1") ?? {
      id: "1",
      name: "Cliente general",
      phone: "",
      email: "",
      discount: 0,
    }

    setCart([])
    setCurrentSaleId(null)
    setCurrentSaleStatus("")
    setSelectedPendingTicket("")
    setPaymentMethod("")
    setCashReceived("")
    setDirectCode("")
    setCodeError("")
    if (keepClients) {
      setSelectedClient(generalClient)
    }

    clearPersistedSale()
  }

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) return products

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.code.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
    )
  }, [search, products])

  const filteredClients = useMemo(() => {
    const term = clientSearch.toLowerCase().trim()
    if (!term) return clients

    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) ||
        client.phone.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term)
    )
  }, [clientSearch, clients])

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
    const deletedItem = cart.find((item) => item.id === id)

    setCart((prev) => prev.filter((item) => item.id !== id))

    if (deletedItem) {
      showAlert(
        "info",
        "Producto eliminado",
        `${deletedItem.name} se quitó del ticket.`
      )
    }
  }

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  }, [cart])

  const discount = useMemo(() => {
    return Number(((subtotal * selectedClient.discount) / 100).toFixed(2))
  }, [subtotal, selectedClient.discount])

  const total = useMemo(() => {
    return Number((subtotal - discount).toFixed(2))
  }, [subtotal, discount])

  const totalItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0)
  }, [cart])

  const cashReceivedNumber = Number(cashReceived || 0)
  const cashChange = cashReceivedNumber - total
  const isCashInsufficient =
    paymentMethod === "efectivo" &&
    cashReceived !== "" &&
    cashReceivedNumber < total

  const isPendingLoaded = !!currentSaleId && currentSaleStatus === "pendiente"

  const savePayload = {
    id_cliente: Number(selectedClient.id || 1),
    id_usuario: 1,
    metodo_pago: null,
    estatus: "pendiente",
    observaciones: "",
    items: cart.map((item) => ({
      id_producto: item.id,
      cantidad: item.quantity,
    })),
  }

  const chargePayload = {
    id_cliente: Number(selectedClient.id || 1),
    id_usuario: 1,
    metodo_pago: paymentMethod,
    estatus: "finalizada",
    observaciones: "",
    items: cart.map((item) => ({
      id_producto: item.id,
      cantidad: item.quantity,
    })),
  }

  useEffect(() => {
    if (!error && !codeError) return

    const timeout = setTimeout(() => {
      if (error) setError("")
      if (codeError) setCodeError("")
    }, 3000)

    return () => clearTimeout(timeout)
  }, [error, codeError])

  const handleRecoverTicket = async (ticketId: string) => {
    try {
      setLoadingTicket(true)
      setCodeError("")

      const venta = await fetchJson<VentaApi>(ENDPOINTS.ventaById(ticketId))

      const clientFromVenta = clients.find(
        (c) => c.id === String(venta.id_cliente ?? "1")
      ) ?? {
        id: String(venta.id_cliente ?? "1"),
        name: venta.cliente_nombre ?? "Cliente general",
        phone: venta.cliente_telefono ?? "",
        email: venta.cliente_correo ?? "",
        discount: 0,
      }

      const items: CartItem[] = venta.items.map((item) => {
        const productMatch = products.find(
          (product) => product.id === Number(item.id_producto)
        )

        return {
          id: Number(item.id_producto),
          name: item.nombre ?? item.name ?? productMatch?.name ?? "Producto",
          code: item.codigo_producto ?? item.code ?? productMatch?.code ?? "",
          price: Number(item.precio_unitario ?? productMatch?.price ?? 0),
          stock: Number(item.stock_actual ?? productMatch?.stock ?? 0),
          category:
            item.categoria_nombre ??
            item.category ??
            productMatch?.category ??
            "General",
          quantity: Number(item.cantidad),
        }
      })

      setCurrentSaleId(String(venta.id))
      setCurrentSaleStatus(venta.estatus)
      setSelectedPendingTicket(String(venta.id))
      setTicketComboOpen(false)
      setSelectedClient(clientFromVenta)
      setPaymentMethod(venta.metodo_pago ?? "")
      setCashReceived("")
      setCart(items)
      setDirectCode("")
      setCodeError("")

      showAlert(
        "info",
        "Ticket recuperado",
        `Se cargó el ticket ${venta.folio} correctamente.`
      )
    } catch (err) {
      console.error(err)
      setCodeError(
        err instanceof Error
          ? err.message
          : "No se pudo recuperar el ticket pendiente."
      )
    } finally {
      setLoadingTicket(false)
    }
  }

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client)
    setClientModalOpen(false)
    setClientSearch("")
  }

  const handleNewSale = () => {
    resetSaleState()
    showAlert("success", "Nueva venta", "Se inició un ticket nuevo.")
  }

  const handleGuardar = async () => {
    try {
      if (cart.length === 0) {
        setCodeError("Agrega al menos un producto al ticket.")
        return
      }

      setSaving(true)

      if (isPendingLoaded && currentSaleId) {
        await fetchJson(ENDPOINTS.actualizarVenta(currentSaleId), {
          method: "PUT",
          body: JSON.stringify(savePayload),
        })

        showAlert(
          "success",
          "Venta actualizada",
          "La venta pendiente se actualizó correctamente."
        )
      } else {
        await fetchJson(ENDPOINTS.crearVenta, {
          method: "POST",
          body: JSON.stringify(savePayload),
        })

        showAlert(
          "success",
          "Venta guardada",
          "La venta se guardó como pendiente correctamente."
        )
      }

      await refreshPendingTickets()
      resetSaleState()
    } catch (err) {
      console.error(err)
      setCodeError(
        err instanceof Error ? err.message : "No se pudo guardar la venta."
      )
      showAlert("error", "Error", "No se pudo guardar la venta.")
    } finally {
      setSaving(false)
    }
  }

  const handleCobrar = async () => {
    try {
      if (cart.length === 0) {
        setCodeError("Agrega al menos un producto al ticket.")
        return
      }

      if (!paymentMethod) {
        setCodeError("Selecciona un método de pago.")
        return
      }

      if (paymentMethod === "efectivo" && isCashInsufficient) {
        setCodeError("El monto recibido es menor al total a cobrar.")
        return
      }

      setSaving(true)

      if (isPendingLoaded && currentSaleId) {
        await fetchJson(ENDPOINTS.finalizarVenta(currentSaleId), {
          method: "POST",
          body: JSON.stringify({
            id_usuario: 1,
            metodo_pago: paymentMethod,
            observaciones: "",
          }),
        })
      } else {
        await fetchJson(ENDPOINTS.crearVenta, {
          method: "POST",
          body: JSON.stringify(chargePayload),
        })
      }

      await refreshPendingTickets()
      resetSaleState()

      showAlert(
        "success",
        "Venta cobrada",
        "La venta se cobró y cerró correctamente."
      )
    } catch (err) {
      console.error(err)
      setCodeError(
        err instanceof Error ? err.message : "No se pudo cobrar la venta."
      )
      showAlert("error", "Error", "No se pudo cobrar la venta.")
    } finally {
      setSaving(false)
    }
  }

  const handleCancelar = async () => {
    try {
      if (!isPendingLoaded || !currentSaleId) return

      setSaving(true)

      await fetchJson(ENDPOINTS.cancelarVenta(currentSaleId), {
        method: "POST",
        body: JSON.stringify({
          id_usuario: 1,
        }),
      })

      await refreshPendingTickets()
      resetSaleState()

      showAlert(
        "success",
        "Venta cancelada",
        "La venta pendiente se canceló correctamente."
      )
    } catch (err) {
      console.error(err)
      setCodeError(
        err instanceof Error ? err.message : "No se pudo cancelar la venta."
      )
      showAlert("error", "Error", "No se pudo cancelar la venta.")
    } finally {
      setSaving(false)
    }
  }

  if (loadingCatalogs) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando ventas...
        </div>
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 overflow-hidden bg-background">
      <div className="mx-auto flex h-full min-h-0 max-w-[1900px] flex-col gap-6 overflow-hidden">
        {uiAlert && (
          <Alert
            className={cn(
              "shrink-0",
              uiAlert.type === "success" &&
                "border-green-400 bg-green-400/15 text-green-900 dark:text-green-300",
              uiAlert.type === "error" &&
                "border-red-400 bg-red-400/15 text-red-900 dark:text-red-300",
              uiAlert.type === "info" &&
                "border-blue-400 bg-blue-400/15 text-blue-900 dark:text-blue-300"
            )}
          >
            {uiAlert.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : uiAlert.type === "error" ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <Info className="h-4 w-4" />
            )}

            <AlertTitle>{uiAlert.title}</AlertTitle>
            <AlertDescription>{uiAlert.message}</AlertDescription>
          </Alert>
        )}

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

                              {loadingTicket &&
                              selectedPendingTicket === ticket.id ? (
                                <Loader2 className="mt-0.5 h-4 w-4 animate-spin" />
                              ) : (
                                <Check
                                  className={cn(
                                    "mt-0.5 h-4 w-4 shrink-0",
                                    selectedPendingTicket === ticket.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

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
                                    <span>•</span>
                                    <span>Desc. {client.discount}%</span>
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

            {error ? (
              <p className="text-sm font-medium text-destructive">{error}</p>
            ) : codeError ? (
              <p className="text-sm font-medium text-destructive">
                {codeError}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
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
                      {selectedClient.name || "Cliente general"}
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1">
                      {totalItems} artículos
                    </Badge>
                    {isPendingLoaded && (
                      <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400">
                        Pendiente
                      </Badge>
                    )}
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
                        Descuento ({selectedClient.discount}%)
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
                    <Button
                      variant="outline"
                      className="h-11"
                      onClick={handleGuardar}
                      disabled={saving || cart.length === 0}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Guardar"
                      )}
                    </Button>

                    <Button
                      variant="destructive"
                      className="h-11"
                      onClick={handleCancelar}
                      disabled={!isPendingLoaded || saving}
                    >
                      Cancelar
                    </Button>
                  </div>

                  <Button
                    size="lg"
                    className="h-12 w-full text-base font-semibold"
                    onClick={handleCobrar}
                    disabled={
                      saving ||
                      cart.length === 0 ||
                      !paymentMethod ||
                      (paymentMethod === "efectivo" &&
                        (cashReceived === "" || cashReceivedNumber < total))
                    }
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
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
