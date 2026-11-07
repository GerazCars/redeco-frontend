"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import catalogoProductosCausas from "@/data/catalogo-productos-causas.json";

// ======================================================
// INTERFACES
// ======================================================

interface Medio {
  medioId: number;
  medioDsc: string;
}

interface NivelAtencion {
  nivelDeAtencionId: number;
  nivelDeAtencionDsc: string;
}

interface Estado {
  claveEdo: number;
  estado: string;
}

interface Municipio {
  [key: string]: string | number | null | undefined;
}

interface Colonia {
  [key: string]: string | number | null | undefined;
}

interface RespuestaMedios {
  medio: Medio[];
}

interface RespuestaNiveles {
  nivelesDeAtencion: NivelAtencion[];
}

interface RespuestaEstados {
  estados: Estado[];
}

interface RespuestaMunicipios {
  municipios: Municipio[];
}

interface RespuestaColonias {
  colonias: Colonia[];
}

// Consulta una ruta interna y conserva el detalle del error recibido.
async function consultarJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const texto = await response.text();

  let data: unknown = null;

  if (texto) {
    try {
      data = JSON.parse(texto);
    } catch {
      throw new Error(
        `La ruta ${url} devolvió una respuesta que no es JSON (HTTP ${response.status}).`
      );
    }
  }

  if (!response.ok) {
    const detalle = data as {
      error?: string;
      detalle?: string;
    } | null;

    throw new Error(
      detalle?.detalle ||
        detalle?.error ||
        `Error HTTP ${response.status} al consultar ${url}.`
    );
  }

  return data as T;
}

// ======================================================
// COMPONENTE
// ======================================================

