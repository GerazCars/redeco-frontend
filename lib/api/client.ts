const API_URL = process.env.REDECO_API_URL;

if (!API_URL) {
  throw new Error("REDECO_API_URL no está configurada");
}

export async function redecoFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.msg ||
        "Error al comunicarse con la API de REDECO"
    );
  }

  return data as T;
}