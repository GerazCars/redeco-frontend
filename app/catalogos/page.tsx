"use client";

import { useEffect, useState } from "react";

interface Medio {
  medioId: number;
  medioDsc: string;
}

interface RespuestaMedios {
  medio: Medio[];
}

export default function CatalogosPage() {
  const [medios, setMedios] = useState<Medio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarMedios() {
      try {
        const response = await fetch(
          "/api/catalogos/medios-recepcion"
        );

        if (!response.ok) {
          throw new Error("Error al consultar REDECO");
        }

        const data: RespuestaMedios = await response.json();

        setMedios(data.medio);
      } catch (error) {
        console.error(error);
        setError("No fue posible cargar el catálogo.");
      } finally {
        setCargando(false);
      }
    }

    cargarMedios();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">

        {/* Encabezado */}
        <div className="mb-8 rounded-xl bg-slate-900 p-8 shadow-lg">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-400">
            Sistema REDECO
          </p>

          <h1 className="text-3xl font-bold text-white">
            Catálogo de medios de recepción
          </h1>

          <p className="mt-2 text-slate-300">
            Información obtenida directamente desde la API de REDECO.
          </p>
        </div>

        {/* Contenido */}
        <div className="overflow-hidden rounded-xl bg-white shadow-lg">

          {/* Barra superior */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Medios disponibles
              </h2>

              <p className="text-sm text-slate-500">
                Catálogo proporcionado por CONDUSEF
              </p>
            </div>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              {medios.length} registros
            </span>
          </div>

          {/* Cargando */}
          {cargando && (
            <div className="p-8 text-center text-slate-600">
              Cargando información desde REDECO...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Tabla */}
          {!cargando && !error && (
            <table className="w-full">

              <thead className="bg-blue-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    ID
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Medio de recepción
                  </th>
                </tr>
              </thead>

              <tbody>
                {medios.map((medio, index) => (
                  <tr
                    key={medio.medioId}
                    className={
                      index % 2 === 0
                        ? "bg-white"
                        : "bg-slate-50"
                    }
                  >
                    <td className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-700">
                      {medio.medioId}
                    </td>

                    <td className="border-b border-slate-200 px-6 py-4 text-slate-800">
                      {medio.medioDsc}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          )}

        </div>

        {/* Pie */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Frontend REDECO — Proyecto de Negocios Electrónicos
        </p>

      </div>
    </main>
  );
}