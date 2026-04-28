"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Gym Admin</h2>

        <nav className="flex flex-col gap-3">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/users">Usuarios</Link>
          <Link href="/dashboard/routines">Rutinas</Link>
        </nav>

        <button
          onClick={logout}
          className="mt-10 bg-red-500 p-2 rounded"
        >
          Logout
        </button>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-6 bg-gray-100 overflow-auto">
        {children}
      </main>
    </div>
  );
}