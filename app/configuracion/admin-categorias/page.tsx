
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function adminCategorias(){
    return(
        <>
        <div>
        <h2 className="text-2xl font-bold">Administracion de Categorias</h2>
        <span className="text-lg">En esta ventana podras crear, editar, modificar o eliminar las categorias de los productos que manejas</span>
        </div>

        {/**Contenedor de las categorias */}
        <div>

        <Card>
            <CardHeader>
                <CardTitle>
                    
                </CardTitle>
            </CardHeader>
        </Card>

        </div>
        </>
    )
}