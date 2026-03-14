"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { HandCoins, ReceiptText } from "lucide-react"

type Period = "day" | "week" | "month"

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period | undefined>()

  return (
    <>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="w-56">
          <Select
            value={period}
            onValueChange={(value: Period) => setPeriod(value)}
          >
            <SelectTrigger className="h-12 text-base">
              {" "}
              <SelectValue placeholder="Periodo de tiempo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Día</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-2 grid w-4/5 grid-cols-4 gap-2">
        <Card className="h-20 justify-center bg-card px-2">
          <CardHeader>
            <div className="flex items-center gap-2 text-muted-foreground/60">
              <HandCoins className="h-4 w-4" />
              <CardTitle className="text-sm">Ventas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-foreground">8220.25</p>
          </CardContent>
        </Card>
        <Card className="h-20 justify-center bg-card px-2">
          <CardHeader>
            <div className="flex items-center gap-2 text-muted-foreground/60">
              <ReceiptText className="h-4 w-4" />
              <CardTitle className="text-sm">Tickets</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-foreground">8220.25</p>
          </CardContent>
        </Card>

        <Card className="h-20 justify-center bg-card">
          <CardHeader>
            <CardTitle>Ticket Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">567,899</p>
          </CardContent>
        </Card>

        <Card className="h-20 justify-center bg-card">
          <CardHeader>
            <CardTitle>Stock Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">567,899</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
