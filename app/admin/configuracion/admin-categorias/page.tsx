"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"

type EstatusCategoria = "activo" | "inactivo"

type CategoriaApi = {
  id: number
  nombre: string
  descripcion: string
  estatus: EstatusCategoria
  created_at?: string
  updated_at?: string
}

type Categoria = {
  id: number
  nombre: string
  descripcion: string
  estatus: EstatusCategoria
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const ENDPOINTS = {
  list: `${API_BASE}/api/categorias`,
  create: `${API_BASE}/api/categorias`,
  update: (id: number) => `${API_BASE}/api/categorias/${id}`,
  updateEstatus: (id: number) => `${API_BASE}/api/categorias/${id}/estatus`,
  remove: (id: number) => `${API_BASE}/api/categorias/${id}`,
}

function normalizeEstatus(value: unknown): EstatusCategoria {
  if (typeof value === "string") {
    const v = value.trim().toLowerCase()
    if (v === "activo" || v === "inactivo") return v
  }
  return "inactivo"
}

function normalizeCategoria(item: CategoriaApi): Categoria {
  return {
    id: Number(item.id),
    nombre: item.nombre ?? "",
    descripcion: item.descripcion ?? "",
    estatus: normalizeEstatus(item.estatus),
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
        if (text) message = `${message} - ${text}`
      } catch {}
    }

    throw new Error(message)
  }

  return response.json()
}

type CategoriaCardProps = {
  categoria: Categoria
  onUpdated: (categoria: Categoria) => void
  onDeleted: (id: number) => void
}

