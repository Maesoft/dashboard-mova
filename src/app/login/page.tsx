"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }

    const data = await res.json();

    localStorage.setItem("token", data.access_token);
    router.push("/dashboard");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-dark">
      <div className="bg-darkSecondary p-8 rounded-2xl shadow-lg w-80 border border-gray-800">
        {/* Logo / Marca */}
        <h2 className="text-3xl font-bold text-primary text-center mb-2">
          MOVA
        </h2>
        <p className="text-gray-400 text-center text-sm mb-6">
          Movimiento que transforma
        </p>

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

        {/* Botón */}
        <button
          onClick={handleLogin}
          className="w-full bg-primary text-white font-semibold p-3 rounded-lg hover:opacity-90 transition"
        >
          Ingresar
        </button>
      </div>
    </div>
  );
}
