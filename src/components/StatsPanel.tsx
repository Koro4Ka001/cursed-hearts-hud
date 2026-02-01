// === КОМПОНЕНТ: ПАНЕЛЬ СТАТОВ ===

import { useState } from 'react';
import { Button, Input, StatBar, Modal } from './common';
import type { CharacterProfile } from '@/types';
import * as api from '@/api/googleDocsApi';
import { updateHealthBar } from '@/utils/updateHealthBar';

interface StatsPanelProps {
  profile: CharacterProfile;
  onUpdate: (updates: Partial<CharacterProfile>) => void;
  isGM?: boolean;
}

export function StatsPanel({ profile, onUpdate, isGM = false }: StatsPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showHealModal, setShowHealModal] = useState(false);
  const [showManaModal, setShowManaModal] = useState(false);
  const [healAmount, setHealAmount] = useState('');
  const [manaAmount, setManaAmount] = useState('');
  
  // Лечение
  const handleHeal = async () => {
    const amount = parseInt(healAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    setIsLoading(true);
    try {
      const response = await api.heal(profile.id, amount);
      if (response.success && response.data) {
        onUpdate({ currentHp: response.data.newHp });
        if (profile.tokenId) {
          await updateHealthBar(profile.tokenId, response.data.newHp, profile.maxHp, profile.tempHp);
        }
      }
    } finally {
      setIsLoading(false);
      setShowHealModal(false);
      setHealAmount('');
    }
  };
  
  // Трата маны
  const handleSpendMana = async (amount: number) => {
    if (amount <= 0 || profile.currentMana < amount) return;
    
    setIsLoading(true);
    try {
      const response = await api.spendMana(profile.id, amount);
      if (response.success && response.data) {
        onUpdate({ currentMana: response.data.newMana });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Восстановление маны
  const handleRestoreMana = async () => {
    const amount = parseInt(manaAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    setIsLoading(true);
    try {
      const response = await api.restoreMana(profile.id, amount);
      if (response.success && response.data) {
        onUpdate({ currentMana: response.data.newMana });
      }
    } finally {
      setIsLoading(false);
      setShowManaModal(false);
      setManaAmount('');
    }
  };
  
  // Долгий отдых
  const handleLongRest = async () => {
    setIsLoading(true);
    try {
      const response = await api.longRest(profile.id);
      if (response.success && response.data) {
        onUpdate({ 
          currentHp: response.data.hp, 
          currentMana: response.data.mana 
        });
        if (profile.tokenId) {
          await updateHealthBar(profile.tokenId, response.data.hp, profile.maxHp, profile.tempHp);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* HP */}
      <div className="bg-[#141414] rounded-xl p-4 border border-[#222]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold text-[#d1c7b7]">Здоровье</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowHealModal(true)}
            disabled={isLoading}
          >
            + Лечение
          </Button>
        </div>
        <StatBar
          current={profile.currentHp}
          max={profile.maxHp}
          temp={profile.tempHp}
          color="hp"
        />
        {profile.tempHp > 0 && (
          <p className="text-xs text-[#666] mt-1">
            Временные HP: +{profile.tempHp}
          </p>
        )}
      </div>
      
      {/* Mana */}
      <div className="bg-[#141414] rounded-xl p-4 border border-[#222]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold text-[#d1c7b7]">Мана</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => handleSpendMana(1)} disabled={isLoading || profile.currentMana < 1}>
              -1
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleSpendMana(5)} disabled={isLoading || profile.currentMana < 5}>
              -5
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowManaModal(true)} disabled={isLoading}>
              +
            </Button>
          </div>
        </div>
        <StatBar
          current={profile.currentMana}
          max={profile.maxMana}
          color="mana"
        />
      </div>
      
      {/* Armor Info */}
      <div className="bg-[#141414] rounded-xl p-4 border border-[#222]">
        <div className="flex items-center gap-4">
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-[#d1c7b7]">{profile.armor.physical}</div>
            <div className="text-xs text-[#8a8273]">Физ. броня</div>
          </div>
          <div className="w-px h-10 bg-[#333]" />
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-[#d1c7b7]">{profile.armor.magical}</div>
            <div className="text-xs text-[#8a8273]">Маг. броня</div>
          </div>
        </div>
      </div>
      
      {/* Long Rest */}
      <Button 
        variant="gold" 
        className="w-full" 
        onClick={handleLongRest}
        disabled={isLoading}
        isLoading={isLoading}
      >
        🌙 Долгий отдых
      </Button>
      {!isGM && (
        <p className="text-xs text-[#666] text-center">
          Восстанавливает HP и Ману. Ресурс НЕ восстанавливается.
        </p>
      )}
      
      {/* Heal Modal */}
      <Modal isOpen={showHealModal} onClose={() => setShowHealModal(false)} title="Лечение">
        <div className="space-y-4">
          <Input
            type="number"
            value={healAmount}
            onChange={(e) => setHealAmount(e.target.value)}
            placeholder="Количество HP"
            min="1"
          />
          <Button 
            variant="primary" 
            className="w-full" 
            onClick={handleHeal}
            disabled={!healAmount || parseInt(healAmount) <= 0}
          >
            Вылечить
          </Button>
        </div>
      </Modal>
      
      {/* Mana Modal */}
      <Modal isOpen={showManaModal} onClose={() => setShowManaModal(false)} title="Восстановление маны">
        <div className="space-y-4">
          <Input
            type="number"
            value={manaAmount}
            onChange={(e) => setManaAmount(e.target.value)}
            placeholder="Количество маны"
            min="1"
          />
          <Button 
            variant="primary" 
            className="w-full" 
            onClick={handleRestoreMana}
            disabled={!manaAmount || parseInt(manaAmount) <= 0}
          >
            Восстановить
          </Button>
        </div>
      </Modal>
    </div>
  );
}
