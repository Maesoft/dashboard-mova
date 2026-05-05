"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function RoutinesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [routineName, setRoutineName] = useState("");

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

  // ✏️ editar valores
  const updateExerciseField = (
    dayIndex: number,
    blockId: string,
    exerciseIndex: number,
    field: "sets" | "reps" | "restSeconds",
    value: number
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
                  [field]: value,
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
                  sets: 3,
                  reps: 10,
                  restSeconds: 60,
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
    const blocks: any[] = [];

    days.forEach((day) => {
      day.blocks.forEach((block: any, blockIndex: number) => {
        blocks.push({
          day: day.day,
          order: blockIndex + 1,
          exercises: block.exercises.map((ex: any, i: number) => ({
            exerciseId: ex.exercise.id,
            sets: ex.sets,
            reps: ex.reps,
            restSeconds: ex.restSeconds,
            order: i + 1,
          })),
        });
      });
    });

    const payload = {
      name: routineName,
      blocks,
    };

    await fetch(`${API}/routines`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    alert("Rutina guardada 🔥");
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="p-6 space-y-6">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">Crear rutina</h1>

          <div className="flex gap-2">
            <input
              placeholder="Nombre rutina"
              className="border px-3 py-2"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
            />
            <button
              onClick={saveRoutine}
              className="bg-primary text-white px-4"
            >
              Guardar
            </button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className="border px-3 py-1"
          >
            Todas
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="border px-3 py-1"
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {filteredExercises.map((ex) => (
            <DraggableExercise key={ex.id} exercise={ex} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-8">
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="border p-4">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Día {day.day}</h2>
                <button
                  onClick={() => removeDay(dayIndex)}
                  className="text-red-500"
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
                    updateExerciseField={updateExerciseField}
                  />
                ))}
              </div>

              <button
                onClick={() => addBlock(dayIndex)}
                className="mt-4 border px-3 py-1"
              >
                ➕ Agregar bloque
              </button>
            </div>
          ))}
        </div>

        <button onClick={addDay} className="border px-4 py-2">
          ➕ Agregar día
        </button>
      </div>
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
      className="border p-2 cursor-grab bg-gray-600"
    >
      {exercise.name}
    </div>
  );
}

function DroppableBlock({
  block,
  index,
  dayIndex,
  removeBlock,
  removeExercise,
  updateExerciseField,
}: any) {
  const { setNodeRef, isOver } = useDroppable({
    id: block.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`border p-4 ${isOver ? "bg-green-100" : ""}`}
    >
      <div className="flex justify-between mb-2">
        <h3 className="font-bold">Bloque {index + 1}</h3>

        <button
          onClick={() => removeBlock(dayIndex, block.id)}
          className="text-red-500"
        >
          ❌
        </button>
      </div>

      {block.exercises.map((ex: any, i: number) => (
        <div key={i} className="border p-2 mb-2 text-sm space-y-2">
          <div className="flex justify-between">
            <span>{ex.exercise.name}</span>

            <button
              onClick={() =>
                removeExercise(dayIndex, block.id, i)
              }
              className="text-red-500"
            >
              ❌
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              value={ex.sets}
              onChange={(e) =>
                updateExerciseField(
                  dayIndex,
                  block.id,
                  i,
                  "sets",
                  Number(e.target.value)
                )
              }
              className="border px-2 w-16"
              placeholder="Sets"
            />

            <input
              type="number"
              value={ex.reps}
              onChange={(e) =>
                updateExerciseField(
                  dayIndex,
                  block.id,
                  i,
                  "reps",
                  Number(e.target.value)
                )
              }
              className="border px-2 w-16"
              placeholder="Reps"
            />

            <input
              type="number"
              value={ex.restSeconds}
              onChange={(e) =>
                updateExerciseField(
                  dayIndex,
                  block.id,
                  i,
                  "restSeconds",
                  Number(e.target.value)
                )
              }
              className="border px-2 w-20"
              placeholder="Descanso"
            />
          </div>
        </div>
      ))}
    </div>
  );
}