export default function NuevaQuejaPage() {
  // ====================================================
  // CATÁLOGOS
  // ====================================================

  const [medios, setMedios] = useState<Medio[]>([]);
  const [niveles, setNiveles] = useState<NivelAtencion[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [colonias, setColonias] = useState<Colonia[]>([]);

  // ====================================================
  // ESTADOS DE CARGA
  // ====================================================

  const [cargandoMedios, setCargandoMedios] = useState(true);
  const [cargandoNiveles, setCargandoNiveles] = useState(true);
  const [cargandoEstados, setCargandoEstados] = useState(true);

  const [errorMedios, setErrorMedios] = useState("");
  const [errorNiveles, setErrorNiveles] = useState("");
  const [errorEstados, setErrorEstados] = useState("");

  const [buscandoCP, setBuscandoCP] = useState(false);
  const [cargandoMunicipios, setCargandoMunicipios] = useState(false);
  const [cargandoColonias, setCargandoColonias] = useState(false);

  const [mensajeUbicacion, setMensajeUbicacion] = useState("");

  // ====================================================
  // FORMULARIO
  // ====================================================

  const [formulario, setFormulario] = useState({
    folio: "",
    fechaRecepcion: "",
    medio: "",
    nivel: "",
    producto: "",
    causa: "",
    tipoPersona: "",
    sexo: "",
    edad: "",
    cp: "",
    estado: "",
    municipio: "",
    colonia: "",
    estatus: "",
    pori: "",
  });

  // Producto seleccionado y sus causas disponibles
  const productoSeleccionado = catalogoProductosCausas.find(
    (item) => item.clave === formulario.producto
  );

  const causasDisponibles = productoSeleccionado?.causas ?? [];

  // ====================================================
  // MANEJAR CAMBIOS
  // ====================================================

  function manejarCambio(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    // Si cambia el producto, limpiamos la causa anterior
    if (name === "producto") {
      setFormulario((anterior) => ({
        ...anterior,
        producto: value,
        causa: "",
      }));

      return;
    }

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  // ====================================================
  // CARGAR CATÁLOGOS PRINCIPALES
  // ====================================================

  const cargarMedios = useCallback(async () => {
    setCargandoMedios(true);
    setErrorMedios("");

    try {
      const data = await consultarJson<RespuestaMedios>(
        "/api/catalogos/medios-recepcion"
      );

      if (!Array.isArray(data.medio)) {
        throw new Error("La respuesta de medios no contiene el arreglo esperado.");
      }

      setMedios(data.medio);
    } catch (error) {
      setMedios([]);
      setErrorMedios(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los medios de recepción."
      );
    } finally {
      setCargandoMedios(false);
    }
  }, []);

  const cargarNiveles = useCallback(async () => {
    setCargandoNiveles(true);
    setErrorNiveles("");

    try {
      const data = await consultarJson<RespuestaNiveles>(
        "/api/catalogos/niveles-atencion"
      );

      if (!Array.isArray(data.nivelesDeAtencion)) {
        throw new Error("La respuesta de niveles no contiene el arreglo esperado.");
      }

      setNiveles(data.nivelesDeAtencion);
    } catch (error) {
      setNiveles([]);
      setErrorNiveles(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los niveles de atención."
      );
    } finally {
      setCargandoNiveles(false);
    }
  }, []);

  const cargarEstados = useCallback(async () => {
    setCargandoEstados(true);
    setErrorEstados("");

    try {
      const data = await consultarJson<RespuestaEstados>(
        "/api/catalogos/estados"
      );

      if (!Array.isArray(data.estados)) {
        throw new Error("La respuesta de estados no contiene el arreglo esperado.");
      }

      setEstados(data.estados);
    } catch (error) {
      setEstados([]);
      setErrorEstados(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los estados."
      );
    } finally {
      setCargandoEstados(false);
    }
  }, []);

  useEffect(() => {
    void cargarMedios();
    void cargarNiveles();
    void cargarEstados();
  }, [cargarMedios, cargarNiveles, cargarEstados]);

  // ====================================================
  // BUSCAR CÓDIGO POSTAL
  // ====================================================

  async function buscarCodigoPostal() {
    const cp = formulario.cp.trim();
    const estadoId = formulario.estado;

    if (!estadoId) {
      setMensajeUbicacion("Primero selecciona un estado.");
      return;
    }

    if (!/^\d{5}$/.test(cp)) {
      setMensajeUbicacion(
        "Ingresa un código postal válido de 5 dígitos."
      );
      return;
    }

    setBuscandoCP(true);
    setMensajeUbicacion("");
    setMunicipios([]);
    setColonias([]);

    setFormulario((anterior) => ({
      ...anterior,
      municipio: "",
      colonia: "",
    }));

    setCargandoMunicipios(true);
    setCargandoColonias(true);

    // Las consultas son independientes: si una falla,
    // todavía intentamos obtener la información de la otra.
    const [resultadoMunicipios, resultadoColonias] =
      await Promise.allSettled([
        consultarJson<RespuestaMunicipios>(
          `/api/catalogos/municipios?estado_id=${encodeURIComponent(estadoId)}&cp=${encodeURIComponent(cp)}`
        ),
        consultarJson<RespuestaColonias>(
          `/api/catalogos/colonias?cp=${encodeURIComponent(cp)}`
        ),
      ]);

    let huboError = false;
    let municipiosEncontrados: Municipio[] = [];
    let coloniasEncontradas: Colonia[] = [];

    if (resultadoMunicipios.status === "fulfilled") {
      const lista = resultadoMunicipios.value.municipios;

      if (Array.isArray(lista)) {
        municipiosEncontrados = lista;
        setMunicipios(lista);
      } else {
        huboError = true;
      }
    } else {
      huboError = true;
      setMunicipios([]);
    }

    if (resultadoColonias.status === "fulfilled") {
      const lista = resultadoColonias.value.colonias;

      if (Array.isArray(lista)) {
        coloniasEncontradas = lista;
        setColonias(lista);
      } else {
        huboError = true;
      }
    } else {
      huboError = true;
      setColonias([]);
    }

    if (huboError) {
      const detalles = [
        resultadoMunicipios.status === "rejected"
          ? `Municipios: ${resultadoMunicipios.reason instanceof Error ? resultadoMunicipios.reason.message : "error desconocido"}`
          : null,
        resultadoColonias.status === "rejected"
          ? `Colonias: ${resultadoColonias.reason instanceof Error ? resultadoColonias.reason.message : "error desconocido"}`
          : null,
      ].filter(Boolean);

      setMensajeUbicacion(
        `SEPOMEX no está disponible para completar la búsqueda. ${detalles.join(" | ")}`
      );
    } else if (
      municipiosEncontrados.length === 0 &&
      coloniasEncontradas.length === 0
    ) {
      setMensajeUbicacion(
        "No se encontró información para ese código postal."
      );
    } else {
      setMensajeUbicacion(
        "Código postal consultado correctamente en SEPOMEX."
      );
    }

    setBuscandoCP(false);
    setCargandoMunicipios(false);
    setCargandoColonias(false);
  }

  // ====================================================
  // OBTENER NOMBRE DE MUNICIPIO
  // ====================================================

  function obtenerNombreMunicipio(
    municipio: Municipio
  ): string {
    const posiblesCampos = [
      "municipio",
      "municipioDsc",
      "municipioDesc",
      "nombre",
      "nomMunicipio",
    ];

    for (const campo of posiblesCampos) {
      const valor = municipio[campo];

      if (
        valor !== undefined &&
        valor !== null &&
        String(valor).trim() !== ""
      ) {
        return String(valor);
      }
    }

    return "Municipio";
  }

  // ====================================================
  // OBTENER NOMBRE DE COLONIA
  // ====================================================

  function obtenerNombreColonia(
    colonia: Colonia
  ): string {
    const posiblesCampos = [
      "colonia",
      "coloniaDsc",
      "coloniaDesc",
      "nombre",
      "nomColonia",
    ];

    for (const campo of posiblesCampos) {
      const valor = colonia[campo];

      if (
        valor !== undefined &&
        valor !== null &&
        String(valor).trim() !== ""
      ) {
        return String(valor);
      }
    }

    return "Colonia";
  }

  // ====================================================
  // ENVIAR FORMULARIO
  // ====================================================

  function manejarEnvio(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    console.log(
      "Datos de la queja:",
      formulario
    );

    alert(
      "Formulario capturado correctamente. Revisa la consola."
    );
  }

  // ====================================================
  // LIMPIAR FORMULARIO
  // ====================================================

  function limpiarFormulario() {
    setFormulario({
      folio: "",
      fechaRecepcion: "",
      medio: "",
      nivel: "",
      producto: "",
      causa: "",
      tipoPersona: "",
      sexo: "",
      edad: "",
      cp: "",
      estado: "",
      municipio: "",
      colonia: "",
      estatus: "",
      pori: "",
    });

    setMunicipios([]);
    setColonias([]);
    setMensajeUbicacion("");
  }

  // ====================================================
  // INTERFAZ
  // ====================================================

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">

        {/* ENCABEZADO */}

        <div className="mb-8 rounded-xl bg-slate-900 p-8 shadow-lg">

          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-400">
            Sistema REDECO
          </p>

          <h1 className="text-3xl font-bold text-white">
            Registrar nueva queja
          </h1>

          <p className="mt-2 text-slate-300">
            Captura la información necesaria para
            registrar una queja ante REDECO.
          </p>

        </div>

        {/* FORMULARIO */}

        <form onSubmit={manejarEnvio}>

          {/* INFORMACIÓN DE LA QUEJA */}

          <section className="mb-6 rounded-xl bg-white p-6 shadow-md">

            <div className="mb-6 border-b border-slate-200 pb-4">

              <h2 className="text-xl font-bold text-slate-800">
                Información de la queja
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Datos generales de recepción de la queja.
              </p>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* FOLIO */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Folio
                </label>

                <input
                  type="text"
                  name="folio"
                  value={formulario.folio}
                  onChange={manejarCambio}
                  placeholder="Ej. 2026/REDECO/0001"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* FECHA */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Fecha de recepción
                </label>

                <input
                  type="date"
                  name="fechaRecepcion"
                  value={formulario.fechaRecepcion}
                  onChange={manejarCambio}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* MEDIO */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Medio de recepción
                </label>

                <select
                  name="medio"
                  value={formulario.medio}
                  onChange={manejarCambio}
                  disabled={cargandoMedios}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="">
                    {cargandoMedios
                      ? "Consultando CONDUSEF..."
                      : errorMedios
                        ? "Catálogo no disponible"
                        : "Selecciona un medio"}
                  </option>

                  {medios.map((medio) => (
                    <option
                      key={medio.medioId}
                      value={medio.medioId}
                    >
                      {medio.medioDsc}
                    </option>
                  ))}
                </select>
                {errorMedios && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <p className="text-xs text-red-600">
                      No se pudo cargar el catálogo de medios.
                    </p>
                    <button
                      type="button"
                      onClick={() => void cargarMedios()}
                      disabled={cargandoMedios}
                      className="text-xs font-semibold text-blue-700 underline disabled:opacity-50"
                    >
                      Reintentar
                    </button>
                  </div>
                )}
              </div>

              {/* NIVEL */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nivel de atención
                </label>

                <select
                  name="nivel"
                  value={formulario.nivel}
                  onChange={manejarCambio}
                  disabled={cargandoNiveles}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="">
                    {cargandoNiveles
                      ? "Consultando CONDUSEF..."
                      : errorNiveles
                        ? "Catálogo no disponible"
                        : "Selecciona un nivel"}
                  </option>

                  {niveles.map((nivel) => (
                    <option
                      key={nivel.nivelDeAtencionId}
                      value={nivel.nivelDeAtencionId}
                    >
                      {nivel.nivelDeAtencionDsc}
                    </option>
                  ))}
                </select>
                {errorNiveles && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <p className="text-xs text-red-600">
                      No se pudo cargar el catálogo de niveles.
                    </p>
                    <button
                      type="button"
                      onClick={() => void cargarNiveles()}
                      disabled={cargandoNiveles}
                      className="text-xs font-semibold text-blue-700 underline disabled:opacity-50"
                    >
                      Reintentar
                    </button>
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* PRODUCTO Y CAUSA */}

          <section className="mb-6 rounded-xl bg-white p-6 shadow-md">

            <div className="mb-6 border-b border-slate-200 pb-4">

              <h2 className="text-xl font-bold text-slate-800">
                Producto y causa
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Información relacionada con el producto
                financiero y motivo de la queja.
              </p>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* PRODUCTO */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Producto / Servicio
                </label>

                <select
                  name="producto"
                  value={formulario.producto}
                  onChange={manejarCambio}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Selecciona un producto</option>

                  {catalogoProductosCausas.map((producto) => (
                    <option
                      key={producto.clave}
                      value={producto.clave}
                    >
                      {producto.producto} - {producto.subproducto}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-slate-500">
                  Selecciona el producto financiero relacionado con la queja.
                </p>
              </div>

              {/* CAUSA */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Causa
                </label>

                <select
                  name="causa"
                  value={formulario.causa}
                  onChange={manejarCambio}
                  disabled={!formulario.producto}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">
                    {formulario.producto
                      ? "Selecciona una causa"
                      : "Primero selecciona un producto"}
                  </option>

                  {causasDisponibles.map((causa) => (
                    <option
                      key={causa.clave}
                      value={causa.clave}
                    >
                      {causa.clave} - {causa.descripcion}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-slate-500">
                  Las causas disponibles dependen del producto seleccionado.
                </p>
              </div>

            </div>
          </section>

          {/* DATOS DE LA PERSONA */}

          <section className="mb-6 rounded-xl bg-white p-6 shadow-md">

            <div className="mb-6 border-b border-slate-200 pb-4">

              <h2 className="text-xl font-bold text-slate-800">
                Datos de la persona
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Información general de la persona relacionada
                con la queja.
              </p>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* TIPO PERSONA */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tipo de persona
                </label>

                <select
                  name="tipoPersona"
                  value={formulario.tipoPersona}
                  onChange={manejarCambio}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Selecciona
                  </option>

                  <option value="1">
                    Persona Física
                  </option>

                  <option value="2">
                    Persona Moral
                  </option>
                </select>
              </div>

              {/* SEXO */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Sexo
                </label>

                <select
                  name="sexo"
                  value={formulario.sexo}
                  onChange={manejarCambio}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Selecciona
                  </option>

                  <option value="H">
                    Hombre
                  </option>

                  <option value="M">
                    Mujer
                  </option>
                </select>
              </div>

              {/* EDAD */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Edad
                </label>

                <input
                  type="number"
                  name="edad"
                  value={formulario.edad}
                  onChange={manejarCambio}
                  min="0"
                  max="120"
                  placeholder="Edad"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* ESTADO */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Estado
                </label>

                <select
                  name="estado"
                  value={formulario.estado}
                  onChange={manejarCambio}
                  disabled={cargandoEstados}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="">
                    {cargandoEstados
                      ? "Consultando SEPOMEX..."
                      : errorEstados
                        ? "Catálogo no disponible"
                        : "Selecciona un estado"}
                  </option>

                  {estados.map((estado) => (
                    <option
                      key={estado.claveEdo}
                      value={estado.claveEdo}
                    >
                      {estado.estado}
                    </option>
                  ))}
                </select>
                {errorEstados && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <p className="text-xs text-red-600">
                      No se pudo cargar el catálogo de estados.
                    </p>
                    <button
                      type="button"
                      onClick={() => void cargarEstados()}
                      disabled={cargandoEstados}
                      className="text-xs font-semibold text-blue-700 underline disabled:opacity-50"
                    >
                      Reintentar
                    </button>
                  </div>
                )}
              </div>

              {/* CÓDIGO POSTAL */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Código Postal
                </label>

                <div className="flex gap-2">

                  <input
                    type="text"
                    name="cp"
                    value={formulario.cp}
                    onChange={manejarCambio}
                    maxLength={5}
                    inputMode="numeric"
                    placeholder="Ej. 98000"
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={buscarCodigoPostal}
                    disabled={buscandoCP}
                    className="whitespace-nowrap rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {buscandoCP
                      ? "Buscando..."
                      : "Buscar"}
                  </button>

                </div>

                {mensajeUbicacion && (
                  <p className="mt-2 text-sm text-slate-600">
                    {mensajeUbicacion}
                  </p>
                )}
              </div>

              {/* MUNICIPIO */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Municipio
                </label>

                <select
                  name="municipio"
                  value={formulario.municipio}
                  onChange={manejarCambio}
                  disabled={
                    cargandoMunicipios ||
                    municipios.length === 0
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="">
                    {cargandoMunicipios
                      ? "Cargando municipios..."
                      : municipios.length === 0
                        ? "Busca primero un CP"
                        : "Selecciona un municipio"}
                  </option>

                  {municipios.map(
                    (municipio, index) => (
                      <option
                        key={String(municipio.municipioId ?? municipio.id ?? index)}
                        value={String(
                          municipio.municipioId ??
                            municipio.id ??
                            municipio.municipio ??
                            ""
                        )}
                        disabled={
                          municipio.municipioId == null &&
                          municipio.id == null &&
                          municipio.municipio == null
                        }
                      >
                        {obtenerNombreMunicipio(
                          municipio
                        )}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* COLONIA */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Colonia
                </label>

                <select
                  name="colonia"
                  value={formulario.colonia}
                  onChange={manejarCambio}
                  disabled={
                    cargandoColonias ||
                    colonias.length === 0
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="">
                    {cargandoColonias
                      ? "Cargando colonias..."
                      : colonias.length === 0
                        ? "Busca primero un CP"
                        : "Selecciona una colonia"}
                  </option>

                  {colonias.map(
                    (colonia, index) => (
                      <option
                        key={String(colonia.coloniaId ?? colonia.id ?? index)}
                        value={String(
                          colonia.coloniaId ??
                            colonia.id ??
                            colonia.colonia ??
                            ""
                        )}
                        disabled={
                          colonia.coloniaId == null &&
                          colonia.id == null &&
                          colonia.colonia == null
                        }
                      >
                        {obtenerNombreColonia(
                          colonia
                        )}
                      </option>
                    )
                  )}
                </select>
              </div>

            </div>
          </section>

          {/* ESTADO DE LA QUEJA */}

          <section className="mb-6 rounded-xl bg-white p-6 shadow-md">

            <div className="mb-6 border-b border-slate-200 pb-4">

              <h2 className="text-xl font-bold text-slate-800">
                Estado de la queja
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Información relacionada con el estado actual
                de la queja.
              </p>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* ESTATUS */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Estado
                </label>

                <select
                  name="estatus"
                  value={formulario.estatus}
                  onChange={manejarCambio}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Selecciona
                  </option>

                  <option value="1">
                    Pendiente
                  </option>

                  <option value="2">
                    Concluido
                  </option>
                </select>
              </div>

              {/* PORI */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  PORI
                </label>

                <select
                  name="pori"
                  value={formulario.pori}
                  onChange={manejarCambio}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Selecciona
                  </option>

                  <option value="SI">
                    Sí
                  </option>

                  <option value="NO">
                    No
                  </option>
                </select>
              </div>

            </div>
          </section>

          {/* BOTONES */}

          <div className="mb-10 flex justify-end gap-4">

            <button
              type="button"
              onClick={limpiarFormulario}
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Limpiar
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-800"
            >
              Registrar queja
            </button>

          </div>

        </form>

        {/* PIE */}

        <p className="pb-6 text-center text-sm text-slate-500">
          Frontend REDECO — Proyecto de Negocios Electrónicos
        </p>

      </div>
    </main>
  );
}