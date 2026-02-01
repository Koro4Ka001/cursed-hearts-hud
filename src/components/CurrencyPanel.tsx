// === КОМПОНЕНТ: ПАНЕЛЬ ВАЛЮТЫ ===

import { useState } from 'react';
import { Button, Input, Modal } from './common';
import type { CharacterProfile } from '@/types';
import * as api from '@/api/googleDocsApi';

interface CurrencyPanelProps {
  profile: CharacterProfile;
  onUpdate: (updates: Partial<CharacterProfile>) => void;
}

export function CurrencyPanel({ profile, onUpdate }: CurrencyPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSpending, setIsSpending] = useState(false);
  
  const [gold, setGold] = useState('0');
  const [silver, setSilver] = useState('0');
  const [copper, setCopper] = useState('0');
  
  const resetForm = () => {
    setGold('0');
    setSilver('0');
    setCopper('0');
  };
  
  const handleOpenAdd = () => {
    resetForm();
    setIsSpending(false);
    setShowModal(true);
  };
  
  const handleOpenSpend = () => {
    resetForm();
    setIsSpending(true);
    setShowModal(true);
  };
  
  const handleSubmit = async () => {
    const g = parseInt(gold) || 0;
    const s = parseInt(silver) || 0;
    const c = parseInt(copper) || 0;
    
    if (g === 0 && s === 0 && c === 0) return;
    
    setIsLoading(true);
    try {
      const response = isSpending 
        ? await api.spendCurrency(profile.id, g, s, c)
        : await api.addCurrency(profile.id, g, s, c);
        
      if (response.success && response.data) {
        onUpdate({
          gold: response.data.gold,
          silver: response.data.silver,
          copper: response.data.copper,
        });
      }
    } finally {
      setIsLoading(false);
      setShowModal(false);
      resetForm();
    }
  };
  
  return (
    <div className="bg-[#141414] rounded-xl p-4 border border-[#222]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-[#d1c7b7]">Кошелёк</h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={handleOpenAdd}>+</Button>
          <Button variant="ghost" size="sm" onClick={handleOpenSpend}>−</Button>
        </div>
      </div>
      
      {/* Currency display */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#ffd700]">{profile.gold}</div>
          <div className="text-xs text-[#8a8273]">🪙 Золото</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#c0c0c0]">{profile.silver}</div>
          <div className="text-xs text-[#8a8273]">🥈 Серебро</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#b87333]">{profile.copper}</div>
          <div className="text-xs text-[#8a8273]">🥉 Медь</div>
        </div>
      </div>
      
      {/* Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={isSpending ? 'Потратить монеты' : 'Добавить монеты'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Золото"
              type="number"
              value={gold}
              onChange={(e) => setGold(e.target.value)}
              min="0"
            />
            <Input
              label="Серебро"
              type="number"
              value={silver}
              onChange={(e) => setSilver(e.target.value)}
              min="0"
            />
            <Input
              label="Медь"
              type="number"
              value={copper}
              onChange={(e) => setCopper(e.target.value)}
              min="0"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              className="flex-1" 
              onClick={() => setShowModal(false)}
            >
              Отмена
            </Button>
            <Button 
              variant={isSpending ? 'danger' : 'gold'} 
              className="flex-1" 
              onClick={handleSubmit}
              isLoading={isLoading}
            >
              {isSpending ? 'Потратить' : 'Добавить'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
