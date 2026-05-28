export type Role = "admin" | "user";

export const users = [
  { username: "admin", password: "admin123", role: "admin" as Role },
  { username: "user", password: "user123", role: "user" as Role },
];