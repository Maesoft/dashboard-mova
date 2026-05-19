"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Routine = {
  id: number;
  name: string;
};

type User = {
  id: number;
  email: string;
  isActive: boolean;

  routine?: {
    id: number;
    name: string;
  };

  progress?: number;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const router = useRouter();

  const fetchUsersAndRoutines = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const [usersRes, routinesRes] = await Promise.all([
        fetch("http://localhost:3000/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch("http://localhost:3000/routines", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const usersData = await usersRes.json();

      const routinesData = await routinesRes.json();

      if (!usersRes.ok) {
        throw new Error(usersData.message || "Error al obtener usuarios");
      }

      if (!routinesRes.ok) {
        throw new Error(routinesData.message || "Error al obtener rutinas");
      }

      setUsers(usersData);

      setRoutines(Array.isArray(routinesData) ? routinesData : []);
    } catch (error: any) {
      console.error("ERROR:", error.message);

      setUsers([]);
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: number) => {
    const token = localStorage.getItem("token");

    if (!token) return;

    setLoadingId(id);

    // Optimistic update
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              isActive: !user.isActive,
            }
          : user,
      ),
    );

    try {
      const res = await fetch(
        `http://localhost:3000/users/${id}/toggle-active`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Error al actualizar estado");
      }
    } catch (error) {
      console.error(error);

      // rollback
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id
            ? {
                ...user,
                isActive: !user.isActive,
              }
            : user,
        ),
      );
    } finally {
      setLoadingId(null);
    }
  };

  const assignRoutine = async (userId: number, routineId: number) => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const res = await fetch(
        `http://localhost:3000/routines/${userId}/assign/${routineId}`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error asignando rutina");
      }

      setUsers((prev) =>
        prev.map((user) => {
          if (user.id !== userId) return user;

          return {
            ...user,

            routine: routines.find((r) => r.id === routineId) || undefined,
          };
        }),
      );
    } catch (error: any) {
      console.error(error);

      alert(error.message || "Error asignando rutina");
    }
  };

  useEffect(() => {
    fetchUsersAndRoutines();
  }, []);

  if (loading) {
    return <p className="text-muted">Cargando usuarios...</p>;
  }

  if (users.length === 0) {
    return <p className="text-muted">No hay usuarios o no tenés permisos</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black text-white">Usuarios</h2>

          <p className="text-muted text-sm">Gestión de alumnos y rutinas</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border bg-tertiary">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-muted text-sm border-b border-border bg-secondary">
              <th className="p-4">Email</th>

              <th className="p-4">Estado</th>

              <th className="p-4">Rutina</th>

              <th className="p-4">Progreso</th>

              <th className="p-4">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="
                  border-b
                  border-border
                  hover:bg-secondary
                  transition-all
                "
              >
                {/* Email */}
                <td className="p-4 text-white font-medium">{user.email}</td>

                {/* Estado */}
                <td className="p-4">
                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-semibold
                      ${
                        user.isActive
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }
                    `}
                  >
                    {user.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>

                {/* Rutina */}
                <td className="p-4">
                  <select
                    value={user.routine?.id || ""}
                    onChange={(e) =>
                      assignRoutine(user.id, Number(e.target.value))
                    }
                    className="
                      bg-secondary
                      border
                      border-border
                      text-white
                      px-4
                      py-2
                      rounded-2xl
                      outline-none
                      focus:border-primary
                      focus:ring-1
                      focus:ring-primary
                      min-w-55
                    "
                  >
                    <option value="">Sin asignar</option>

                    {routines.map((routine) => (
                      <option key={routine.id} value={routine.id}>
                        {routine.name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Progreso */}
                <td className="p-4 min-w-[180px]">
                  <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                    <div
                      className="
                        bg-primary
                        h-3
                        rounded-full
                        transition-all
                      "
                      style={{
                        width: `${user.progress || 0}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs text-muted mt-1 inline-block">
                    {user.progress || 0}%
                  </span>
                </td>

                {/* Acciones */}
                <td className="p-4">
                  <button
                    disabled={loadingId === user.id}
                    onClick={() => toggleActive(user.id)}
                    className={`
                      px-4
                      py-2
                      rounded-[1rem]
                      text-sm
                      font-semibold
                      transition-all
                      ${
                        user.isActive
                          ? "bg-red-500/90 hover:bg-red-500 text-white"
                          : "bg-primary text-black hover:brightness-110 shadow-[0_0_20px_rgba(109,190,69,0.35)]"
                      }
                      disabled:opacity-50
                    `}
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
