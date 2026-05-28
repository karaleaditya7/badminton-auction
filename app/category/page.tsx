"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

type Player = {
  id: number;
  name: string;
  mobile: string;
  category: string;
};

type AssignedPlayer = Player & {
  finalCategory: string;
};

export default function CategoryPage() {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [assignedPlayers, setAssignedPlayers] = useState<AssignedPlayer[]>([]);
  const [showPlayers, setShowPlayers] = useState(false);

  const fetchPlayers = async () => {
    const response = await fetch("/api/players", { cache: "no-store" });
    const data = await response.json();
    setPlayers(data);
  };

  const fetchCategories = async () => {
    const response = await fetch("/api/categories", { cache: "no-store" });
    const data = await response.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchPlayers();
    fetchCategories();

    const savedAssignedPlayers = localStorage.getItem("assignedPlayers");

    if (savedAssignedPlayers) {
      setAssignedPlayers(JSON.parse(savedAssignedPlayers));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("assignedPlayers", JSON.stringify(assignedPlayers));
  }, [assignedPlayers]);

  const createCategory = async () => {
    const newCategory = categoryName.trim();

    if (!newCategory) return;
    if (categories.includes(newCategory)) return;

    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ category: newCategory }),
    });

    if (response.ok) {
      setCategoryName("");
      await fetchCategories();
    }
  };

  const deleteCategory = async (category: string) => {
    const response = await fetch("/api/categories", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ category }),
    });

    if (response.ok) {
      setAssignedPlayers(
        assignedPlayers.filter((player) => player.finalCategory !== category)
      );

      await fetchCategories();
    }
  };

  const assignPlayerToCategory = (player: Player, finalCategory: string) => {
    const withoutThisPlayer = assignedPlayers.filter((p) => p.id !== player.id);

    setAssignedPlayers([
      ...withoutThisPlayer,
      {
        ...player,
        finalCategory,
      },
    ]);
  };

  const removeFromCategory = (playerId: number) => {
    setAssignedPlayers(
      assignedPlayers.filter((player) => player.id !== playerId)
    );
  };

  const getPlayersByCategory = (category: string) => {
    return assignedPlayers.filter(
      (player) => player.finalCategory === category
    );
  };

  const isPlayerAssigned = (playerId: number) => {
    return assignedPlayers.some((player) => player.id === playerId);
  };

  const getAssignedCategory = (playerId: number) => {
    return assignedPlayers.find((player) => player.id === playerId)
      ?.finalCategory;
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl rounded-xl bg-white p-6 shadow">
      <Navbar />
        <h1 className="mb-6 text-3xl font-bold">🏸 Category Dashboard</h1>

        <div className="mb-8 rounded border p-4">
          <h2 className="mb-3 text-xl font-semibold">Create Category</h2>

          <div className="flex gap-3">
            <input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Example: A+, A, B+, B, C"
              className="flex-1 rounded border p-3"
            />

            <button
              onClick={createCategory}
              className="rounded bg-blue-600 px-5 text-white hover:bg-blue-700"
            >
              Create Category
            </button>
          </div>
        </div>

        <button
          onClick={async () => {
            setShowPlayers(!showPlayers);
            await fetchPlayers();
            await fetchCategories();
          }}
          className="mb-6 rounded bg-green-600 px-5 py-3 text-white hover:bg-green-700"
        >
          {showPlayers ? "Hide Players" : "See Players"}
        </button>

        {showPlayers && (
          <div className="mb-8 rounded border bg-gray-50 p-4">
            <h2 className="mb-4 text-xl font-semibold">Enrolled Players</h2>

            {players.length === 0 ? (
              <p className="text-gray-500">No players enrolled yet.</p>
            ) : categories.length === 0 ? (
              <p className="text-gray-500">Please create categories first.</p>
            ) : (
              <div className="space-y-3">
                {players.map((player, index) => {
                  const assignedCategory = getAssignedCategory(player.id);

                  return (
                    <div
                      key={player.id}
                      className={`rounded border p-4 ${
                        isPlayerAssigned(player.id)
                          ? "border-green-400 bg-green-50"
                          : "bg-white"
                      }`}
                    >
                      <div className="mb-3">
                        <p className="font-semibold">
                          {index + 1}. {player.name}
                        </p>

                        {/* <p className="text-sm text-gray-600">
                          Mobile: {player.mobile}{" "}
                          {player.category}
                        </p> */}

                        {assignedCategory && (
                          <p className="mt-1 text-sm font-semibold text-green-700">
                            Final Category: {assignedCategory}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <button
                            key={category}
                            onClick={() =>
                              assignPlayerToCategory(player, category)
                            }
                            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <h2 className="mb-4 text-2xl font-bold">Category Blocks</h2>

        {categories.length === 0 ? (
          <p className="text-gray-500">No categories created yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => {
              const categoryPlayers = getPlayersByCategory(category);

              return (
                <div
                  key={category}
                  className="rounded-xl border bg-gray-50 p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <h3 className="text-xl font-bold">Category {category}</h3>

                    <button
                      onClick={() => deleteCategory(category)}
                      className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>

                  {categoryPlayers.length === 0 ? (
                    <p className="text-sm text-gray-500">No players added.</p>
                  ) : (
                    <div className="space-y-2">
                      {categoryPlayers.map((player, index) => (
                        <div
                          key={player.id}
                          className="rounded border bg-white p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm">
                              {index + 1}. {player.name}
                            </span>

                            <button
                              onClick={() => removeFromCategory(player.id)}
                              className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}