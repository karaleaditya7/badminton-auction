"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { users } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = () => {
    const user = users.find(
      (u) =>
        u.username === username.trim() &&
        u.password === password.trim()
    );

    if (!user) {
      setError("Invalid username or password");
      return;
    }

    localStorage.setItem("role", user.role);
    localStorage.setItem("username", user.username);

    router.push("/teams");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="mb-6 text-3xl font-bold">
          🏸 Login
        </h1>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded border p-3"
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border p-3"
          />

          <button
            onClick={login}
            className="w-full rounded bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
          >
            Login
          </button>
        </div>

        <div className="mt-6 rounded bg-gray-100 p-4 text-sm">
          <p className="font-semibold">Demo Credentials</p>

          <p className="mt-2">
            Admin → admin / admin123
          </p>

          <p>
            User → user / user123
          </p>
        </div>
      </div>
    </main>
  );
}