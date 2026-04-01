type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function ProductoDetallePage({ params }: Props) {
  const { id } = await params

  return (
    <>
    <div className="p-6">
      <h1 className="text-2xl font-bold">Detalle del producto</h1>
      <p className="mt-2 text-muted-foreground">ID del producto: {id}</p>
    </div>

    <div>
      <div className="flex justify-between h-full">
        <div className="w-1/2 border-2">
          informacion 
        </div>
        <div className="w-1/2 border-2">
          grafica
        </div>
      </div>
      <div className="border-4">
      grafica grande 
      </div>
    </div>
    </>
  )
}
