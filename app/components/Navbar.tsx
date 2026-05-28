"use client";

import Link from "next/link";

export default function Navbar() {
  const role =
    typeof window !== "undefined"
      ? localStorage.getItem("role")
      : "";

  return (
    <div className="mb-6 flex items-center justify-end gap-3">
      
      {(role === "admin" || role === "user") && (
        <>
          <Link
            href="/"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Enrollment
          </Link>

          <Link
            href="/category"
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Category
          </Link>

          <Link
            href="/teams"
            className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            Teams
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem("role");
              window.location.href = "/login";
            }}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
}