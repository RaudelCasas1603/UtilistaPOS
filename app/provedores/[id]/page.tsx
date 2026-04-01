import providersData from "../providers.json"

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function ProveedorDetallePage({ params }: Props) {
  const { id } = await params

  const proveedor = (providersData as any[]).find((p) => String(p.id) === id)

  if (!proveedor) {
    return <div className="p-6">Proveedor no encontrado</div>
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">{proveedor.nombre}</h1>
      <p>ID: {proveedor.id}</p>
      <p>Teléfono: {proveedor.telefono}</p>
      <p>Correo: {proveedor.correo}</p>
      <p>Empresa: {proveedor.empresa}</p>
      <p>Referencia: {proveedor.referencia}</p>
    </div>
  )
}
