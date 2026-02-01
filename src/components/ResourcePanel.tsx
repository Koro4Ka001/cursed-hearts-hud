// === КОМПОНЕНТ: ПАНЕЛЬ РЕСУРСА ===

import { useState } from 'react';
import { Button, Input, StatBar, Modal } from './common';
import type { CharacterProfile } from '@/types';
import * as api from '@/api/googleDocsApi';

interface ResourcePanelProps {
  profile: CharacterProfile;
  onUpdate: (updates: Partial<CharacterProfile>) => void;
}

export function ResourcePanel({ profile, onUpdate }: ResourcePanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  
  // Трата ресурса
  const handleSpend = async (amount: number) => {
    if (amount <= 0 || profile.currentResource < amount) return;
    
    setIsLoading(true);
    try {
      const response = await api.spendResource(profile.id, amount);
      if (response.success && response.data) {
        onUpdate({ currentResource: response.data.newResource });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Своё число
  const handleCustomSpend = async () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    await handleSpend(amount);
    setShowCustomModal(false);
    setCustomAmount('');
  };
  
  // Полное восстановление
  const handleReset = async () => {
    setIsLoading(true);
    try {
      const response = await api.resetResource(profile.id);
      if (response.success && response.data) {
        onUpdate({ currentResource: response.data.newResource });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Если ресурса нет, не показываем панель
  if (profile.maxResource <= 0) {
    return null;
  }
  
  return (
    <div className="bg-[#141414] rounded-xl p-4 border border-[#222]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-semibold text-[#d1c7b7]">
          {profile.resourceName || 'Ресурс'}
        </span>
      </div>
      
      <StatBar
        current={profile.currentResource}
        max={profile.maxResource}
        color="resource"
        className="mb-4"
      />
      
      {/* Кнопки управления */}
      <div className="grid grid-cols-4 gap-2">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => handleSpend(1)}
          disabled={isLoading || profile.currentResource < 1}
        >
          -1
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => handleSpend(3)}
          disabled={isLoading || profile.currentResource < 3}
        >
          -3
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => setShowCustomModal(true)}
          disabled={isLoading}
        >
          -X
        </Button>
        <Button 
          variant="gold" 
          size="sm" 
          onClick={handleReset}
          disabled={isLoading || profile.currentResource === profile.maxResource}
        >
          Max
        </Button>
      </div>
      
      <p className="text-xs text-[#666] mt-3 text-center">
        ⚠️ Не восстанавливается долгим отдыхом
      </p>
      
      {/* Custom Amount Modal */}
      <Modal 
        isOpen={showCustomModal} 
        onClose={() => setShowCustomModal(false)} 
        title={`Потратить ${profile.resourceName || 'ресурс'}`}
      >
        <div className="space-y-4">
          <Input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Количество"
            min="1"
            max={profile.currentResource}
          />
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              className="flex-1" 
              onClick={() => setShowCustomModal(false)}
            >
              Отмена
            </Button>
            <Button 
              variant="primary" 
              className="flex-1" 
              onClick={handleCustomSpend}
              disabled={!customAmount || parseInt(customAmount) <= 0 || parseInt(customAmount) > profile.currentResource}
            >
              Потратить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
