"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      if (data.user.role !== "trainer") {
        throw new Error("Tu cuenta no tiene permisos para acceder.");
      }

      if (!data.user.isActive) {
        throw new Error("Tu cuenta está desactivada.");
      }

      // Guardar sesión
      localStorage.setItem("token", data.access_token);

      router.replace("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error inesperado.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="bg-tertiary p-8 rounded-2xl shadow-lg w-105 border border-primary">

        <Image
          src="/logo.png"
          alt="Logo de MOVA"
          width={350}
          height={350}
          priority
          className="mx-auto mb-4 h-auto"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-3 rounded-lg bg-dark border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLogin();
            }
          }}
          className="w-full mb-5 p-3 rounded-lg bg-dark border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
        />

        {error && (
          <div className="text-red-400 mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-primary text-black font-bold p-3 rounded-lg hover:brightness-110 transition disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </div>
    </div>
  );
}
