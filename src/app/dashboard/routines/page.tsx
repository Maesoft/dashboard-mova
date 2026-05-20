"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function RoutinesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [routineName, setRoutineName] = useState("");
  const [activeExercise, setActiveExercise] = useState<any>(null);

  const [days, setDays] = useState<any[]>([
    {
      day: 1,
      blocks: [
        {
          id: "block-1",
          exercises: [],
        },
      ],
    },
  ]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchWithAuth = async (url: string) => {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.json();
  };

  useEffect(() => {
    fetchWithAuth(`${API}/categories`).then(setCategories);
    fetchWithAuth(`${API}/exercises`).then(setExercises);
  }, []);

  const filteredExercises = selectedCategory
    ? exercises.filter((e) => e.category.id === selectedCategory)
    : exercises;

  const addDay = () => {
    setDays((prev) => [
      ...prev,
      {
        day: prev.length + 1,
        blocks: [
          {
            id: `block-${Date.now()}`,
            exercises: [],
          },
        ],
      },
    ]);
  };

  const addBlock = (dayIndex: number) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              blocks: [
                ...d.blocks,
                {
                  id: `block-${Date.now()}`,
                  exercises: [],
                },
              ],
            }
          : d
      )
    );
  };

  const updateExerciseInstructions = (
    dayIndex: number,
    blockId: string,
    exerciseIndex: number,
    value: string
  ) => {
    setDays((prev) =>
      prev.map((day, dIdx) => {
        if (dIdx !== dayIndex) return day;

        return {
          ...day,
          blocks: day.blocks.map((block: any) => {
            if (block.id !== blockId) return block;

            return {
              ...block,
              exercises: block.exercises.map((ex: any, i: number) => {
                if (i !== exerciseIndex) return ex;

                return {
                  ...ex,
                  instructions: value,
                };
              }),
            };
          }),
        };
      })
    );
  };

  const removeExercise = (
    dayIndex: number,
    blockId: string,
    exerciseIndex: number
  ) => {
    setDays((prev) =>
      prev.map((day, dIdx) => {
        if (dIdx !== dayIndex) return day;

        return {
          ...day,
          blocks: day.blocks.map((block: any) => {
            if (block.id !== blockId) return block;

            return {
              ...block,
              exercises: block.exercises.filter(
                (_: any, i: number) => i !== exerciseIndex
              ),
            };
          }),
        };
      })
    );
  };

  const removeBlock = (dayIndex: number, blockId: string) => {
    setDays((prev) =>
      prev.map((day, i) => {
        if (i !== dayIndex) return day;

        if (day.blocks.length === 1) return day;

        return {
          ...day,
          blocks: day.blocks.filter((b: any) => b.id !== blockId),
        };
      })
    );
  };

  const removeDay = (dayIndex: number) => {
    setDays((prev) => {
      if (prev.length === 1) return prev;

      const updated = prev.filter((_, i) => i !== dayIndex);

      return updated.map((d, i) => ({
        ...d,
        day: i + 1,
      }));
    });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const exercise = exercises.find((e) => e.id === active.id);

    setDays((prev) =>
      prev.map((day) => ({
        ...day,
        blocks: day.blocks.map((block: any) => {
          if (block.id === over.id) {
            return {
              ...block,
              exercises: [
                ...block.exercises,
                {
                  exercise,
                  instructions: "3x10 - 60s",
                },
              ],
            };
          }

          return block;
        }),
      }))
    );
  };

  const saveRoutine = async () => {
    if (!routineName.trim()) {
      alert("Debes ingresar un nombre para la rutina");
      return;
    }

    const payload = {
      name: routineName,

      days: days.map((day: any, dayIndex: number) => ({
        dayNumber: dayIndex + 1,

        blocks: day.blocks.map((block: any, blockIndex: number) => ({
          name: `Bloque ${blockIndex + 1}`,
          order: blockIndex + 1,

          exercises: block.exercises.map((ex: any, i: number) => ({
            exerciseId: ex.exercise.id,
            instructions: ex.instructions,
            order: i + 1,
          })),
        })),
      })),
    };

    const res = await fetch(`${API}/routines`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Error guardando rutina");
      return;
    }

    alert("Rutina guardada 🔥");
  };

  return (
    <DndContext
      onDragStart={(event) => {
        const ex = exercises.find((e) => e.id === event.active.id);
        setActiveExercise(ex);
      }}
      onDragEnd={(event) => {
        handleDragEnd(event);
        setActiveExercise(null);
      }}
    >
      <div className="h-screen overflow-hidden bg-secondary text-text flex flex-col">

        {/* HEADER FIJO */}
        <div className="flex-shrink-0 p-6 space-y-6 border-b border-border bg-secondary z-50">

          <div className="flex justify-end items-center">
            <div className="flex gap-3">
              <input
                placeholder="NOMBRE RUTINA"
                className="bg-surface border border-primary px-4 py-2 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-primary focus:border-primary text-white"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
              />

              <button
                onClick={saveRoutine}
                className="bg-primary text-black px-6 py-2 rounded-[1.25rem] font-bold hover:brightness-110 transition-all shadow-[0_0_20px_rgba(109,190,69,0.35)]"
              >
                GUARDAR
              </button>
            </div>
          </div>

          {/* CATEGORIAS */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-[1.25rem] border transition-all ${
                selectedCategory === null
                  ? "bg-primary border-primary text-black font-bold shadow-[0_0_20px_rgba(109,190,69,0.35)]"
                  : "bg-tertiary border-border text-text hover:border-primary"
              }`}
            >
              TODAS
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-[1.25rem] border transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary border-primary text-black font-bold shadow-[0_0_20px_rgba(109,190,69,0.35)]"
                    : "bg-tertiary border-border text-text hover:border-primary"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* EJERCICIOS */}
          <div className="grid grid-cols-4 gap-4 max-h-[260px] overflow-y-auto pr-2">
            {filteredExercises.map((ex) => (
              <DraggableExercise key={ex.id} exercise={ex} />
            ))}
          </div>
        </div>

        {/* SCROLL SOLO EN LOS DIAS */}
        <div className="flex-1 overflow-y-auto p-6">

          <div className="grid grid-cols-3 gap-8">
            {days.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="bg-gradient-to-br from-[#111] to-[#1A1A1A] border border-border rounded-[1.75rem] p-5 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-2xl font-black">
                    DIA {day.day}
                  </h2>

                  <button
                    onClick={() => removeDay(dayIndex)}
                    className="text-red-500 hover:scale-110 transition"
                  >
                    ❌
                  </button>
                </div>

                <div className="space-y-4">
                  {day.blocks.map((block: any, blockIndex: number) => (
                    <DroppableBlock
                      key={block.id}
                      block={block}
                      index={blockIndex}
                      dayIndex={dayIndex}
                      removeBlock={removeBlock}
                      removeExercise={removeExercise}
                      updateExerciseInstructions={
                        updateExerciseInstructions
                      }
                    />
                  ))}
                </div>

                <button
                  onClick={() => addBlock(dayIndex)}
                  className="mt-4 w-full bg-tertiary border border-border hover:border-primary hover:shadow-[0_0_20px_rgba(109,190,69,0.35)] py-3 rounded-[1.25rem] transition-all font-semibold"
                >
                  ➕ AGREGAR BLOQUE
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addDay}
            className="mt-6 bg-primary text-black px-6 py-3 rounded-[1.25rem] font-black hover:brightness-110 transition-all shadow-[0_0_20px_rgba(109,190,69,0.35)]"
          >
            ➕ AGREGAR DIA
          </button>
        </div>
      </div>

      <DragOverlay>
        {activeExercise ? (
          <div className="bg-primary text-black px-5 py-3 rounded-[1.25rem] shadow-[0_0_20px_rgba(109,190,69,0.35)] border border-white/10 font-bold scale-105">
            {activeExercise.name}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function DraggableExercise({ exercise }: any) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: exercise.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="bg-gradient-to-br from-[#111] to-[#1A1A1A] border border-border hover:border-primary hover:shadow-[0_0_20px_rgba(109,190,69,0.35)] p-4 rounded-[1.25rem] cursor-grab transition-all duration-200"
    >
      <p className="font-semibold">{exercise.name}</p>
    </div>
  );
}

function DroppableBlock({
  block,
  index,
  dayIndex,
  removeBlock,
  removeExercise,
  updateExerciseInstructions,
}: any) {
  const { setNodeRef, isOver } = useDroppable({
    id: block.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`border rounded-[1.25rem] p-4 transition-all duration-200 ${
        isOver
          ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(109,190,69,0.35)]"
          : "bg-border border-border"
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">
          BLOQUE {index + 1}
        </h3>

        <button
          onClick={() => removeBlock(dayIndex, block.id)}
          className="text-red-500 hover:scale-110 transition"
        >
          ❌
        </button>
      </div>

      {block.exercises.length === 0 && (
        <div className="border-2 border-dashed border-border rounded-[1.25rem] p-6 text-center text-muted">
          ARRASTRAR EJERCICIO
        </div>
      )}

      {block.exercises.map((ex: any, i: number) => (
        <div
          key={i}
          className="border border-border bg-tertiary rounded-[1.25rem] p-3 mb-3 space-y-3"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">
              {ex.exercise.name}
            </span>

            <button
              onClick={() =>
                removeExercise(dayIndex, block.id, i)
              }
              className="text-red-500 hover:scale-110 transition"
            >
              ❌
            </button>
          </div>

          <input
            type="text"
            value={ex.instructions}
            onChange={(e) =>
              updateExerciseInstructions(
                dayIndex,
                block.id,
                i,
                e.target.value
              )
            }
            className="w-full bg-surface border border-border rounded-[1.25rem] px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white"
            placeholder="Ej: 12-10-8-6 / RIR 1 / 90s"
          />
        </div>
      ))}
    </div>
  );
}