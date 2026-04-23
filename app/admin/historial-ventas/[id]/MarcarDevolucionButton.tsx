"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

type VentaItem = {
  id: number
  producto: string
  codigo: string
  cantidad: number
  precioUnitario: number
  importe: number
  idProducto?: number
}

type Props = {
  ventaId: number
  clienteId: number
  usuarioId: number
  items: VentaItem[]
}

export default function MarcarDevolucionButton({
  ventaId,
  clienteId,
  usuarioId,
  items,
}: Props) {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [motivo, setMotivo] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const payloadItems = useMemo(() => {
    return items.map((item) => ({
      id_producto: item.idProducto ?? item.id,
      cantidad: Number(item.cantidad ?? 0),
      precio_unitario: Number(item.precioUnitario ?? 0),
      motivo: motivo.trim() || null,
    }))
  }, [items, motivo])

  async function handleSubmit() {
    try {
      setError("")
      setSuccess("")

      if (!motivo.trim()) {
        setError("Captura el motivo de la devolución.")
        return
      }

      if (!items.length) {
        setError("La venta no tiene productos para devolver.")
        return
      }

      setLoading(true)

      const res = await fetch(`${API_URL}/devoluciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_venta: ventaId,
          id_cliente: clienteId,
          id_usuario: usuarioId,
          motivo: motivo.trim(),
          items: payloadItems,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.message || "No se pudo registrar la devolución")
      }

      setSuccess("La devolución se registró correctamente.")
      setOpen(false)
      setMotivo("")
      router.refresh()
      router.push(`/devoluciones/${data.id}`)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al registrar la devolución"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {error ? (
        <Alert variant="destructive" className="mb-3">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {success ? (
        <Alert className="mb-3">
          <AlertTitle>Listo</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Marcar como devolución
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar devolución</DialogTitle>
            <DialogDescription>
              Se generará una devolución para la venta #{ventaId}. Captura el
              motivo para continuar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Producto defectuoso, error de cobro, cliente canceló la compra..."
              rows={5}
            />

            <div className="rounded-xl border p-3 text-sm text-muted-foreground">
              Se enviarán {items.length} producto(s) de esta venta a la
              devolución.
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>

            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Confirmar devolución"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
