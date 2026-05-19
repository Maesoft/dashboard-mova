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

        body: JSON.stringify({
          name: newCategory,
        }),
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
    <div className="min-h-screen bg-secondary text-text p-6 space-y-6">
      {error && (
        <div
          className="
            bg-red-500/10
            border
            border-red-500/20
            text-red-400
            p-4
            rounded-[1.25rem]
          "
        >
          {error}
        </div>
      )}

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-black tracking-wide text-white">MOVA</h1>

        <p className="text-muted text-sm">Gestión de ejercicios y categorías</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CATEGORÍAS */}
        <div
          className="
            bg-linear-to-br
            from-[#111]
            to-[#1A1A1A]
            border
            border-border
            rounded-[1.75rem]
            p-5
            shadow-2xl
          "
        >
          <h2 className="font-black text-2xl text-white mb-5">Categorías</h2>

          <div className="flex gap-2 mb-5">
            <input
              placeholder="Nueva categoría"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="
                flex-1
                bg-surface
                border
                border-border
                rounded-2xl
                px-4
                py-2
                outline-none
                text-white
                focus:border-primary
                focus:ring-1
                focus:ring-primary
              "
            />

            <button
              onClick={createCategory}
              className="
                bg-primary
                text-black
                px-4
                rounded-2xl
                font-bold
                hover:brightness-110
                transition-all
                shadow-[0_0_20px_rgba(109,190,69,0.35)]
              "
            >
              Agregar
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`
                w-full
                flex
                justify-between
                items-center
                px-4
                py-3
                rounded-2xl
                border
                transition-all
                ${
                  selectedCategory === null
                    ? "bg-primary text-black border-primary font-bold shadow-[0_0_20px_rgba(109,190,69,0.35)]"
                    : "bg-tertiary border-border text-white hover:border-primary"
                }
              `}
            >
              <span>Todas</span>
            </button>

            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`
                  flex
                  justify-between
                  items-center
                  px-4
                  py-3
                  rounded-2xl
                  border
                  transition-all
                  ${
                    selectedCategory === cat.id
                      ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(109,190,69,0.35)]"
                      : "bg-tertiary border-border text-white hover:border-primary"
                  }
                `}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="cursor-pointer font-medium">{cat.name}</span>

                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="
                    text-red-400
                    hover:text-red-300
                    hover:scale-110
                    transition-all
                  "
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FORM EJERCICIO */}
        <div
          className="
            lg:col-span-2
            bg-linear-to-br
            from-[#111]
            to-[#1A1A1A]
            border
            border-border
            rounded-[1.75rem]
            p-5
            shadow-2xl
          "
        >
          <h2 className="font-black text-2xl text-white mb-5">
            Crear ejercicio
          </h2>

          <div className="grid gap-4">
            <input
              placeholder="Nombre"
              value={newExercise.name}
              onChange={(e) =>
                setNewExercise({
                  ...newExercise,
                  name: e.target.value,
                })
              }
              className="
                bg-surface
                border
                border-border
                rounded-2xl
                px-4
                py-3
                outline-none
                text-white
                focus:border-primary
                focus:ring-1
                focus:ring-primary
              "
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
              rows={5}
              className="
                bg-surface
                border
                border-border
                rounded-2xl
                px-4
                py-3
                outline-none
                text-white
                resize-none
                focus:border-primary
                focus:ring-1
                focus:ring-primary
              "
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
              className="
                bg-surface
                border
                border-border
                rounded-2xl
                px-4
                py-3
                outline-none
                text-white
                focus:border-primary
                focus:ring-1
                focus:ring-primary
              "
            />

            <button
              onClick={createExercise}
              className="
                bg-primary
                text-black
                px-6
                py-3
                rounded-2xl
                font-black
                hover:brightness-110
                transition-all
                shadow-[0_0_20px_rgba(109,190,69,0.35)]
                w-fit
              "
            >
              Crear ejercicio
            </button>
          </div>
        </div>
      </div>

      {/* EJERCICIOS */}
      <div
        className="
          bg-linear-to-br
          from-[#111]
          to-[#1A1A1A]
          border
          border-border
          rounded-[1.75rem]
          p-5
          shadow-2xl
        "
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-black text-2xl text-white">Ejercicios</h2>

            <p className="text-muted text-sm">
              {filteredExercises.length} ejercicios
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filteredExercises.map((ex) => (
            <div
              key={ex.id}
              className="
                bg-tertiary
                border
                border-border
                rounded-[1.25rem]
                p-4
                hover:border-primary
                hover:shadow-[0_0_20px_rgba(109,190,69,0.2)]
                transition-all
              "
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white">{ex.name}</h3>

                <button
                  onClick={() => deleteExercise(ex.id)}
                  className="
                    text-red-400
                    hover:text-red-300
                    hover:scale-110
                    transition-all
                  "
                >
                  ✕
                </button>
              </div>

              <span
                className="
                  inline-block
                  text-xs
                  bg-primary/10
                  text-primary
                  border
                  border-primary/20
                  px-2
                  py-1
                  rounded-full
                  mb-3
                "
              >
                {ex.category?.name}
              </span>

              {ex.description && (
                <p className="text-sm text-muted mb-4">{ex.description}</p>
              )}

              {ex.videoUrl && (
                <a
                  href={ex.videoUrl}
                  target="_blank"
                  className="
                    text-primary
                    text-sm
                    font-semibold
                    hover:underline
                  "
                >
                  ▶ Ver video
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
