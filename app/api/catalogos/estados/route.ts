import { obtenerEstados } from "@/lib/api/catalogos";

export async function GET() {
  try {
    const data = await obtenerEstados();

    return Response.json(data);
  } catch (error) {
    console.error(
      "Error consultando estados SEPOMEX:",
      error
    );

    return Response.json(
      {
        error: "No fue posible consultar los estados",
      },
      {
        status: 500,
      }
    );
  }
}