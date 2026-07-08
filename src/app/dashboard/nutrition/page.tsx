/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Nutrition {
  id: string;
  title: string;
  description: string;
  image: string;
  published: boolean;
  active: boolean;
}

export default function NutritionPage() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [recipes, setRecipes] = useState<Nutrition[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Nutrition | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const fetchWithAuth = async (
    url: string,
    options: RequestInit = {}
  ) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      throw new Error("Error al comunicarse con el servidor");
    }

    return res.json();
  };

  const loadRecipes = async () => {
    try {
      setLoading(true);

      const data = await fetchWithAuth(`${API}/nutrition`);

      setRecipes(data);
    } catch (err) {
      console.error(err);
      alert("Error cargando recetas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [ ]);

    const resetForm = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setImage("");
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (recipe: Nutrition) => {
    setEditing(recipe);

    setTitle(recipe.title);
    setDescription(recipe.description);
    setImage(recipe.image);

    setShowModal(true);
  };

  const saveRecipe = async () => {
    try {
      const body = {
        title,
        description,
        image,
      };

      if (editing) {
        await fetchWithAuth(`${API}/nutrition/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        await fetchWithAuth(`${API}/nutrition`, {
          method: "POST",
          body: JSON.stringify(body),
        });
      }

      setShowModal(false);
      resetForm();
      loadRecipes();
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar la receta");
    }
  };

  const publishRecipe = async (id: string) => {
    if (!confirm("¿Publicar esta receta?")) return;

    try {
      await fetchWithAuth(`${API}/nutrition/${id}/publish`, {
        method: "PATCH",
      });

      loadRecipes();
    } catch (err) {
      console.error(err);
      alert("No se pudo publicar");
    }
  };

  const deleteRecipe = async (id: string) => {
    if (!confirm("¿Eliminar receta?")) return;

    try {
      await fetchWithAuth(`${API}/nutrition/${id}`, {
        method: "DELETE",
      });

      loadRecipes();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar");
    }
  };

  return (
  <div className="min-h-screen bg-secondary text-text p-6">

    {/* HEADER */}
    <div className="flex justify-between items-center mb-8">

      <div>
        <h1 className="text-3xl font-bold">Nutrición</h1>
        <p className="text-gray-400">
          Administrá las recetas que verán todos los usuarios.
        </p>
      </div>

      <button
        onClick={openCreate}
        className="bg-primary text-black font-bold px-6 py-3 rounded-2xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(109,190,69,0.35)]"
      >
        Nueva receta
      </button>

    </div>

    {loading ? (

      <div className="text-center mt-20">
        Cargando...
      </div>

    ) : (

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {recipes.map((recipe) => (

          <div
            key={recipe.id}
            className="bg-surface border border-border rounded-3xl overflow-hidden shadow-lg"
          >

            {/* Imagen */}

            <div className="h-56 bg-tertiary">

              {recipe.image ? (

                <img
                  src={recipe.image}
                  className="w-full h-full object-cover"
                />

              ) : (

                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Sin imagen
                </div>

              )}

            </div>

            {/* Contenido */}

            <div className="p-5">

              <div className="flex justify-between items-center mb-3">

                <h2 className="font-bold text-xl">
                  {recipe.title}
                </h2>

                {recipe.published && (

                  <span className="bg-primary text-black text-xs px-3 py-1 rounded-full font-bold">
                    PUBLICADA
                  </span>

                )}

              </div>

              <p className="text-gray-400 line-clamp-4 mb-5">
                {recipe.description}
              </p>

              <div className="flex gap-2">

                

                {!recipe.published && (

                  <button
                    onClick={() => publishRecipe(recipe.id)}
                    className="flex-1 py-2 rounded-xl bg-primary text-black font-bold"
                  >
                    Publicar
                  </button>

                )}

                <button
                  onClick={() => openEdit(recipe)}
                  className="flex-1 py-2 rounded-xl bg-border hover:bg-tertiary"
                >
                  Editar
                </button>

                <button
                  onClick={() => deleteRecipe(recipe.id)}
                  className="flex-1 py-2 rounded-xl bg-border hover:bg-tertiary"
                >
                  Eliminar
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    )}

        {showModal && (

      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

        <div className="bg-surface w-full max-w-2xl rounded-3xl p-8">

          <h2 className="text-2xl font-bold mb-6">

            {editing ? "Editar receta" : "Nueva receta"}

          </h2>

          <div className="space-y-5">

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none"
            />

            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="URL Imagen"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none"
            />

            {image && (

              <img
                src={image}
                className="rounded-2xl w-full h-60 object-cover border border-border"
              />

            )}

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              placeholder="Descripción"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none resize-none"
            />

          </div>

          <div className="flex justify-end gap-3 mt-8">

            <button
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="px-6 py-3 rounded-xl bg-gray-700"
            >
              Cancelar
            </button>

            <button
              onClick={saveRecipe}
              className="px-8 py-3 rounded-xl bg-primary text-black font-bold"
            >
              Guardar
            </button>

          </div>

        </div>

      </div>

    )}

  </div>
);
}

