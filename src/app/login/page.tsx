"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);

const handleLogin = async () => {
  try {
    setError(null);

    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    // 🔥 Error del backend
    if (!res.ok) {
      throw new Error(data.message || "Error al iniciar sesión");
    }

    // 🔐 Validar rol
    if (data.user.role !== "trainer") {
      throw new Error("Tu cuenta no tiene suficientes permisos para acceder.");
    }

    // 🔐 Validar estado
    if (!data.user.isActive) {
      throw new Error("Tu cuenta está desactivada");
    }

    // ✅ Guardar
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    router.push("/dashboard");
  } catch (err: any) {
    setError(err.message);
  }
};
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="bg-gray-700 p-8 rounded-2xl shadow-lg w-100 border border-gray-800">
        {/* Logo / Marca */}
        <Image
          src="/logo.png"
          alt="Logo de MOVA"
          width={500}
          height={500}
          className="mx-auto p-1 mb-2"
          loading="eager"
        />
        {/* Inputs */}
        <input
          placeholder="Email"
          className="w-full mb-3 p-3 rounded-lg bg-dark border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-5 p-3 rounded-lg bg-dark border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
          onChange={(e) => setPassword(e.target.value)}
        />
        {/* Error */}
        {error && (
          <div className="text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}
        {/* Botón */}
        <button
          onClick={handleLogin}
          className="w-full bg-gray-600 text-white font-semibold p-3 rounded-lg hover:opacity-90 transition"
        >
          Ingresar
        </button>
      </div>
    </div>
  );
}
