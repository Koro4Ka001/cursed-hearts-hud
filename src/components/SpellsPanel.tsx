// === КОМПОНЕНТ: ПАНЕЛЬ ЗАКЛИНАНИЙ ===

import { useState } from 'react';
import { Button } from './common';
import type { CharacterProfile, Spell } from '@/types';
import * as api from '@/api/googleDocsApi';

interface SpellsPanelProps {
  profile: CharacterProfile;
  onUpdate: (updates: Partial<CharacterProfile>) => void;
}

export function SpellsPanel({ profile, onUpdate }: SpellsPanelProps) {
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [castMessage, setCastMessage] = useState<string | null>(null);
  
  const handleCast = async (spellIndex: number, spell: Spell) => {
    if (profile.currentMana < spell.manaCost) {
      setCastMessage(`Недостаточно маны для ${spell.name}!`);
      setTimeout(() => setCastMessage(null), 3000);
      return;
    }
    
    setIsLoading(spellIndex);
    try {
      const response = await api.castSpell(profile.id, spellIndex);
      if (response.success && response.data) {
        onUpdate({ currentMana: response.data.newMana });
        setCastMessage(`✨ ${spell.name} применено!`);
        setTimeout(() => setCastMessage(null), 3000);
      }
    } finally {
      setIsLoading(null);
    }
  };
  
  if (!profile.spells || profile.spells.length === 0) {
    return (
      <div className="bg-[#141414] rounded-xl p-4 border border-[#222]">
        <h3 className="text-lg font-semibold text-[#d1c7b7] mb-2">Заклинания</h3>
        <p className="text-sm text-[#666] text-center py-4">
          Нет доступных заклинаний
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-[#141414] rounded-xl p-4 border border-[#222]">
      <h3 className="text-lg font-semibold text-[#d1c7b7] mb-3">Заклинания</h3>
      
      {/* Message */}
      {castMessage && (
        <div className={`text-sm text-center py-2 px-3 rounded-lg mb-3 ${
          castMessage.includes('Недостаточно') 
            ? 'bg-red-900/30 text-red-400 border border-red-900' 
            : 'bg-[#b8860b]/20 text-[#b8860b] border border-[#b8860b]/30'
        }`}>
          {castMessage}
        </div>
      )}
      
      {/* Spells list */}
      <div className="space-y-2">
        {profile.spells.map((spell, index) => {
          const canCast = profile.currentMana >= spell.manaCost;
          
          return (
            <div 
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                canCast 
                  ? 'bg-[#1a1a1a] border-[#333] hover:border-[#b8860b]/50' 
                  : 'bg-[#0f0f0f] border-[#222] opacity-60'
              }`}
            >
              <div className="flex-1">
                <div className="font-medium text-[#d1c7b7]">{spell.name}</div>
                {spell.description && (
                  <div className="text-xs text-[#8a8273] mt-0.5">{spell.description}</div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`text-sm ${canCast ? 'text-blue-400' : 'text-red-400'}`}>
                  💧 {spell.manaCost}
                </span>
                <Button
                  variant={canCast ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleCast(index, spell)}
                  disabled={!canCast || isLoading === index}
                  isLoading={isLoading === index}
                >
                  {canCast ? 'Применить' : 'Нет маны'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
