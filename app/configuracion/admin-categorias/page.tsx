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
    nombre: "Snacks",
    descripcion: "Botanas y frituras",
    activa: false,
  },
   {
    id: 4,
    nombre: "Snacks",
    descripcion: "Botanas y frituras",
    activa: false,
  },
   {
    id: 5,
    nombre: "Snacks",
    descripcion: "Botanas y frituras",
    activa: false,
  },
]

/* ===========================
   Card de categoría
   =========================== */
function CategoriaCard({ categoria }) {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-2">

          {editando ? (
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="font-semibold"
            />
          ) : (
            <span>{categoria.nombre}</span>
          )}

          {categoria.activa ? (
            <span className="text-xs font-medium text-green-600">
              Activa
            </span>
          ) : (
            <span className="text-xs font-medium text-red-600">
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
        <div className="flex gap-2 flex-wrap">

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

              <Button
                size="sm"
                variant="outline"
                onClick={cancelarEdicion}
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

/* ===========================
   Pantalla principal
   =========================== */
export default function AdminCategorias() {
  const [categorias] = useState(categoriasIniciales)

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold">
          Administración de Categorías
        </h2>
        <p className="text-muted-foreground">
          Crea, edita o administra las categorías de tus productos
        </p>
      </div>

      {/* Botón crear */}
      <div className="flex justify-end">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva categoría
        </Button>
      </div>

      {/* Grid de cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {categorias.map((categoria) => (
          <CategoriaCard
            key={categoria.id}
            categoria={categoria}
          />
        ))}
      </div>

    </div>
  )
}
