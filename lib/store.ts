import { create } from "zustand";
import {
  Intervention,
  interventions as initialInterventions,
} from "@/lib/data";

export type MapLens = "hvs" | "lst" | "canopy" | "vulnerability";

interface SimulatorState {
  trees: number;
  cool_roof: number;
  permeable: number;
}

interface SimulatorHistory {
  states: SimulatorState[];
  currentIndex: number;
}

interface AppState {
  // Selected ward
  selectedWardId: string | null;
  setSelectedWard: (id: string | null) => void;

  // Map lens
  mapLens: MapLens;
  setMapLens: (lens: MapLens) => void;

  // Date selector
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;

  // Simulator state with history
  simulator: SimulatorState;
  simulatorHistory: SimulatorHistory;
  setSimulatorValue: (key: keyof SimulatorState, value: number) => void;
  resetSimulator: () => void;
  undoSimulator: () => void;
  redoSimulator: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Interventions
  interventions: Intervention[];
  addIntervention: (
    intervention: Omit<Intervention, "id" | "created_at">,
  ) => void;

  // Sheet state (replacing modals)
  activeSheet: string | null;
  sheetNumber: number;
  openSheet: (sheetId: string) => void;
  closeSheet: () => void;
}

const initialSimulatorState: SimulatorState = {
  trees: 0,
  cool_roof: 0,
  permeable: 0,
};

export const useAppStore = create<AppState>((set, get) => ({
  // Selected ward
  selectedWardId: null,
  setSelectedWard: (id) => set({ selectedWardId: id }),

  // Map lens
  mapLens: "hvs",
  setMapLens: (lens) => set({ mapLens: lens }),

  // Date selector
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),

  // Simulator with history
  simulator: { ...initialSimulatorState },
  simulatorHistory: {
    states: [{ ...initialSimulatorState }],
    currentIndex: 0,
  },

  setSimulatorValue: (key, value) => {
    const { simulator, simulatorHistory } = get();
    const newState = { ...simulator, [key]: value };

    // Truncate future states if we're not at the end
    const newStates = simulatorHistory.states.slice(
      0,
      simulatorHistory.currentIndex + 1,
    );
    newStates.push(newState);

    // Keep only last 50 states
    if (newStates.length > 50) newStates.shift();

    set({
      simulator: newState,
      simulatorHistory: {
        states: newStates,
        currentIndex: newStates.length - 1,
      },
    });
  },

  resetSimulator: () =>
    set({
      simulator: { ...initialSimulatorState },
      simulatorHistory: {
        states: [{ ...initialSimulatorState }],
        currentIndex: 0,
      },
    }),

  undoSimulator: () => {
    const { simulatorHistory } = get();
    if (simulatorHistory.currentIndex > 0) {
      const newIndex = simulatorHistory.currentIndex - 1;
      set({
        simulator: { ...simulatorHistory.states[newIndex] },
        simulatorHistory: {
          ...simulatorHistory,
          currentIndex: newIndex,
        },
      });
    }
  },

  redoSimulator: () => {
    const { simulatorHistory } = get();
    if (simulatorHistory.currentIndex < simulatorHistory.states.length - 1) {
      const newIndex = simulatorHistory.currentIndex + 1;
      set({
        simulator: { ...simulatorHistory.states[newIndex] },
        simulatorHistory: {
          ...simulatorHistory,
          currentIndex: newIndex,
        },
      });
    }
  },

  canUndo: () => get().simulatorHistory.currentIndex > 0,
  canRedo: () =>
    get().simulatorHistory.currentIndex <
    get().simulatorHistory.states.length - 1,

  // Interventions
  interventions: [...initialInterventions],
  addIntervention: (intervention) => {
    const newIntervention: Intervention = {
      ...intervention,
      id: `int-${String(Date.now()).slice(-6)}`,
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      interventions: [...state.interventions, newIntervention],
    }));
  },

  // Sheet state
  activeSheet: null,
  sheetNumber: 1,
  openSheet: (sheetId) =>
    set((state) => ({
      activeSheet: sheetId,
      sheetNumber: state.sheetNumber + 1,
    })),
  closeSheet: () => set({ activeSheet: null }),
}));
