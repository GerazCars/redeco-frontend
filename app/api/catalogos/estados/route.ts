import { obtenerEstados } from "@/lib/api/catalogos";
import { ApiError } from "@/lib/api/client";

export async function GET() {
  try {
    const data = await obtenerEstados();

    return Response.json(data);
  } catch (error) {
    console.error(
      "Error consultando estados SEPOMEX:",
      error
    );

    const status =
      error instanceof ApiError
        ? error.status ?? 502
        : 500;

    const mensaje =
      error instanceof Error
        ? error.message
        : "Error desconocido al consultar SEPOMEX";

    return Response.json(
      {
        error: "No fue posible consultar los estados",
        detalle: mensaje,
        servicio: "SEPOMEX",
        codigoHTTP: error instanceof ApiError
          ? error.status
          : null,
      },
      {
        status,
      }
    );
  }
}