type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function ProductoDetallePage({ params }: Props) {
  const { id } = await params

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Detalle del producto</h1>
      <p className="mt-2 text-muted-foreground">ID del producto: {id}</p>
    </div>
  )
}
