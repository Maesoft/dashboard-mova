export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

const getBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) throw new ApiError("La URL de la API no está configurada", 0);
  return baseUrl.replace(/\/$/, "");
};

const clearSessionAndRedirect = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.assign("/login");
};

const parseResponse = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  if (typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers,
  });
  const body = await parseResponse(response);

  if (response.status === 401) {
    clearSessionAndRedirect();
  }
  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      (typeof body.message === "string" || Array.isArray(body.message))
        ? Array.isArray(body.message)
          ? body.message.join(", ")
          : body.message
        : typeof body === "string" && body
          ? body
          : `Error en la API (${response.status})`;
    throw new ApiError(message, response.status, body);
  }
  return body as T;
}
