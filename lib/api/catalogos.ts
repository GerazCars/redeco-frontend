import { redecoFetch } from "./client";

export async function obtenerMediosRecepcion() {
  return redecoFetch("/catalogos/medio-recepcion");
}

export async function obtenerNivelesAtencion() {
  return redecoFetch("/catalogos/niveles-atencion");
}

export async function obtenerEstados() {
  return redecoFetch("/sepomex/estados/");
}

export async function obtenerProductos(token: string) {
  return redecoFetch("/catalogos/products-list", {
    headers: {
      Authorization: token,
    },
  });
}

export async function obtenerCausas(
  token: string,
  producto: string
) {
  return redecoFetch(
    `/catalogos/causas-list/?product=${encodeURIComponent(producto)}`,
    {
      headers: {
        Authorization: token,
      },
    }
  );
}

// ======================================================
// SEPOMEX - MUNICIPIOS
// ======================================================

export async function obtenerMunicipios(
  estadoId: number,
  cp: string
) {
  return redecoFetch(
    `/sepomex/municipios/?estado_id=${estadoId}&cp=${encodeURIComponent(cp)}`
  );
}

// ======================================================
// SEPOMEX - COLONIAS
// ======================================================

export async function obtenerColonias(cp: string) {
  return redecoFetch(
    `/sepomex/colonias/?cp=${encodeURIComponent(cp)}`
  );
}