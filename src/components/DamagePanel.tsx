// === КОМПОНЕНТ: ПАНЕЛЬ НАНЕСЕНИЯ УРОНА (ГМ) ===

import { useState } from 'react';
import { Button, Input, Select } from './common';
import { DAMAGE_TYPES, DAMAGE_TYPE_NAMES, type DamageType } from '@/types';
import * as api from '@/api/googleDocsApi';
import { updateHealthBar } from '@/utils/updateHealthBar';

interface DamagePanelProps {
  targetId: string;
  targetName: string;
  targetTokenId?: string;
  currentHp: number;
  maxHp: number;
  tempHp?: number;
  isMonster?: boolean;
  onDamageDealt?: (newHp: number) => void;
}

export function DamagePanel({
  targetId,
  targetName,
  targetTokenId,
  currentHp,
  maxHp,
  tempHp = 0,
  isMonster = false,
  onDamageDealt,
}: DamagePanelProps) {
  const [damage, setDamage] = useState('');
  const [damageType, setDamageType] = useState<DamageType>('slashing');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    finalDamage: number;
    absorbed: number;
    resisted: number;
    newHp: number;
  } | null>(null);
  
  const handleDealDamage = async () => {
    const amount = parseInt(damage);
    if (isNaN(amount) || amount <= 0) return;
    
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = isMonster
        ? await api.dealDamageToMonster(targetId, amount, damageType)
        : await api.takeDamage(targetId, amount, damageType);
      
      if (response.success && response.data) {
        setResult(response.data);
        
        // Обновляем HP bar на карте
        if (targetTokenId) {
          await updateHealthBar(targetTokenId, response.data.newHp, maxHp, tempHp);
        }
        
        if (onDamageDealt) {
          onDamageDealt(response.data.newHp);
        }
        
        setDamage('');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const damageOptions = DAMAGE_TYPES.map(type => ({
    value: type,
    label: DAMAGE_TYPE_NAMES[type],
  }));
  
  return (
    <div className="bg-[#141414] rounded-xl p-4 border border-[#222]">
      <h3 className="text-lg font-semibold text-red-400 mb-3">
        ⚔️ Нанести урон: {targetName}
      </h3>
      
      <div className="text-sm text-[#8a8273] mb-3">
        HP: {currentHp}{tempHp > 0 && `+${tempHp}`}/{maxHp}
      </div>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            value={damage}
            onChange={(e) => setDamage(e.target.value)}
            placeholder="Урон"
            min="1"
          />
          <Select
            value={damageType}
            onChange={(e) => setDamageType(e.target.value as DamageType)}
            options={damageOptions}
          />
        </div>
        
        <Button
          variant="danger"
          className="w-full"
          onClick={handleDealDamage}
          disabled={!damage || parseInt(damage) <= 0 || isLoading}
          isLoading={isLoading}
        >
          💀 Нанести урон
        </Button>
        
        {/* Quick damage buttons */}
        <div className="grid grid-cols-5 gap-1">
          {[1, 5, 10, 20, 50].map(val => (
            <Button
              key={val}
              variant="ghost"
              size="sm"
              onClick={() => setDamage(val.toString())}
            >
              {val}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Result */}
      {result && (
        <div className="mt-4 p-3 bg-[#0a0a0a] rounded-lg border border-red-900/50">
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-[#8a8273]">Итоговый урон:</span>
              <span className="text-red-400 font-bold">{result.finalDamage}</span>
            </div>
            {result.absorbed > 0 && (
              <div className="flex justify-between">
                <span className="text-[#8a8273]">Поглощено бронёй:</span>
                <span className="text-[#666]">{result.absorbed}</span>
              </div>
            )}
            {result.resisted > 0 && (
              <div className="flex justify-between">
                <span className="text-[#8a8273]">Сопротивление:</span>
                <span className="text-[#666]">{result.resisted}</span>
              </div>
            )}
            {result.resisted < 0 && (
              <div className="flex justify-between">
                <span className="text-[#8a8273]">Уязвимость:</span>
                <span className="text-orange-400">+{Math.abs(result.resisted)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-[#333]">
              <span className="text-[#8a8273]">Новое HP:</span>
              <span className={result.newHp <= 0 ? 'text-red-500 font-bold' : 'text-[#d1c7b7]'}>
                {result.newHp <= 0 ? '💀 0' : result.newHp}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
