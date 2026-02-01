// === КОМПОНЕНТ: ВИД ИГРОКА ===

import { useState, useEffect, useCallback } from 'react';
import { ProfileSelector } from './ProfileSelector';
import { StatsPanel } from './StatsPanel';
import { ResourcePanel } from './ResourcePanel';
import { SpellsPanel } from './SpellsPanel';
import { CurrencyPanel } from './CurrencyPanel';
import { useProfileStore } from '@/stores/profileStore';
import { useBindingsStore } from '@/stores/bindingsStore';
import { AUTO_REFRESH_INTERVAL } from '@/api/config';
import type { CharacterProfile } from '@/types';

interface PlayerViewProps {
  playerId: string;
  playerName: string;
}

export function PlayerView({ playerId, playerName }: PlayerViewProps) {
  const { currentProfile, setCurrentProfile, updateCurrentProfile, fetchCurrentProfile } = useProfileStore();
  const { getBindingByPlayerId, loadBindings } = useBindingsStore();
  const [hasSelectedProfile, setHasSelectedProfile] = useState(false);
  
  // Загружаем привязки при монтировании
  useEffect(() => {
    loadBindings();
  }, [loadBindings]);
  
  // Проверяем существующую привязку
  useEffect(() => {
    const binding = getBindingByPlayerId(playerId);
    if (binding) {
      fetchCurrentProfile(binding.profileId);
      setHasSelectedProfile(true);
    }
  }, [playerId, getBindingByPlayerId, fetchCurrentProfile]);
  
  // Автообновление профиля
  useEffect(() => {
    if (!currentProfile) return;
    
    const interval = setInterval(() => {
      fetchCurrentProfile(currentProfile.id);
    }, AUTO_REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, [currentProfile?.id, fetchCurrentProfile]);
  
  const handleProfileSelected = useCallback((profile: CharacterProfile) => {
    setCurrentProfile(profile);
    setHasSelectedProfile(true);
  }, [setCurrentProfile]);
  
  const handleUpdate = useCallback((updates: Partial<CharacterProfile>) => {
    updateCurrentProfile(updates);
  }, [updateCurrentProfile]);
  
  // Если профиль не выбран, показываем селектор
  if (!hasSelectedProfile || !currentProfile) {
    return (
      <div className="p-4">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-[#b8860b]">Cursed Hearts</h1>
          <p className="text-sm text-[#8a8273]">Добро пожаловать, {playerName}</p>
        </div>
        <ProfileSelector playerId={playerId} onProfileSelected={handleProfileSelected} />
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#b8860b]">{currentProfile.name}</h1>
          <p className="text-sm text-[#8a8273]">{playerName}</p>
        </div>
        <button
          onClick={() => {
            setCurrentProfile(null);
            setHasSelectedProfile(false);
          }}
          className="text-[#8a8273] hover:text-[#d1c7b7] transition-colors text-sm"
        >
          Сменить персонажа
        </button>
      </div>
      
      {/* Stats */}
      <StatsPanel profile={currentProfile} onUpdate={handleUpdate} />
      
      {/* Resource */}
      <ResourcePanel profile={currentProfile} onUpdate={handleUpdate} />
      
      {/* Spells */}
      <SpellsPanel profile={currentProfile} onUpdate={handleUpdate} />
      
      {/* Currency */}
      <CurrencyPanel profile={currentProfile} onUpdate={handleUpdate} />
    </div>
  );
}
