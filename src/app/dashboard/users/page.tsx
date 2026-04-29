"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  email: string;
  isActive: boolean;
  routine?: {
    name: string;
  };
  progress?: number;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("http://localhost:3000/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al obtener usuarios");
      }

      if (!Array.isArray(data)) {
        throw new Error("La API no devolvió un array");
      }

      setUsers(data);
    } catch (error: any) {
      console.error("ERROR:", error.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: number) => {
    const token = localStorage.getItem("token");

    if (!token) return;

    setLoadingId(id);

    // 🟢 Optimistic update
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, isActive: !user.isActive } : user
      )
    );

    try {
      const res = await fetch(
        `http://localhost:3000/users/${id}/toggle-active`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Error al actualizar estado");
      }
    } catch (error) {
      console.error(error);

      // 🔴 rollback
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, isActive: !user.isActive } : user
        )
      );
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <p className="text-gray-400">Cargando usuarios...</p>;
  }

  if (users.length === 0) {
    return (
      <p className="text-gray-400">
        No hay usuarios o no tenés permisos
      </p>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-white">Usuarios</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700">
              <th className="p-3">Email</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Rutina</th>
              <th className="p-3">Progreso</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-800 hover:bg-darkSecondary transition"
              >
                {/* Email */}
                <td className="p-3 text-gray-200">{user.email}</td>

                {/* Estado */}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      user.isActive
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {user.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>

                {/* Rutina */}
                <td className="p-3 text-gray-300">
                  {user.routine?.name || "Sin asignar"}
                </td>

                {/* Progreso */}
                <td className="p-3">
                  <div className="w-full bg-gray-700 rounded h-2">
                    <div
                      className="bg-primary h-2 rounded"
                      style={{
                        width: `${user.progress || 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {user.progress || 0}%
                  </span>
                </td>

                {/* Acciones */}
                <td className="p-3">
                  <button
                    disabled={loadingId === user.id}
                    onClick={() => toggleActive(user.id)}
                    className="bg-gray-700 text-white px-3 py-1 rounded hover:opacity-90 transition text-sm disabled:opacity-50"
                  >
                    {loadingId === user.id
                      ? "..."
                      : user.isActive
                      ? "Desactivar"
                      : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}