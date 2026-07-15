import type { HistoryPoint, Twin } from "@/types/twin";
import type { SimulationResult } from "@/types/simulation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new ApiError(`Request to ${path} failed`, res.status);
  }
  return res.json() as Promise<T>;
}

export function getTwins(): Promise<Twin[]> {
  return fetchJson<Twin[]>("/twins");
}

export function getTwin(twinId: string): Promise<Twin> {
  return fetchJson<Twin>(`/twins/${twinId}`);
}

export function getTwinHistory(twinId: string): Promise<HistoryPoint[]> {
  return fetchJson<HistoryPoint[]>(`/twins/${twinId}/history`);
}

export function simulateTwin(
  twinId: string,
  loadMultiplier = 2
): Promise<SimulationResult> {
  return fetchJson<SimulationResult>(
    `/simulate/${twinId}?loadMultiplier=${loadMultiplier}`
  );
}