import { obtenerCodigosPostales } from "@/lib/api/catalogos";

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const estadoId =
      searchParams.get("estado_id");

    if (!estadoId) {
      return Response.json(
        {
          error:
            "El estado_id es obligatorio",
        },
        {
          status: 400,
        }
      );
    }

    const data = await obtenerCodigosPostales(
      Number(estadoId)
    );

    return Response.json(data);
  } catch (error) {
    console.error(
      "Error consultando códigos postales:",
      error
    );

    return Response.json(
      {
        error:
          "No fue posible consultar los códigos postales",
      },
      {
        status: 500,
      }
    );
  }
}