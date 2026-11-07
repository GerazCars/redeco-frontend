"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

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

  // ====================================================
  // MANEJAR CAMBIOS
  // ====================================================

  function manejarCambio(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    // Si cambia el estado, limpiamos ubicación
    if (name === "estado") {
      setFormulario((anterior) => ({
        ...anterior,
        estado: value,
        cp: "",
        municipio: "",
        colonia: "",
      }));

      setMunicipios([]);
      setColonias([]);
      setMensajeUbicacion("");

      return;
    }

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  // ====================================================
  // CARGAR MEDIOS
  // ====================================================

  useEffect(() => {
    async function cargarMedios() {
      try {
        const response = await fetch(
          "/api/catalogos/medios-recepcion"
        );

        if (!response.ok) {
          throw new Error(
            "No fue posible obtener los medios"
          );
        }

        const data: RespuestaMedios =
          await response.json();

        setMedios(data.medio);
      } catch (error) {
        console.error(
          "Error cargando medios:",
          error
        );
      } finally {
        setCargandoMedios(false);
      }
    }

    cargarMedios();
  }, []);

  // ====================================================
  // CARGAR NIVELES DE ATENCIÓN
  // ====================================================

  useEffect(() => {
    async function cargarNiveles() {
      try {
        const response = await fetch(
          "/api/catalogos/niveles-atencion"
        );

        if (!response.ok) {
          throw new Error(
            "No fue posible obtener los niveles"
          );
        }

        const data: RespuestaNiveles =
          await response.json();

        setNiveles(data.nivelesDeAtencion);
      } catch (error) {
        console.error(
          "Error cargando niveles:",
          error
        );
      } finally {
        setCargandoNiveles(false);
      }
    }

    cargarNiveles();
  }, []);

  // ====================================================
  // CARGAR ESTADOS
  // ====================================================

  useEffect(() => {
    async function cargarEstados() {
      try {
        const response = await fetch(
          "/api/catalogos/estados"
        );

        if (!response.ok) {
          throw new Error(
            "No fue posible obtener los estados"
          );
        }

        const data: RespuestaEstados =
          await response.json();

        setEstados(data.estados);
      } catch (error) {
        console.error(
          "Error cargando estados:",
          error
        );
      } finally {
        setCargandoEstados(false);
      }
    }

    cargarEstados();
  }, []);

  // ====================================================
  // BUSCAR CÓDIGO POSTAL
  // ====================================================

  async function buscarCodigoPostal() {
    const cp = formulario.cp.trim();
    const estadoId = formulario.estado;

    // -----------------------------------------------
    // VALIDAR ESTADO
    // -----------------------------------------------

    if (!estadoId) {
      setMensajeUbicacion(
        "Primero selecciona un estado."
      );

      return;
    }

    // -----------------------------------------------
    // VALIDAR CP
    // -----------------------------------------------

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

    try {
      // =============================================
      // 1. CONSULTAR MUNICIPIOS
      // =============================================

      setCargandoMunicipios(true);

      const responseMunicipios = await fetch(
        `/api/catalogos/municipios?estado_id=${estadoId}&cp=${cp}`
      );

      if (!responseMunicipios.ok) {
        throw new Error(
          "No fue posible consultar municipios"
        );
      }

      const dataMunicipios: RespuestaMunicipios =
        await responseMunicipios.json();

      setMunicipios(
        dataMunicipios.municipios
      );

      // =============================================
      // 2. CONSULTAR COLONIAS
      // =============================================

      setCargandoColonias(true);

      const responseColonias = await fetch(
        `/api/catalogos/colonias?cp=${cp}`
      );

      if (!responseColonias.ok) {
        throw new Error(
          "No fue posible consultar colonias"
        );
      }

      const dataColonias: RespuestaColonias =
        await responseColonias.json();

      setColonias(
        dataColonias.colonias
      );

      // =============================================
      // 3. VALIDAR RESULTADOS
      // =============================================

      if (
        dataMunicipios.municipios.length === 0 &&
        dataColonias.colonias.length === 0
      ) {
        setMensajeUbicacion(
          "No se encontró información para ese código postal."
        );

        return;
      }

      setMensajeUbicacion(
        "Código postal localizado correctamente."
      );

    } catch (error) {
      console.error(
        "Error consultando SEPOMEX:",
        error
      );

      setMensajeUbicacion(
        "No fue posible obtener la información de ubicación."
      );
    } finally {
      setBuscandoCP(false);
      setCargandoMunicipios(false);
      setCargandoColonias(false);
    }
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
                      ? "Cargando medios..."
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
                      ? "Cargando niveles..."
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

                <input
                  type="text"
                  name="producto"
                  value={formulario.producto}
                  onChange={manejarCambio}
                  placeholder="Clave del producto"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Catálogo pendiente de autenticación REDECO.
                </p>
              </div>

              {/* CAUSA */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Causa
                </label>

                <input
                  type="text"
                  name="causa"
                  value={formulario.causa}
                  onChange={manejarCambio}
                  placeholder="Clave de la causa"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Catálogo pendiente de autenticación REDECO.
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
                      ? "Cargando estados..."
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
                        key={index}
                        value={String(
                          municipio.municipioId ??
                            municipio.id ??
                            municipio.municipio ??
                            index
                        )}
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
                        key={index}
                        value={String(
                          colonia.coloniaId ??
                            colonia.id ??
                            colonia.colonia ??
                            index
                        )}
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