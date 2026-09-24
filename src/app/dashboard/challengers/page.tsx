/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type {
  Challenger,
  ChallengerMediaType,
} from "@/types/api";

const emptyForm = {
  title: "",
  description: "",
  mediaUrl: "",
  mediaType: "image" as ChallengerMediaType,
};

export default function ChallengersPage() {
  const [challengers, setChallengers] = useState<Challenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Challenger | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadChallengers = async () => {
    try {
      setLoading(true);
      const data = await api<Challenger[]>("/challengers");
      setChallengers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Error cargando challengers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadChallengers();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (challenger: Challenger) => {
    setEditing(challenger);
    setForm({
      title: challenger.title,
      description: challenger.description,
      mediaUrl: challenger.mediaUrl,
      mediaType: challenger.mediaType,
    });
    setShowModal(true);
  };

  const saveChallenger = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.mediaUrl.trim()) {
      alert("Título, descripción y contenido multimedia son obligatorios");
      return;
    }

    try {
      setSaving(true);
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        mediaUrl: form.mediaUrl.trim(),
        mediaType: form.mediaType,
      };

      if (editing) {
        await api(`/challengers/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        await api("/challengers", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }

      setShowModal(false);
      resetForm();
      await loadChallengers();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "No se pudo guardar el challenger");
    } finally {
      setSaving(false);
    }
  };

  const publishChallenger = async (id: string) => {
    if (!confirm("¿Mostrar este challenger de forma global?")) return;

    try {
      await api(`/challengers/${id}/publish`, { method: "PATCH" });
      await loadChallengers();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "No se pudo publicar");
    }
  };

  const deleteChallenger = async (id: string) => {
    if (!confirm("¿Eliminar challenger?")) return;

    try {
      await api(`/challengers/${id}`, { method: "DELETE" });
      await loadChallengers();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "No se pudo eliminar");
    }
  };

  return (
    <div className="min-h-screen bg-secondary text-text p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Challengers</h1>
          <p className="text-gray-400">
            Creá challengers y elegí cuál se mostrará globalmente.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary text-black font-bold px-6 py-3 rounded-2xl hover:brightness-110 transition-all"
        >
          Nuevo challenger
        </button>
      </div>

      {loading ? (
        <div className="text-center mt-20">Cargando...</div>
      ) : challengers.length === 0 ? (
        <div className="text-center mt-20 text-muted">
          Todavía no hay challengers creados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {challengers.map((challenger) => (
            <div
              key={challenger.id}
              className="bg-surface border border-border rounded-3xl overflow-hidden shadow-lg"
            >
              <div className="h-56 bg-tertiary">
                {challenger.mediaType === "video" ? (
                  <video
                    src={challenger.mediaUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={challenger.mediaUrl}
                    alt={challenger.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="p-5">
                <div className="flex justify-between items-center mb-3 gap-3">
                  <h2 className="font-bold text-xl">{challenger.title}</h2>
                  {challenger.published && (
                    <span className="bg-primary text-black text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap">
                      GLOBAL
                    </span>
                  )}
                </div>
                <p className="text-gray-400 line-clamp-4 mb-5">
                  {challenger.description}
                </p>
                <div className="flex gap-2">
                  {!challenger.published && (
                    <button
                      onClick={() => publishChallenger(challenger.id)}
                      className="flex-1 py-2 rounded-xl bg-primary text-black font-bold"
                    >
                      Publicar
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(challenger)}
                    className="flex-1 py-2 rounded-xl bg-border hover:bg-tertiary"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteChallenger(challenger.id)}
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface w-full max-w-2xl rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-6">
              {editing ? "Editar challenger" : "Nuevo challenger"}
            </h2>

            <div className="space-y-5">
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Título"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none"
              />
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={6}
                placeholder="Texto del challenger"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none resize-none"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={form.mediaType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      mediaType: event.target.value as ChallengerMediaType,
                    }))
                  }
                  className="bg-secondary border border-border rounded-xl px-4 py-3 outline-none"
                >
                  <option value="image">Imagen</option>
                  <option value="video">Video</option>
                </select>
                <input
                  value={form.mediaUrl}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      mediaUrl: event.target.value,
                    }))
                  }
                  placeholder="URL de imagen o video"
                  className="bg-secondary border border-border rounded-xl px-4 py-3 outline-none"
                />
              </div>
              {form.mediaUrl && (
                <div className="h-48 rounded-2xl overflow-hidden border border-border bg-tertiary">
                  {form.mediaType === "video" ? (
                    <video src={form.mediaUrl} controls className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={form.mediaUrl}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-6 py-3 rounded-xl bg-gray-700"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={saveChallenger}
                className="px-8 py-3 rounded-xl bg-primary text-black font-bold disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
