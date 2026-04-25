"use client"

import * as React from "react"
import { Printer, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

type Props = {
  ventaId: number
}

export default function ReimprimirVentaButton({ ventaId }: Props) {
  const [loading, setLoading] = React.useState(false)

  async function handleReimprimir() {
    try {
      setLoading(true)

      const res = await fetch(`${API_URL}/impresion/ticket/${ventaId}`, {
        method: "POST",
      })

      if (!res.ok) {
        throw new Error("No se pudo reimprimir el ticket")
      }
    } catch (error) {
      console.error(error)
      alert("No se pudo reimprimir el ticket")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleReimprimir}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Printer className="h-4 w-4" />
      )}
      Reimprimir
    </Button>
  )
}
