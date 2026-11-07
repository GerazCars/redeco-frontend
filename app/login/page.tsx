"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function manejarLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMensaje("");
    setCargando(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "No fue posible iniciar sesión"
        );
      }

      setMensaje("Autenticación exitosa.");

      console.log("Usuario autenticado:", data.user);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Error al iniciar sesión"
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">

      <div className="w-full max-w-md">

        <div className="mb-6 rounded-xl bg-slate-900 p-8 text-center shadow-lg">

          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-400">
            Sistema REDECO
          </p>

          <h1 className="text-3xl font-bold text-white">
            Iniciar sesión
          </h1>

          <p className="mt-2 text-slate-300">
            Acceso al sistema de gestión de quejas.
          </p>

        </div>

        <form
          onSubmit={manejarLogin}
          className="rounded-xl bg-white p-8 shadow-lg"
        >

          <div className="mb-5">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Usuario
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          <div className="mb-6">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {mensaje}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {cargando
              ? "Autenticando..."
              : "Iniciar sesión"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Frontend REDECO — Proyecto de Negocios Electrónicos
        </p>

      </div>

    </main>
  );
}