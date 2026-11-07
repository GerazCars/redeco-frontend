import { obtenerMunicipios } from "@/lib/api/catalogos";

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const estadoId =
      searchParams.get("estado_id");

    const cp =
      searchParams.get("cp");

    if (!estadoId || !cp) {
      return Response.json(
        {
          error:
            "estado_id y cp son obligatorios",
        },
        {
          status: 400,
        }
      );
    }

    const data = await obtenerMunicipios(
      Number(estadoId),
      cp
    );

    return Response.json(data);
  } catch (error) {
    console.error(
      "Error consultando municipios:",
      error
    );

    return Response.json(
      {
        error:
          "No fue posible consultar los municipios",
      },
      {
        status: 500,
      }
    );
  }
}