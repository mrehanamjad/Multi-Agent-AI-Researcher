import { apiFetch, API_BASE } from "./api";
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

export function downloadPdf(id: string) {
  // Just open the download URL in a new window/tab
  window.open(`${API_BASE}/history/${id}/pdf`, "_blank");
}
