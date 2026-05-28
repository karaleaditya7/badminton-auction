"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [role, setRole] = useState("");

  useEffect(() => {
    setRole(localStorage.getItem("role") || "");
  }, []);

  const logout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    window.location.href = "/";
  };

  return (
    <div className="mb-6 flex justify-end gap-3">
      <Link href="/enroll" className="rounded bg-gray-700 px-4 py-2 text-white">
        Enrollment
      </Link>

      {(role === "admin" || role === "user") && (
        <>
          <Link href="/category" className="rounded bg-blue-600 px-4 py-2 text-white">
            Category
          </Link>

          <Link href="/teams" className="rounded bg-green-600 px-4 py-2 text-white">
            Teams
          </Link>
        </>
      )}

        <button
        onClick={() => {
            localStorage.removeItem("role");
            window.location.href = "/login";
        }}
        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
        Logout
        </button>
    </div>
  );
}