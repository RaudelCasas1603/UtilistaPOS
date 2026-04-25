"use client"

import * as React from "react"
import { Loader2, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

type Props = {
  corteId: number
}

export default function ReimprimirCorteButton({ corteId }: Props) {
  const [loading, setLoading] = React.useState(false)

  async function handleReimprimir() {
    try {
      setLoading(true)

      const res = await fetch(`${API_URL}/impresion/corte-caja/${corteId}`, {
        method: "POST",
      })

      if (!res.ok) {
        throw new Error("No se pudo reimprimir el corte")
      }

      alert("Corte reimpreso correctamente")
    } catch (error) {
      console.error(error)
      alert("No se pudo reimprimir el corte")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
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
