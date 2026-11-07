import { obtenerColonias } from "@/lib/api/catalogos";
import { ApiError } from "@/lib/api/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const cp = searchParams.get("cp");

    // Validar código postal
    if (!cp) {
      return Response.json(
        {
          error: "El código postal es obligatorio",
        },
        { status: 400 }
      );
    }

    if (!/^\d{5}$/.test(cp)) {
      return Response.json(
        {
          error: "El código postal debe contener 5 dígitos",
        },
        { status: 400 }
      );
    }

    const data = await obtenerColonias(cp);

    return Response.json(data);

  } catch (error) {
    console.error("Error consultando colonias SEPOMEX:", error);

    const status =
      error instanceof ApiError
        ? error.status ?? 502
        : 500;

    const detalle =
      error instanceof Error
        ? error.message
        : "Error desconocido al consultar colonias";

    return Response.json(
      {
        error: "No fue posible consultar las colonias",
        detalle,
        servicio: "SEPOMEX",
        codigoHTTP:
          error instanceof ApiError ? error.status : null,
      },
      { status }
    );
  }
}