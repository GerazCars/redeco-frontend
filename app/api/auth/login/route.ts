import { obtenerToken } from "@/lib/api/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = body.username;
    const password = body.password;

    if (!username || !password) {
      return Response.json(
        {
          error: "Usuario y contraseña son obligatorios",
        },
        {
          status: 400,
        }
      );
    }

    const data = await obtenerToken(username, password);

    return Response.json({
      message: "Autenticación exitosa",
      user: data.user,
    });
  } catch (error) {
    console.error("Error de autenticación:", error);

    return Response.json(
      {
        error: "No fue posible autenticar al usuario",
      },
      {
        status: 401,
      }
    );
  }
}