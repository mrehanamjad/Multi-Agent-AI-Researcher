export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

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
    public data?: any,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...init?.headers,
  };

  const token = await getAuthToken();
  if (token) {
    // @ts-ignore
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      // Ignored
    }
    throw new APIError(
      response.status,
      errorData?.detail || `Request failed with status ${response.status}`,
      errorData,
    );
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  // Check if response is JSON
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response.text() as unknown as T;
}
