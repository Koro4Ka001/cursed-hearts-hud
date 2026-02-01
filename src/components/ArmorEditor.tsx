// === КОМПОНЕНТ: РЕДАКТОР БРОНИ (ГМ) ===

import { useState } from 'react';
import { Button, Input, Modal } from './common';
import type { Armor } from '@/types';
import * as api from '@/api/googleDocsApi';

interface ArmorEditorProps {
  profileId: string;
  currentArmor: Armor;
  onUpdate: (armor: Armor) => void;
}

export function ArmorEditor({ profileId, currentArmor, onUpdate }: ArmorEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [physical, setPhysical] = useState(currentArmor.physical.toString());
  const [magical, setMagical] = useState(currentArmor.magical.toString());
  const [isLoading, setIsLoading] = useState(false);
  
  const handleOpen = () => {
    setPhysical(currentArmor.physical.toString());
    setMagical(currentArmor.magical.toString());
    setIsOpen(true);
  };
  
  const handleSave = async () => {
    const p = parseInt(physical) || 0;
    const m = parseInt(magical) || 0;
    
    setIsLoading(true);
    try {
      const response = await api.updateArmor(profileId, p, m);
      if (response.success && response.data) {
        onUpdate({
          physical: response.data.physical,
          magical: response.data.magical,
        });
        setIsOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleOpen}>
        🛡️ Редактировать броню
      </Button>
      
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Редактировать броню">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Физическая броня"
              type="number"
              value={physical}
              onChange={(e) => setPhysical(e.target.value)}
              min="0"
            />
            <Input
              label="Магическая броня"
              type="number"
              value={magical}
              onChange={(e) => setMagical(e.target.value)}
              min="0"
            />
          </div>
          
          <div className="text-xs text-[#666] space-y-1">
            <p>• Физическая броня поглощает режущий, колющий, дробящий и рубящий урон</p>
            <p>• Магическая броня поглощает все магические типы урона</p>
            <p>• Чистый урон игнорирует любую броню</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setIsOpen(false)}>
              Отмена
            </Button>
            <Button variant="gold" className="flex-1" onClick={handleSave} isLoading={isLoading}>
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
