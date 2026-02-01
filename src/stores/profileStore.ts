// === STORE: ПРОФИЛИ ПЕРСОНАЖЕЙ ===

import { create } from 'zustand';
import type { CharacterProfile } from '../types';
import * as api from '../api/googleDocsApi';

interface ProfileState {
  profiles: CharacterProfile[];
  currentProfile: CharacterProfile | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
  
  // Actions
  fetchProfiles: () => Promise<void>;
  fetchCurrentProfile: (profileId: string) => Promise<void>;
  setCurrentProfile: (profile: CharacterProfile | null) => void;
  updateCurrentProfile: (updates: Partial<CharacterProfile>) => void;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  currentProfile: null,
  isLoading: false,
  error: null,
  lastUpdate: 0,
  
  fetchProfiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getProfiles();
      if (response.success && response.data) {
        set({ 
          profiles: response.data, 
          isLoading: false,
          lastUpdate: Date.now()
        });
      } else {
        set({ 
          error: response.error || 'Ошибка загрузки профилей', 
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: String(error), 
        isLoading: false 
      });
    }
  },
  
  fetchCurrentProfile: async (profileId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getStats(profileId);
      if (response.success && response.data) {
        set({ 
          currentProfile: response.data, 
          isLoading: false,
          lastUpdate: Date.now()
        });
      } else {
        set({ 
          error: response.error || 'Ошибка загрузки профиля', 
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: String(error), 
        isLoading: false 
      });
    }
  },
  
  setCurrentProfile: (profile: CharacterProfile | null) => {
    set({ currentProfile: profile });
  },
  
  updateCurrentProfile: (updates: Partial<CharacterProfile>) => {
    const { currentProfile } = get();
    if (currentProfile) {
      set({ 
        currentProfile: { ...currentProfile, ...updates },
        lastUpdate: Date.now()
      });
    }
  },
  
  clearError: () => {
    set({ error: null });
  },
}));
