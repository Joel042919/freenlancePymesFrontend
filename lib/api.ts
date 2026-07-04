import { clearSession, getToken } from "./auth";

export const API_BASE_URL = "http://localhost:8080/api/v1";

export class ApiError extends Error {
  status: number;
  body: any;

  constructor(message: string, status: number, body: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearSession();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError("Sesión expirada. Vuelve a iniciar sesión.", 401, null);
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(data?.error || "Ocurrió un error al conectar con el servidor.", response.status, data);
  }

  return data;
}