function CategoriaCard({
  categoria,
  onUpdated,
  onDeleted,
}: CategoriaCardProps) {
  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState(categoria.nombre)
  const [descripcion, setDescripcion] = useState(categoria.descripcion)

  const [guardando, setGuardando] = useState(false)
  const [cambiandoEstatus, setCambiandoEstatus] = useState(false)
  const [eliminando, setEliminando] = useState(false)

  useEffect(() => {
    setNombre(categoria.nombre)
    setDescripcion(categoria.descripcion)
  }, [categoria])

  const cancelarEdicion = () => {
    setNombre(categoria.nombre)
    setDescripcion(categoria.descripcion)
    setEditando(false)
  }

  const guardarCambios = async () => {
    if (!nombre.trim()) return

    try {
      setGuardando(true)

      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        estatus: categoria.estatus,
      }

      const response = await fetchJson<CategoriaApi>(
        ENDPOINTS.update(categoria.id),
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      )

      onUpdated(normalizeCategoria(response))
      setEditando(false)
    } catch (error) {
      console.error("Error al actualizar categoría:", error)
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la categoría."
      )
    } finally {
      setGuardando(false)
    }
  }

  const toggleEstatus = async () => {
    try {
      setCambiandoEstatus(true)

      const nuevoEstatus: EstatusCategoria =
        categoria.estatus === "activo" ? "inactivo" : "activo"

      const response = await fetchJson<CategoriaApi>(
        ENDPOINTS.updateEstatus(categoria.id),
        {
          method: "PATCH",
          body: JSON.stringify({ estatus: nuevoEstatus }),
        }
      )

      onUpdated(normalizeCategoria(response))
    } catch (error) {
      console.error("Error al cambiar estatus:", error)
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estatus."
      )
    } finally {
      setCambiandoEstatus(false)
    }
  }

  const eliminarCategoria = async () => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar la categoría "${categoria.nombre}"?`
    )

    if (!confirmar) return

    try {
      setEliminando(true)

      await fetchJson<CategoriaApi>(ENDPOINTS.remove(categoria.id), {
        method: "DELETE",
      })

      onDeleted(categoria.id)
    } catch (error) {
      console.error("Error al eliminar categoría:", error)
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la categoría."
      )
    } finally {
      setEliminando(false)
    }
  }

  const estaActiva = categoria.estatus === "activo"

  return (
    <Card className="h-full border-border/70 shadow-sm transition-all">
      <CardHeader className="space-y-3">
        <CardTitle className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {editando ? (
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="font-semibold"
                placeholder="Nombre de la categoría"
              />
            ) : (
              <span className="line-clamp-2 text-base font-semibold">
                {categoria.nombre}
              </span>
            )}
          </div>

          {estaActiva ? (
            <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-100 dark:text-green-700">
              Activa
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-100 dark:text-red-700">
              Inactiva
            </span>
          )}
        </CardTitle>

        <CardDescription className="min-h-[72px] text-sm leading-relaxed">
          {editando ? (
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Describe brevemente la categoría"
            />
          ) : categoria.descripcion ? (
            <span className="line-clamp-3">{categoria.descripcion}</span>
          ) : (
            <span className="text-muted-foreground/80 italic">
              Sin descripción
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2">
          {!editando ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditando(true)}
                disabled={cambiandoEstatus || eliminando}
              >
                <Pencil className="mr-1 h-4 w-4" />
                Editar
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={eliminarCategoria}
                disabled={eliminando || cambiandoEstatus}
              >
                {eliminando ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-1 h-4 w-4" />
                )}
                Eliminar
              </Button>

              {estaActiva ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={toggleEstatus}
                  disabled={cambiandoEstatus || eliminando}
                >
                  {cambiandoEstatus ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-1 h-4 w-4" />
                  )}
                  Desactivar
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={toggleEstatus}
                  disabled={cambiandoEstatus || eliminando}
                >
                  {cambiandoEstatus ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-1 h-4 w-4" />
                  )}
                  Activar
                </Button>
              )}
            </>
          ) : (
            <>
              <Button size="sm" onClick={guardarCambios} disabled={guardando}>
                {guardando ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-1 h-4 w-4" />
                )}
                Guardar
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={cancelarEdicion}
                disabled={guardando}
              >
                <X className="mr-1 h-4 w-4" />
                Cancelar
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [open, setOpen] = useState(false)
  const [nuevaNombre, setNuevaNombre] = useState("")
  const [nuevaDescripcion, setNuevaDescripcion] = useState("")
  const [creando, setCreando] = useState(false)

  const totalActivas = categorias.filter((c) => c.estatus === "activo").length
  const totalInactivas = categorias.filter(
    (c) => c.estatus === "inactivo"
  ).length

  const categoriasOrdenadas = useMemo(() => {
    return [...categorias].sort((a, b) => a.id - b.id)
  }, [categorias])

  const cargarCategorias = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetchJson<CategoriaApi[]>(ENDPOINTS.list)
      const normalizadas = response.map(normalizeCategoria)

      setCategorias(normalizadas)
    } catch (error) {
      console.error("Error al obtener categorías:", error)
      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las categorías."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarCategorias()
  }, [])

  const crearCategoria = async () => {
    if (!nuevaNombre.trim()) return

    try {
      setCreando(true)

      const payload = {
        nombre: nuevaNombre.trim(),
        descripcion: nuevaDescripcion.trim(),
        estatus: "activo" as EstatusCategoria,
      }

      const response = await fetchJson<CategoriaApi>(ENDPOINTS.create, {
        method: "POST",
        body: JSON.stringify(payload),
      })

      const nueva = normalizeCategoria(response)

      setCategorias((prev) => [nueva, ...prev])
      setNuevaNombre("")
      setNuevaDescripcion("")
      setOpen(false)
    } catch (error) {
      console.error("Error al crear categoría:", error)
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo crear la categoría."
      )
    } finally {
      setCreando(false)
    }
  }

  const handleUpdated = (categoriaActualizada: Categoria) => {
    setCategorias((prev) =>
      prev.map((c) =>
        c.id === categoriaActualizada.id ? categoriaActualizada : c
      )
    )
  }

  const handleDeleted = (id: number) => {
    setCategorias((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Administración de Categorías
          </h2>
          <p className="text-muted-foreground">
            Crea, edita, activa, desactiva o elimina categorías de productos.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Card className="min-w-[120px] border-border/70 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{categorias.length}</p>
            </CardContent>
          </Card>

          <Card className="min-w-[120px] border-border/70 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Activas</p>
              <p className="text-2xl font-bold">{totalActivas}</p>
            </CardContent>
          </Card>

          <Card className="min-w-[120px] border-border/70 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Inactivas</p>
              <p className="text-2xl font-bold">{totalInactivas}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva categoría
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear nueva categoría</DialogTitle>
              <DialogDescription>
                Agrega una nueva categoría para organizar tus productos.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  placeholder="Ej. Abarrotes"
                  value={nuevaNombre}
                  onChange={(e) => setNuevaNombre(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  placeholder="Describe brevemente la categoría"
                  value={nuevaDescripcion}
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  setNuevaNombre("")
                  setNuevaDescripcion("")
                }}
                disabled={creando}
              >
                Cancelar
              </Button>

              <Button onClick={crearCategoria} disabled={creando}>
                {creando ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Crear categoría
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando categorías...
          </div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-950 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : categoriasOrdenadas.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No hay categorías registradas todavía.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          {categoriasOrdenadas.map((categoria) => (
            <CategoriaCard
              key={categoria.id}
              categoria={categoria}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  )
}
