"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
type Player = {
  id: number;
  name: string;
  mobile: string;
  age: string;
};

export default function Home() {
  const role =
  typeof window !== "undefined"
    ? localStorage.getItem("role")
    : "";
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [age, setAge] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [showPlayers, setShowPlayers] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchPlayers = async () => {
    const response = await fetch("/api/players", { cache: "no-store" });
    const data = await response.json();
    setPlayers(data);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const enrollPlayer = async () => {
    if (!name.trim() || !mobile.trim() || !age.trim()) return;

    const response = await fetch("/api/players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        mobile: mobile.trim(),
        age: age.trim(),
      }),
    });

    if (response.ok) {
      setName("");
      setMobile("");
      setAge("");
      setShowSuccess(true);
      await fetchPlayers();

      setTimeout(() => {
        setShowSuccess(false);
      }, 2500);
    }
  };

  const deleteSelectedPlayer = async () => {
    if (!selectedPlayerId) return;

    const response = await fetch("/api/players", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: Number(selectedPlayerId),
      }),
    });

    if (response.ok) {
      setSelectedPlayerId("");
      await fetchPlayers();
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow">
        <Navbar />

        <h1 className="mb-4 text-3xl font-bold">🏸 Player Enrollment</h1>

        {showSuccess && (
          <div className="mb-5 rounded-lg border border-green-300 bg-green-100 p-4 text-green-800 shadow">
            ✅ You have enrolled successfully
          </div>
        )}

        <h2 className="mb-4 text-xl font-semibold">Player Registration</h2>

        <div className="mb-8 grid gap-3 md:grid-cols-4">
          <input
            type="text"
            placeholder="Enter Name & Surname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border p-3"
          />

          <input
            type="tel"
            placeholder="Enter Mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="rounded border p-3"
          />

          <input
            type="number"
            placeholder="Enter Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="rounded border p-3"
          />

          <button
            onClick={enrollPlayer}
            disabled={!name.trim() || !mobile.trim() || !age.trim()}
            className={`rounded px-5 text-white ${
              name.trim() && mobile.trim() && age.trim()
                ? "bg-blue-600 hover:bg-blue-700"
                : "cursor-not-allowed bg-gray-400"
            }`}
          >
            Enroll
          </button>
        </div>

        <button
          onClick={async () => {
            setShowPlayers(!showPlayers);
            setSelectedPlayerId("");
            await fetchPlayers();
          }}
          className="mb-4 rounded bg-green-600 px-5 py-3 text-white hover:bg-green-700"
        >
          {showPlayers ? "Hide Players" : "See Players"}
        </button>

        {showPlayers && (
          <div className="mt-4">
            <h2 className="mb-4 text-xl font-semibold">Players List</h2>

            {players.length === 0 ? (
              <p className="text-gray-500">No players enrolled.</p>
            ) : (
              <div className="space-y-2">
                {players.map((player, index) => {
                  const isSelected = selectedPlayerId === String(player.id);

                  return (
                    <div
                      key={player.id || index}
                      onClick={() => setSelectedPlayerId(String(player.id))}
                      className={`flex cursor-pointer items-center justify-between rounded border p-3 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <span>
                        {index + 1}. {player.name} - {player.mobile} - Age:{" "}
                        {player.age}
                      </span>

                      {isSelected && role === "admin" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSelectedPlayer();
                          }}
                          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}