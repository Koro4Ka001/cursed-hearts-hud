// === КОМПОНЕНТ: КАРТОЧКА ТОКЕНА ===

import { useState, useEffect } from 'react';
import { StatBar } from './common';
import { DamagePanel } from './DamagePanel';
import { ArmorEditor } from './ArmorEditor';
import { useBindingsStore } from '@/stores/bindingsStore';
import * as api from '@/api/googleDocsApi';
import type { CharacterProfile, MonsterProfile } from '@/types';

interface TokenCardProps {
  tokenId: string;
  tokenName: string;
  imageUrl?: string;
}

export function TokenCard({ tokenId, tokenName, imageUrl }: TokenCardProps) {
  const { getBindingByTokenId } = useBindingsStore();
  const [profile, setProfile] = useState<CharacterProfile | MonsterProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const binding = getBindingByTokenId(tokenId);
  const isPlayer = !!binding;
  
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        if (binding) {
          // Это игрок
          const response = await api.getStats(binding.profileId);
          if (response.success && response.data) {
            setProfile(response.data);
          }
        } else {
          // Это монстр
          const response = await api.getMonsterStats(tokenId);
          if (response.success && response.data) {
            setProfile(response.data);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [tokenId, binding]);
  
  const handleDamageDealt = (newHp: number) => {
    if (profile) {
      setProfile({ ...profile, currentHp: newHp });
    }
  };
  
  const handleArmorUpdate = (armor: { physical: number; magical: number }) => {
    if (profile && 'armor' in profile) {
      setProfile({ ...profile, armor });
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-[#141414] rounded-xl p-4 border border-[#222]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-[#1a1a1a] rounded animate-pulse mb-2" />
            <div className="h-3 bg-[#1a1a1a] rounded w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }
  
  const currentHp = profile?.currentHp ?? 0;
  const maxHp = profile?.maxHp ?? 1;
  const tempHp = (profile && 'tempHp' in profile) ? profile.tempHp : 0;
  const armor = (profile && 'armor' in profile) ? profile.armor : { physical: 0, magical: 0 };
  
  return (
    <div className="bg-[#141414] rounded-xl border border-[#222] overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[#1a1a1a] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={tokenName}
            className="w-12 h-12 rounded-lg object-cover border border-[#333]"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#d1c7b7] truncate">{tokenName}</span>
            {isPlayer && (
              <span className="text-xs px-2 py-0.5 rounded bg-[#b8860b]/20 text-[#b8860b] border border-[#b8860b]/30">
                Игрок
              </span>
            )}
          </div>
          <StatBar
            current={currentHp}
            max={maxHp}
            temp={tempHp}
            color="hp"
            showNumbers={true}
            className="mt-1"
          />
        </div>
        <div className={`text-[#8a8273] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Expanded content */}
      {isExpanded && profile && (
        <div className="px-3 pb-3 space-y-3 border-t border-[#222]">
          {/* Armor info */}
          <div className="flex items-center justify-between pt-3">
            <div className="flex gap-4">
              <span className="text-sm text-[#8a8273]">
                🛡️ Физ: <span className="text-[#d1c7b7]">{armor.physical}</span>
              </span>
              <span className="text-sm text-[#8a8273]">
                ✨ Маг: <span className="text-[#d1c7b7]">{armor.magical}</span>
              </span>
            </div>
            {isPlayer && binding && (
              <ArmorEditor 
                profileId={binding.profileId} 
                currentArmor={armor}
                onUpdate={handleArmorUpdate}
              />
            )}
          </div>
          
          {/* Damage panel */}
          <DamagePanel
            targetId={isPlayer && binding ? binding.profileId : tokenId}
            targetName={tokenName}
            targetTokenId={tokenId}
            currentHp={currentHp}
            maxHp={maxHp}
            tempHp={tempHp}
            isMonster={!isPlayer}
            onDamageDealt={handleDamageDealt}
          />
        </div>
      )}
    </div>
  );
}
