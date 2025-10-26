import { create } from 'zustand';

export interface ResumeSectionState {
  id: string;
  type: string;
  orderIndex: number;
  content: Record<string, unknown>;
}

interface ResumeStore {
  sections: ResumeSectionState[];
  setSections: (sections: ResumeSectionState[]) => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  sections: [],
  setSections: (sections) => set({ sections }),
}));
