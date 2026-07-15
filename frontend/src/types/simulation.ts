export type SimulationRecommendation = 'SAFE' | 'MONITOR_CLOSELY' | 'ADD_REPLICA';

export interface SimulationResult {
  cpuNow: number;
  memoryNow: number;
  cpuSlope: number;
  memorySlope: number;
  cpuPrediction: number;
  memoryPrediction: number;
  secondsToCpuDanger: number | null;
  secondsToMemoryDanger: number | null;
  recommendation: SimulationRecommendation;
}