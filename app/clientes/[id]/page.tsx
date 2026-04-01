import clientsData from "../clientes.json"

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function ClienteDetallePage({ params }: Props) {
  const { id } = await params

  const cliente = (clientsData as any[]).find((c) => String(c.id) === id)

  if (!cliente) {
    return <div className="p-6">Cliente no encontrado</div>
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">{cliente.nombre}</h1>
      <p>ID: {cliente.id}</p>
      <p>Teléfono: {cliente.telefono}</p>
      <p>Correo: {cliente.correo}</p>
      <p>Descuento: {cliente.descuento}%</p>
      <p>Referencia: {cliente.referencia}</p>
    </div>
  )
}
