import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'rihlat_almalayeen_mobile_state_v1';

export interface AppState {
  completedMissions: number[];
  completedNodes: number[];
  activeNode: number;
  hearts: number;
  errors: number;
  score: number;
  streak: number;
  muted: boolean;
  studentName: string;
  skillStats: {
    place: { ok: number; err: number };
    verbal: { ok: number; err: number };
    standard: { ok: number; err: number };
    expanded: { ok: number; err: number };
  };
  badges: string[];
  geminiApiKey: string;
}

export const defaultState: AppState = {
  completedMissions: [],
  completedNodes: [0],
  activeNode: 0,
  hearts: 3,
  errors: 0,
  score: 0,
  streak: 1,
  muted: false,
  studentName: '',
  skillStats: {
    place: { ok: 0, err: 0 },
    verbal: { ok: 0, err: 0 },
    standard: { ok: 0, err: 0 },
    expanded: { ok: 0, err: 0 },
  },
  badges: [],
  geminiApiKey: '',
};

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}
