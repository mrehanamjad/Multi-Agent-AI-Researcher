import { API_BASE, apiFetch, getAuthToken } from "./api";
import type { SSEEvent, StatusResponse } from "@/types";

/**
 * Common logic to read an SSE stream from the FastAPI backend.
 */
async function processResearchStream(
  url: string,
  body: object,
  onEvent: (event: SSEEvent) => void,
  signal?: AbortSignal,
) {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const token = await getAuthToken();
  if (token) {
    // @ts-ignore
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    let errorMsg = `Server error: ${response.status}`;
    try {
      const data = await response.json();
      if (data.detail) errorMsg = data.detail;
    } catch {
      // Ignore
    }
    throw new Error(errorMsg);
  }

  if (!response.body) {
    throw new Error("No response body returned from stream.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");

    // Process complete lines
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (line.startsWith("data: ")) {
        const dataStr = line.substring(6);
        if (dataStr === "[DONE]") {
          return;
        }
        try {
          const eventData = JSON.parse(dataStr) as SSEEvent;
          onEvent(eventData);
        } catch (err) {
          console.error("Failed to parse SSE event:", dataStr, err);
        }
      }
    }
    
    // Keep incomplete lines in the buffer
    buffer = lines[lines.length - 1];
  }
}

export async function streamResearch(
  topic: string,
  onEvent: (event: SSEEvent) => void,
  signal?: AbortSignal,
) {
  return processResearchStream(
    `${API_BASE}/research`,
    { topic },
    onEvent,
    signal,
  );
}

export async function streamClarifications(
  reportId: string,
  answers: Record<string, string>,
  onEvent: (event: SSEEvent) => void,
  signal?: AbortSignal,
) {
  return processResearchStream(
    `${API_BASE}/research/${reportId}/clarifications`,
    { answers },
    onEvent,
    signal,
  );
}

export async function getResearchStatus(reportId: string): Promise<StatusResponse> {
  return apiFetch<StatusResponse>(`/research/${reportId}/status`);
}
