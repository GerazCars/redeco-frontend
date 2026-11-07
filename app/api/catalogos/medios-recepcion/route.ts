import { obtenerMediosRecepcion } from "@/lib/api/catalogos";

export async function GET() {
  try {
    const data = await obtenerMediosRecepcion();

    return Response.json(data);
  } catch (error) {
    console.error("Error consultando REDECO:", error);

    return Response.json(
      {
        error: "No fue posible consultar REDECO",
      },
      {
        status: 500,
      }
    );
  }
}