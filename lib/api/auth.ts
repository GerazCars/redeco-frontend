import https from "https";

const API_URL = process.env.REDECO_API_URL;

if (!API_URL) {
  throw new Error("REDECO_API_URL no está configurada");
}

interface RespuestaToken {
  msg: string;
  user: {
    token_access: string;
    username: string;
  };
}

export async function obtenerToken(
  username: string,
  password: string
): Promise<RespuestaToken> {
  const url = new URL("/auth/users/token/", API_URL);

  const body = JSON.stringify({
    username,
    password,
  });

  return new Promise((resolve, reject) => {
    const request = https.request(
      url,
      {
        method: "GET",

        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          try {
            const json = JSON.parse(data);

            if (
              response.statusCode &&
              response.statusCode >= 200 &&
              response.statusCode < 300
            ) {
              resolve(json);
            } else {
              reject(
                new Error(
                  json?.message ||
                    json?.msg ||
                    "Error de autenticación con REDECO"
                )
              );
            }
          } catch {
            reject(
              new Error(
                "REDECO devolvió una respuesta no válida"
              )
            );
          }
        });
      }
    );

    request.on("error", (error) => {
      reject(error);
    });

    request.write(body);
    request.end();
  });
}