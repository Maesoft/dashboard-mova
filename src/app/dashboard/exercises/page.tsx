"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
};

type Exercise = {
  id: number;
  name: string;
  description?: string;
  videoUrl?: string;
  category: Category;
};

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ExercisesPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [newCategory, setNewCategory] = useState("");
  const [newExercise, setNewExercise] = useState({
    name: "",
    description: "",
    videoUrl: "",
  });

  const [error, setError] = useState<string | null>(null);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  const fetchWithAuth = async (url: string) => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return null;
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      localStorage.clear();
      router.push("/login");
      return null;
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error en la API");
    }

    return data;
  };

  const fetchCategories = async () => {
    try {
      const data = await fetchWithAuth(`${API}/categories`);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchExercises = async () => {
    try {
      const data = await fetchWithAuth(`${API}/exercises`);
      setExercises(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchExercises();
  }, []);

  // ➕ CATEGORÍA
  const createCategory = async () => {
    if (!newCategory.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    const exists = categories.some(
      (c) => c.name.toLowerCase() === newCategory.toLowerCase(),
    );

    if (exists) {
      setError("La categoría ya existe");
      return;
    }

    try {
      const token = getToken();

      await fetch(`${API}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategory }),
      });

      setNewCategory("");
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ➕ EJERCICIO
  const createExercise = async () => {
    if (!newExercise.name.trim()) {
      setError("El nombre del ejercicio es obligatorio");
      return;
    }

    if (!selectedCategory) {
      setError("Seleccioná una categoría");
      return;
    }

    if (newExercise.videoUrl) {
      const valid = /^https?:\/\/.+/.test(newExercise.videoUrl);
      if (!valid) {
        setError("URL inválida");
        return;
      }
    }

    try {
      const token = getToken();

      await fetch(`${API}/exercises`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newExercise,
          categoryId: selectedCategory,
        }),
      });

      setNewExercise({
        name: "",
        description: "",
        videoUrl: "",
      });

      fetchExercises();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 🗑️ ELIMINAR CATEGORÍA
  const deleteCategory = async (id: number) => {
    const hasExercises = exercises.some((e) => e.category?.id === id);

    if (hasExercises) {
      setError("No podés eliminar una categoría con ejercicios");
      return;
    }

    if (!confirm("¿Eliminar categoría?")) return;

    try {
      const token = getToken();

      await fetch(`${API}/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 🗑️ ELIMINAR EJERCICIO
  const deleteExercise = async (id: number) => {
    if (!confirm("¿Eliminar ejercicio?")) return;

    try {
      const token = getToken();

      await fetch(`${API}/exercises/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExercises((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredExercises = selectedCategory
    ? exercises.filter((e) => e.category?.id === selectedCategory)
    : exercises;

  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      {error && (
        <div className="col-span-3 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded">
          {error}
        </div>
      )}

      {/* CATEGORÍAS */}
      <div className="bg-gray-600 col-span-1 p-4 rounded-xl border border-gray-800">
        <h2 className="font-bold mb-4 text-white">Categorías</h2>

        <div className="flex gap-2 mb-4">
          <input
            placeholder="Nueva categoría"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="p-2 bg-gray-700 rounded w-full text-white"
          />
          <button
            onClick={createCategory}
            className="bg-primary px-3 rounded text-white"
          >
            ➕
          </button>
        </div>

        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`flex justify-between items-center p-2 rounded mb-2 ${
              selectedCategory === cat.id
                ? "bg-primary text-black"
                : "bg-dark text-white"
            }`}
          >
            <span
              onClick={() => setSelectedCategory(cat.id)}
              className="cursor-pointer"
            >
              {cat.name}
            </span>

            <button
              onClick={() => deleteCategory(cat.id)}
              className="text-red-400 text-xs hover:text-red-300"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* EJERCICIOS */}
      <div className="col-span-2 bg-darkSecondary p-4 rounded-xl border bg-gray-600 border-gray-800">
        <h2 className="font-bold mb-4 text-white">Ejercicios</h2>

        <div className="grid mx-auto gap-2 mb-6">
          <input
            placeholder="Nombre"
            value={newExercise.name}
            onChange={(e) =>
              setNewExercise({ ...newExercise, name: e.target.value })
            }
            className="p-2 bg-gray-700 rounded text-white"
          />

          <textarea
            placeholder="Descripción"
            value={newExercise.description}
            onChange={(e) =>
              setNewExercise({
                ...newExercise,
                description: e.target.value,
              })
            }
            rows={4}
            className="p-2 bg-gray-700 rounded text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            placeholder="Video URL"
            value={newExercise.videoUrl}
            onChange={(e) =>
              setNewExercise({
                ...newExercise,
                videoUrl: e.target.value,
              })
            }
            className="p-2 bg-gray-700 rounded text-white"
          />

          <button
            onClick={createExercise}
            className="bg-gray-800 rounded w-50 mx-auto p-2 text-gray-200"
          >
            Crear
          </button>
        </div>
      </div>

        <div className="grid grid-cols-4 bg-gray-600 rounded-xl border border-gray-800 p-4 col-span-3 gap-4">
          {filteredExercises.map((ex) => (
            <div
              key={ex.id}
              className="bg-gray-700 p-3 rounded border border-gray-800"
            >
              <div className="flex justify-between">
                <h3 className="font-bold text-white">{ex.name}</h3>
                <button
                  onClick={() => deleteExercise(ex.id)}
                  className="text-red-400 text-xs"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-gray-400">{ex.category?.name}</p>

              {ex.description && (
                <p className="text-sm mt-2 text-gray-300">{ex.description}</p>
              )}

              {ex.videoUrl && (
                <a
                  href={ex.videoUrl}
                  target="_blank"
                  className="text-primary text-xs"
                >
                  Ver video
                </a>
              )}
            </div>
          ))}
        </div>
    </div>
  );
}
