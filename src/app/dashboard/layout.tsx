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
    `px-4 py-3 rounded-[1.25rem] transition-all duration-200 font-medium ${
      pathname === path
        ? "bg-primary text-black shadow-[0_0_20px_rgba(109,190,69,0.35)]"
        : "text-muted hover:text-text hover:bg-tertiary hover:border hover:border-primary/40"
    }`;

  return (
    <div className="flex h-screen bg-secondary text-text">
      {/* Sidebar */}
      <aside className="w-72 bg-tertiary border-r border-border p-6 flex flex-col justify-between">
        {/* Top */}
        <div>
          {/* Marca */}
          <div className="mb-10">
            <h2 className="text-4xl font-black text-primary tracking-widest">
              MOVA
            </h2>

            <p className="text-muted text-sm mt-1">
              Fitness Platform
            </p>
          </div>

          {/* Navegación */}
          <nav className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className={linkClass("/dashboard")}
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/users"
              className={linkClass("/dashboard/users")}
            >
              Usuarios
            </Link>

            <Link
              href="/dashboard/exercises"
              className={linkClass("/dashboard/exercises")}
            >
              Ejercicios
            </Link>

            <Link
              href="/dashboard/routines"
              className={linkClass("/dashboard/routines")}
            >
              Rutinas
            </Link>
          </nav>
        </div>

        {/* Bottom */}
        <button
          onClick={logout}
          className="mt-10 bg-red-500/90 hover:bg-red-500 text-white p-3 rounded-[1.25rem] transition-all font-semibold"
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