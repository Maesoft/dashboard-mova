"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-lg transition ${
      pathname === path
        ? "bg-primary text-white font-semibold"
        : "text-gray-400 hover:text-white hover:bg-darkSecondary"
    }`;

  return (
    <div className="flex h-screen bg-dark text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-darkSecondary border-r border-gray-800 p-5 flex flex-col justify-between">
        
        {/* Top */}
        <div>
          {/* Marca */}
          <h2 className="text-2xl font-bold text-primary mb-8 tracking-wide">
            MOVA
          </h2>

          {/* Navegación */}
          <nav className="flex flex-col gap-2">
            <Link href="/dashboard" className={linkClass("/dashboard")}>
              Dashboard
            </Link>
            <Link href="/dashboard/users" className={linkClass("/dashboard/users")}>
              Usuarios
            </Link>
            <Link href="/dashboard/exercises" className={linkClass("/dashboard/exercises")}>
              Ejercicios
            </Link>
            <Link href="/dashboard/routines" className={linkClass("/dashboard/routines")}>
              Rutinas
            </Link>
          </nav>
        </div>

        {/* Bottom */}
        <button
          onClick={logout}
          className="mt-10 bg-red-500/90 hover:bg-red-500 text-white p-2 rounded-lg transition"
        >
          Cerrar sesión
        </button>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-6 overflow-auto bg-dark">
        
        {/* Topbar */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-200">
            Panel de control
          </h1>

          <div className="text-sm text-gray-400">
            Entrenador
          </div>
        </div>

        {/* Contenido dinámico */}
        <div className="bg-darkSecondary p-6 rounded-2xl shadow-md border border-gray-800">
          {children}
        </div>
      </main>
    </div>
  );
}