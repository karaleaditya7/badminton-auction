"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navClass = (path: string) =>
    `rounded px-4 py-2 text-white transition ${
      pathname === path
        ? "bg-black"
        : "bg-gray-700 hover:bg-gray-800"
    }`;

  return (
    <div className="mb-6 flex justify-end gap-3">
      <Link href="/" className={navClass("/")}>
        Players
      </Link>

      <Link href="/category" className={navClass("/category")}>
        Category
      </Link>

      <Link href="/teams" className={navClass("/teams")}>
        Teams
      </Link>
    </div>
  );
}