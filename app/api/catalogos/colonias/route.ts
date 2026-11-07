import { obtenerColonias } from "@/lib/api/catalogos";

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const cp =
      searchParams.get("cp");

    if (!cp) {
      return Response.json(
        {
          error: "El cp es obligatorio",
        },
        {
          status: 400,
        }
      );
    }

    const data = await obtenerColonias(cp);

    return Response.json(data);
  } catch (error) {
    console.error(
      "Error consultando colonias:",
      error
    );

    return Response.json(
      {
        error:
          "No fue posible consultar las colonias",
      },
      {
        status: 500,
      }
    );
  }
}