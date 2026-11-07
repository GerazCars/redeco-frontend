const API_URL = process.env.REDECO_API_URL;

if (!API_URL) {
  throw new Error("REDECO_API_URL no está configurada");
}

// Error personalizado para identificar fallas de la API externa
export class ApiError extends Error {
  status: number | null;

  constructor(message: string, status: number | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function redecoFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let response: Response;

  try {
    const headers = new Headers(options.headers);

    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error("Error de conexión con CONDUSEF:", error);

    throw new ApiError(
      "No fue posible establecer conexión con CONDUSEF.",
      null
    );
  }

  const texto = await response.text();

  let data: unknown = null;

  if (texto) {
    try {
      data = JSON.parse(texto);
    } catch {
      if (response.ok) {
        throw new ApiError(
          "CONDUSEF devolvió una respuesta que no es JSON.",
          response.status
        );
      }
    }
  }

  if (!response.ok) {
    const respuesta = data as {
      message?: string;
      msg?: string;
      error?: string;
    } | null;

    const mensaje =
      respuesta?.message ||
      respuesta?.msg ||
      respuesta?.error ||
      `CONDUSEF respondió HTTP ${response.status} ${response.statusText}`;

    throw new ApiError(mensaje, response.status);
  }

  return data as T;
}