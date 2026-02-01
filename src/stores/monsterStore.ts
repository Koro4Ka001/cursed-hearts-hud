// === STORE: МОНСТРЫ ===

import { create } from 'zustand';
import type { MonsterProfile } from '../types';

interface MonsterState {
  monsters: Map<string, MonsterProfile>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setMonster: (tokenId: string, monster: MonsterProfile) => void;
  getMonster: (tokenId: string) => MonsterProfile | undefined;
  updateMonsterHp: (tokenId: string, newHp: number) => void;
  removeMonster: (tokenId: string) => void;
  clearMonsters: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useMonsterStore = create<MonsterState>((set, get) => ({
  monsters: new Map(),
  isLoading: false,
  error: null,
  
  setMonster: (tokenId: string, monster: MonsterProfile) => {
    set(state => {
      const newMonsters = new Map(state.monsters);
      newMonsters.set(tokenId, monster);
      return { monsters: newMonsters };
    });
  },
  
  getMonster: (tokenId: string) => {
    return get().monsters.get(tokenId);
  },
  
  updateMonsterHp: (tokenId: string, newHp: number) => {
    set(state => {
      const monster = state.monsters.get(tokenId);
      if (monster) {
        const newMonsters = new Map(state.monsters);
        newMonsters.set(tokenId, { ...monster, currentHp: newHp });
        return { monsters: newMonsters };
      }
      return state;
    });
  },
  
  removeMonster: (tokenId: string) => {
    set(state => {
      const newMonsters = new Map(state.monsters);
      newMonsters.delete(tokenId);
      return { monsters: newMonsters };
    });
  },
  
  clearMonsters: () => {
    set({ monsters: new Map() });
  },
  
  setError: (error: string | null) => {
    set({ error });
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
