export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

let getToken: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (getter: () => Promise<string | null>) => {
  getToken = getter;
};

export const getAuthToken = async () => {
  if (getToken) return await getToken();
  return null;
};

export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "APIError";
  }
}

interface CustomRequestInit extends RequestInit {
  timeout?: number;
}

export async function apiFetch<T>(path: string, init?: CustomRequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = await getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Setup abort controller for timeout
  const timeoutMs = init?.timeout || 30000; // 30 second default timeout
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError(408, "Request timed out", null);
    }
    throw error;
  } finally {
    clearTimeout(id);
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      // Ignored
    }
    
    // Centralized 401 handling (e.g. could trigger a custom event or redirect)
    if (response.status === 401) {
      console.warn("Unauthorized request. Token may be expired.");
    }
    
    throw new APIError(
      response.status,
      errorData?.detail || `Request failed with status ${response.status}`,
      errorData,
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response.text() as unknown as T;
}
