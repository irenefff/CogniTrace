import { create } from 'zustand';
import type { AnalysisResult } from '~lib/analyzer';

interface DashboardState {
  analysis: AnalysisResult | null;
  setAnalysis: (result: AnalysisResult) => void;
  isRecording: boolean;
  setRecording: (status: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  analysis: null,
  setAnalysis: (result) => set({ analysis: result }),
  isRecording: false,
  setRecording: (status) => set({ isRecording: status }),
}));
