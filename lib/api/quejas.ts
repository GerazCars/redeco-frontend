import { redecoFetch } from "./client";

export interface QuejaREDECO {
  QuejasDenominacion: string;
  QuejasSector: string;
  QuejasNoMes: number;
  QuejasNum: number;
  QuejasFolio: string;
  QuejasFecRecepcion: string;
  QuejasMedio: number;
  QuejasNivelAT: number;
  QuejasProducto: string;
  QuejasCausa: string;
  QuejasPORI: string;
  QuejasEstatus: number;
  QuejasEstados: number;
  QuejasMunId: number;
  QuejasLocId: number;
  QuejasColId: number;
  QuejasCP: number;
  QuejasTipoPersona: number;
  QuejasSexo: string;
  QuejasEdad: number;
  QuejasFecResolucion: string;
  QuejasFecNotificacion: string;
  QuejasRespuesta: number;
  QuejasNumPenal: number;
  QuejasPenalizacion: number;
}

export async function registrarQueja(
  token: string,
  queja: QuejaREDECO
) {
  return redecoFetch("/redeco/quejas", {
    method: "POST",
    headers: {
      Authorization: token,
    },
    body: JSON.stringify(queja),
  });
}