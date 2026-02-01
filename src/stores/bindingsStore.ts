// === STORE: ПРИВЯЗКИ ТОКЕНОВ К ПРОФИЛЯМ ===

import { create } from 'zustand';
import OBR from '@owlbear-rodeo/sdk';
import type { TokenBinding } from '../types';

const BINDINGS_KEY = 'cursed-hearts-hud/bindings';

interface BindingsState {
  bindings: TokenBinding[];
  isLoading: boolean;
  
  // Actions
  loadBindings: () => Promise<void>;
  saveBindings: () => Promise<void>;
  addBinding: (binding: TokenBinding) => void;
  removeBinding: (playerId: string) => void;
  getBindingByPlayerId: (playerId: string) => TokenBinding | undefined;
  getBindingByTokenId: (tokenId: string) => TokenBinding | undefined;
  getBindingByProfileId: (profileId: string) => TokenBinding | undefined;
}

export const useBindingsStore = create<BindingsState>((set, get) => ({
  bindings: [],
  isLoading: false,
  
  loadBindings: async () => {
    set({ isLoading: true });
    try {
      const metadata = await OBR.room.getMetadata();
      const bindings = (metadata[BINDINGS_KEY] as TokenBinding[]) || [];
      set({ bindings, isLoading: false });
    } catch (error) {
      console.error('Error loading bindings:', error);
      set({ isLoading: false });
    }
  },
  
  saveBindings: async () => {
    try {
      const { bindings } = get();
      await OBR.room.setMetadata({ [BINDINGS_KEY]: bindings });
    } catch (error) {
      console.error('Error saving bindings:', error);
    }
  },
  
  addBinding: (binding: TokenBinding) => {
    set(state => {
      // Удаляем старую привязку для этого игрока
      const filtered = state.bindings.filter(b => b.playerId !== binding.playerId);
      return { bindings: [...filtered, binding] };
    });
    get().saveBindings();
  },
  
  removeBinding: (playerId: string) => {
    set(state => ({
      bindings: state.bindings.filter(b => b.playerId !== playerId)
    }));
    get().saveBindings();
  },
  
  getBindingByPlayerId: (playerId: string) => {
    return get().bindings.find(b => b.playerId === playerId);
  },
  
  getBindingByTokenId: (tokenId: string) => {
    return get().bindings.find(b => b.tokenId === tokenId);
  },
  
  getBindingByProfileId: (profileId: string) => {
    return get().bindings.find(b => b.profileId === profileId);
  },
}));
