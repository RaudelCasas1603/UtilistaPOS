"use client"

import { useState } from "react"
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
} from "lucide-react"

/* ===========================
   Datos de ejemplo
   =========================== */
const categoriasIniciales = [
  {
    id: 1,
    nombre: "Bebidas",
    descripcion: "Productos líquidos",
    activa: true,
  },
  {
    id: 2,
    nombre: "Snacks",
    descripcion: "Botanas y frituras",
    activa: false,
  },
  {
    id: 3,
    nombre: "Lácteos",
    descripcion: "Leche, queso y yogurt",
    activa: true,
  },
  {
    id: 4,
    nombre: "Limpieza",
    descripcion: "Productos de limpieza para el hogar",
    activa: true,
  },
  {
    id: 5,
    nombre: "Papelería",
    descripcion: "Artículos escolares y de oficina",
    activa: false,
  },
]

type Categoria = {
  id: number
  nombre: string
  descripcion: string
  activa: boolean
}

type CategoriaCardProps = {
  categoria: Categoria
}

/* ===========================
   Card de categoría
   =========================== */
function CategoriaCard({ categoria }: CategoriaCardProps) {
  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState(categoria.nombre)
  const [descripcion, setDescripcion] = useState(categoria.descripcion)

  const cancelarEdicion = () => {
    setNombre(categoria.nombre)
    setDescripcion(categoria.descripcion)
    setEditando(false)
  }

  const guardarCambios = () => {
    // Aquí conectas API o Server Action
    console.log("Guardar cambios:", {
      id: categoria.id,
      nombre,
      descripcion,
    })

    setEditando(false)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-2">
          <div className="flex-1">
            {editando ? (
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="font-semibold"
              />
            ) : (
              <span>{categoria.nombre}</span>
            )}
          </div>

          {categoria.activa ? (
            <span className="shrink-0 text-xs font-medium text-green-600">
              Activa
            </span>
          ) : (
            <span className="shrink-0 text-xs font-medium text-red-600">
              Inactiva
            </span>
          )}
        </CardTitle>

        <CardDescription>
          {editando ? (
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
            />
          ) : (
            categoria.descripcion
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
              >
                <Pencil className="mr-1 h-4 w-4" />
                Editar
              </Button>

              <Button size="sm" variant="destructive">
                <Trash2 className="mr-1 h-4 w-4" />
                Eliminar
              </Button>

              {categoria.activa ? (
                <Button size="sm" variant="secondary">
                  <XCircle className="mr-1 h-4 w-4" />
                  Desactivar
                </Button>
              ) : (
                <Button size="sm" variant="secondary">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Activar
                </Button>
              )}
            </>
          ) : (
            <>
              <Button size="sm" onClick={guardarCambios}>
                <Check className="mr-1 h-4 w-4" />
                Guardar
              </Button>

              <Button size="sm" variant="outline" onClick={cancelarEdicion}>
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

/* ===========================
   Pantalla principal
   =========================== */
export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasIniciales)

  const [open, setOpen] = useState(false)
  const [nuevaNombre, setNuevaNombre] = useState("")
  const [nuevaDescripcion, setNuevaDescripcion] = useState("")

  const crearCategoria = () => {
    if (!nuevaNombre.trim()) return

    const nuevaCategoria: Categoria = {
      id: categorias.length ? Math.max(...categorias.map((c) => c.id)) + 1 : 1,
      nombre: nuevaNombre.trim(),
      descripcion: nuevaDescripcion.trim(),
      activa: true,
    }

    setCategorias((prev) => [nuevaCategoria, ...prev])
    setNuevaNombre("")
    setNuevaDescripcion("")
    setOpen(false)

    console.log("Nueva categoría creada:", nuevaCategoria)
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold">Administración de Categorías</h2>
        <p className="text-muted-foreground">
          Crea, edita o administra las categorías de tus productos
        </p>
      </div>

      {/* Botón crear */}
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
              >
                Cancelar
              </Button>
              <Button onClick={crearCategoria}>
                <Plus className="mr-2 h-4 w-4" />
                Crear categoría
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid de cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {categorias.map((categoria) => (
          <CategoriaCard key={categoria.id} categoria={categoria} />
        ))}
      </div>
    </div>
  )
}
