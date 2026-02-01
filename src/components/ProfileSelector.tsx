// === КОМПОНЕНТ: ВЫБОР ПРОФИЛЯ ===

import { useState, useEffect } from 'react';
import { Button, Select } from './common';
import { useProfileStore } from '@/stores/profileStore';
import { useBindingsStore } from '@/stores/bindingsStore';
import type { CharacterProfile } from '@/types';

interface ProfileSelectorProps {
  playerId: string;
  onProfileSelected: (profile: CharacterProfile) => void;
}

export function ProfileSelector({ playerId, onProfileSelected }: ProfileSelectorProps) {
  const { profiles, isLoading, error, fetchProfiles } = useProfileStore();
  const { addBinding, getBindingByPlayerId } = useBindingsStore();
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  
  // Загружаем профили при монтировании
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);
  
  // Проверяем существующую привязку
  useEffect(() => {
    const binding = getBindingByPlayerId(playerId);
    if (binding) {
      const profile = profiles.find(p => p.id === binding.profileId);
      if (profile) {
        setSelectedProfileId(profile.id);
        onProfileSelected(profile);
      }
    }
  }, [playerId, profiles, getBindingByPlayerId, onProfileSelected]);
  
  const handleSelect = () => {
    const profile = profiles.find(p => p.id === selectedProfileId);
    if (profile) {
      // Сохраняем привязку
      addBinding({
        playerId,
        tokenId: profile.tokenId || '',
        profileId: profile.id,
      });
      onProfileSelected(profile);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[#8a8273]">
        <div className="w-8 h-8 border-2 border-[#b8860b] border-t-transparent rounded-full animate-spin mb-4" />
        <p>Загрузка профилей...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-center">{error}</p>
        </div>
        <Button variant="secondary" onClick={() => fetchProfiles()}>
          Повторить
        </Button>
      </div>
    );
  }
  
  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[#8a8273]">
        <svg className="w-12 h-12 mb-4 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-center">Нет доступных профилей</p>
        <p className="text-sm text-[#555] mt-1">Попросите ГМа создать профиль</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-6 py-8 px-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[#b8860b] mb-2">Выберите персонажа</h2>
        <p className="text-sm text-[#8a8273]">Выберите своего персонажа для игры</p>
      </div>
      
      <Select
        value={selectedProfileId}
        onChange={(e) => setSelectedProfileId(e.target.value)}
        options={profiles.map(p => ({ value: p.id, label: p.name }))}
        placeholder="Выберите персонажа..."
      />
      
      <Button
        variant="gold"
        size="lg"
        onClick={handleSelect}
        disabled={!selectedProfileId}
        className="w-full"
      >
        Подтвердить выбор
      </Button>
    </div>
  );
}
