import { obtenerNivelesAtencion } from "@/lib/api/catalogos";

export async function GET() {
  try {
    const data = await obtenerNivelesAtencion();

    return Response.json(data);
  } catch (error) {
    console.error(
      "Error consultando niveles de atención:",
      error
    );

    return Response.json(
      {
        error:
          "No fue posible consultar los niveles de atención",
      },
      {
        status: 500,
      }
    );
  }
}