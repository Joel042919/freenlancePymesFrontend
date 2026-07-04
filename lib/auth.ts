export type UserRole = "FREELANCER" | "PYME" | "ADMIN";

interface SessionData {
  token: string;
  role: string;
  email: string;
  expiresIn: number;
}

export function setSession({ token, role, email, expiresIn }: SessionData) {
  const maxAge = Math.floor(expiresIn / 1000);

  document.cookie = `jwt_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `user_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `user_email=${email}; path=/; max-age=${maxAge}; SameSite=Lax`;

  localStorage.setItem("jwt_token", token);
  localStorage.setItem("user_role", role);
  localStorage.setItem("user_email", email);
}

export function clearSession() {
  document.cookie = "jwt_token=; path=/; max-age=0";
  document.cookie = "user_role=; path=/; max-age=0";
  document.cookie = "user_email=; path=/; max-age=0";

  localStorage.removeItem("jwt_token");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_email");
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getToken(): string | null {
  return readCookie("jwt_token");
}

export function getRole(): UserRole | null {
  return readCookie("user_role") as UserRole | null;
}

export function getEmail(): string | null {
  return readCookie("user_email");
}
