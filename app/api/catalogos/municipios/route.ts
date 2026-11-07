import { obtenerMunicipios } from "@/lib/api/catalogos";
import { ApiError } from "@/lib/api/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const estadoId = searchParams.get("estado_id");
    const cp = searchParams.get("cp");

    // Validar parámetros obligatorios
    if (!estadoId || !cp) {
      return Response.json(
        {
          error: "estado_id y cp son obligatorios",
        },
        { status: 400 }
      );
    }

    // Validar identificador del estado
    if (!/^\d+$/.test(estadoId) || Number(estadoId) <= 0) {
      return Response.json(
        {
          error: "El identificador del estado no es válido",
        },
        { status: 400 }
      );
    }

    // Validar código postal
    if (!/^\d{5}$/.test(cp)) {
      return Response.json(
        {
          error: "El código postal debe contener 5 dígitos",
        },
        { status: 400 }
      );
    }

    const data = await obtenerMunicipios(
      Number(estadoId),
      cp
    );

    return Response.json(data);

  } catch (error) {
    console.error("Error consultando municipios SEPOMEX:", error);

    const status =
      error instanceof ApiError
        ? error.status ?? 502
        : 500;

    const detalle =
      error instanceof Error
        ? error.message
        : "Error desconocido al consultar municipios";

    return Response.json(
      {
        error: "No fue posible consultar los municipios",
        detalle,
        servicio: "SEPOMEX",
        codigoHTTP:
          error instanceof ApiError ? error.status : null,
      },
      { status }
    );
  }
}