import { apiFetch, API_BASE, getAuthToken, APIError } from "./api";
import type { HistoryItem, Report } from "@/types";

export interface HistoryListResponse {
  reports: HistoryItem[];
  total: number;
}

export async function getHistory(): Promise<HistoryListResponse> {
  return apiFetch<HistoryListResponse>("/history");
}

export async function getReportById(id: string): Promise<Report> {
  const data: Report = await apiFetch<Report>(`/history/${id}`);

  // if (data.status !== "COMPLETED" && data.status !== "FAILED" && data.status !== "WAITING_FOR_USER") {
  //   data.status = "FAILED";
  // }

  return data;
}

export async function deleteReport(id: string): Promise<{ status: string; id: string }> {
  return apiFetch(`/history/${id}`, { method: "DELETE" });
}

export async function downloadPdf(id: string) {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE}/history/${id}/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      detail = data?.detail || detail;
    } catch {
      // Ignored
    }
    throw new APIError(response.status, detail);
  }

  const blob = await response.blob();

  // Honor the filename the server sent via Content-Disposition.
  const disposition = response.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] || `research_${id}.pdf`;

  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);

}

