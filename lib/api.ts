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
  let data: any = null;
  let rawText = "";
  if (isJson) {
    data = await response.json();
  } else {
    rawText = await response.text().catch(() => "");
  }

  if (!response.ok) {
    const method = options.method || "GET";
    let message = data?.error || data?.message || "";
    if (!message) {
      if (response.status === 405) {
        message = `Método ${method} no permitido en ${path} (405).`;
      } else if (response.status === 404) {
        message = `Recurso no encontrado: ${path} (404).`;
      } else if (response.status >= 500) {
        message = `Error del servidor (${response.status}).`;
      } else {
        message = `Error ${response.status} al conectar con el servidor.`;
      }
    }
    throw new ApiError(message, response.status, data || rawText);
  }

  return data;
}
