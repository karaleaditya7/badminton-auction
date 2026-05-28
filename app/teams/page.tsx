"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

type Player = {
  id: number;
  name: string;
  mobile: string;
  category: string;
  finalCategory?: string;
};

type TeamPlayer = {
  playerId: number;
  category: string;
};

type Team = {
  id: number;
  name: string;
  players: TeamPlayer[];
};

type CategoryCapacity = {
  [category: string]: number;
};

export default function TeamsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryCapacity, setCategoryCapacity] = useState<CategoryCapacity>({});

  const fetchPlayers = () => {
    const savedAssignedPlayers = localStorage.getItem("assignedPlayers");
    if (savedAssignedPlayers) setPlayers(JSON.parse(savedAssignedPlayers));
  };

  const fetchCategories = async () => {
    const response = await fetch("/api/categories", { cache: "no-store" });
    const data = await response.json();
    setCategories(data);
  };

  const fetchTeams = async () => {
    const response = await fetch("/api/teams", { cache: "no-store" });
    const data = await response.json();

    const formattedTeams: Team[] = data
      .filter((team: { id: number; name: string }) => team.id && team.name)
      .map((team: { id: number; name: string }) => ({
        id: team.id,
        name: team.name,
        players: [],
      }));

    setTeams(formattedTeams);
  };

  const fetchCategoryCapacity = async () => {
    const response = await fetch("/api/category-capacity", {
      cache: "no-store",
    });

    const data = await response.json();
    const capacityObject: CategoryCapacity = {};

    data.forEach((item: { category: string; capacity: number }) => {
      capacityObject[item.category] = item.capacity;
    });

    setCategoryCapacity(capacityObject);
  };

  useEffect(() => {
    fetchPlayers();
    fetchCategories();
    fetchTeams();
    fetchCategoryCapacity();
  }, []);

  const selectedPlayerIds = teams.flatMap((team) =>
    team.players.map((player) => player.playerId)
  );

  const createTeam = async () => {
    if (!teamName.trim()) return;

    const response = await fetch("/api/teams", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: teamName.trim() }),
    });

    if (response.ok) {
      setTeamName("");
      await fetchTeams();
    }
  };

  const deleteTeam = async (teamId: number) => {
    const response = await fetch("/api/teams", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: teamId }),
    });

    if (response.ok) {
      setTeams((prev) => prev.filter((team) => team.id !== teamId));
      await fetchTeams();
    }
  };

  const saveCapacity = async (category: string, capacity: number) => {
    await fetch("/api/category-capacity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ category, capacity }),
    });

    await fetchCategoryCapacity();
  };

  const increaseCapacity = async (category: string) => {
    const newCapacity = (categoryCapacity[category] || 0) + 1;

    setCategoryCapacity({
      ...categoryCapacity,
      [category]: newCapacity,
    });

    await saveCapacity(category, newCapacity);
  };

  const decreaseCapacity = async (category: string) => {
    const newCapacity = Math.max((categoryCapacity[category] || 0) - 1, 0);

    setCategoryCapacity({
      ...categoryCapacity,
      [category]: newCapacity,
    });

    await saveCapacity(category, newCapacity);
  };

  const addPlayerToTeam = (teamId: number, player: Player) => {
    if (!player.finalCategory) return;

    const capacity = categoryCapacity[player.finalCategory] || 0;

    setTeams(
    teams.map((team) => {
            if (team.id !== teamId) return team;

            const alreadyAdded = selectedPlayerIds.includes(player.id);
            if (alreadyAdded) return team;

            const currentCategoryCount = team.players.filter(
            (p) => p.category === player.finalCategory
            ).length;

            if (capacity > 0 && currentCategoryCount >= capacity) {
            alert(`Category ${player.finalCategory} is full for ${team.name}`);
            return team;
            }

            return {
            ...team,
            players: [
                ...team.players,
                {
                playerId: player.id,
                category: player.finalCategory!,
                },
            ],
            };
        })
        );
    };

  const removePlayerFromTeam = (teamId: number, playerId: number) => {
    setTeams(
      teams.map((team) =>
        team.id === teamId
          ? {
              ...team,
              players: team.players.filter(
                (player) => player.playerId !== playerId
              ),
            }
          : team
      )
    );
  };

  const getPlayerName = (playerId: number) => {
    return players.find((player) => player.id === playerId)?.name || "Unknown";
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl rounded-xl bg-white p-6 shadow">
      <Navbar />
        <h1 className="mb-6 text-3xl font-bold">🏸 Create Teams</h1>

        <div className="mb-8 rounded border p-4">
          <h2 className="mb-3 text-xl font-semibold">Create Team</h2>

          <div className="flex gap-3">
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter Team Name"
              className="flex-1 rounded border p-3"
            />

            <button
              onClick={createTeam}
              className="rounded bg-blue-600 px-5 text-white hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mb-8 rounded border p-4">
            <h2 className="mb-4 text-xl font-semibold">Category Capacity</h2>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between rounded border bg-gray-50 p-3"
                >
                  <span className="font-semibold">{category}</span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => decreaseCapacity(category)}
                      className="rounded bg-red-500 px-3 py-1 text-white"
                    >
                      -
                    </button>

                    <span className="font-bold">
                      {categoryCapacity[category] || 0}
                    </span>

                    <button
                      onClick={() => increaseCapacity(category)}
                      className="rounded bg-green-600 px-3 py-1 text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {players.length === 0 && (
          <div className="mb-6 rounded border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
            Please assign players to final categories from Category page first.
          </div>
        )}

        {teams.length === 0 ? (
          <p className="text-gray-500">No teams created yet.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {teams.map((team) => (
              <div key={team.id} className="rounded-xl border bg-gray-50 p-4">
                <TeamHeader
                  team={team}
                  players={players}
                  selectedPlayerIds={selectedPlayerIds}
                  deleteTeam={deleteTeam}
                  addPlayerToTeam={addPlayerToTeam}
                />

                <div className="mt-5 space-y-3">
                  {categories.map((category) => {
                    const categoryPlayers = team.players.filter(
                      (player) => player.category === category
                    );

                    return (
                      <div
                        key={category}
                        className="rounded border bg-white p-3"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-semibold">Category {category}</h3>

                          <span className="text-sm font-semibold text-gray-600">
                            {categoryPlayers.length}/
                            {categoryCapacity[category] || 0}
                          </span>
                        </div>

                        {categoryPlayers.length === 0 ? (
                          <p className="text-sm text-gray-400">
                            No players added.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {categoryPlayers.map((player, index) => (
                              <div
                                key={player.playerId}
                                className="flex items-center justify-between gap-2 rounded border bg-gray-50 p-2"
                              >
                                <span className="text-sm">
                                  {index + 1}. {getPlayerName(player.playerId)}
                                </span>

                                <button
                                  onClick={() =>
                                    removePlayerFromTeam(
                                      team.id,
                                      player.playerId
                                    )
                                  }
                                  className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function TeamHeader({
  team,
  players,
  selectedPlayerIds,
  deleteTeam,
  addPlayerToTeam,
}: {
  team: Team;
  players: Player[];
  selectedPlayerIds: number[];
  deleteTeam: (teamId: number) => Promise<void>;
  addPlayerToTeam: (teamId: number, player: Player) => void;
}) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");

  const availablePlayers = players.filter(
    (player) => !selectedPlayerIds.includes(player.id)
  );

  const selectedPlayer = availablePlayers.find(
    (player) => player.id === Number(selectedPlayerId)
  );

  const handleAddPlayer = () => {
    if (!selectedPlayer) return;

    addPlayerToTeam(team.id, selectedPlayer);
    setSelectedPlayerId("");
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold">{team.name}</h2>

        <button
          onClick={() => deleteTeam(team.id)}
          className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>

      <div className="space-y-3">
        <select
          value={selectedPlayerId}
          onChange={(e) => setSelectedPlayerId(e.target.value)}
          className="w-full rounded border p-3"
        >
          <option value="">Select Player</option>

          {availablePlayers.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name} - {player.finalCategory}
            </option>
          ))}
        </select>

        <button
          disabled={!selectedPlayerId}
          onClick={handleAddPlayer}
          className={`w-full rounded px-4 py-3 text-white ${
            selectedPlayerId
              ? "bg-blue-600 hover:bg-blue-700"
              : "cursor-not-allowed bg-gray-400"
          }`}
        >
          Add Player
        </button>
      </div>
    </>
  );
}