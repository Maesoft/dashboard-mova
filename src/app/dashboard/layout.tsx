"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

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
    `px-4 py-3 rounded-[1.25rem] transition-all duration-200 font-medium ${
      pathname === path
        ? "bg-primary text-black border-border"
        : "text-text hover:text-text hover:bg-tertiary hover:border hover:border-primary/40"
    }`;

  return (
    <div className="flex h-screen bg-secondary text-text">
      {/* Sidebar */}
      <aside className="w-72 bg-tertiary border-r border-primary/40 p-6 flex flex-col justify-between">
        {/* Top */}
        <div>
          {/* Marca */}
          <div className="mb-10 flex items-center justify-center">
            <Image src="/logo.png" alt="Logo" width={150} height={150} className="inline-block mr-2" />
          </div>

          {/* Navegación */}
          <nav className="flex flex-col gap-3">

            <Link
              href="/dashboard/users"
              className={linkClass("/dashboard/users")}
            >
              USUARIOS
            </Link>

            <Link
              href="/dashboard/exercises"
              className={linkClass("/dashboard/exercises")}
            >
              EJERCICIOS
            </Link>

            <Link
              href="/dashboard/routines"
              className={linkClass("/dashboard/routines")}
            >
              RUTINAS
            </Link>
            <Link
              href="/dashboard/nutrition"
              className={linkClass("/dashboard/nutrition")}
            >
              ALIMENTACION / RECETAS
            </Link>
            <Link
              href="/dashboard/challengers"
              className={linkClass("/dashboard/challengers")}
            >
              CHALLENGERS
            </Link>
          </nav>
        </div>

        {/* Bottom */}
        <button
          onClick={logout}
          className="mt-10 bg-gray-800 hover:bg-gray-500 text-white p-3 rounded-[1.25rem] transition-all font-semibold"
        >
          Cerrar sesión
        </button>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-auto bg-secondary">
        <div className="p-8">
            {children}
        </div>
      </main>
    </div>
  );
}