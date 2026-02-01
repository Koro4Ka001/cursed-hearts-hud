// === HOOK: IS GM ===

import { useState, useEffect } from 'react';
import OBR from '@owlbear-rodeo/sdk';

export function useIsGM(): boolean {
  const [isGM, setIsGM] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    OBR.onReady(async () => {
      // Проверяем роль игрока
      const role = await OBR.player.getRole();
      setIsGM(role === 'GM');

      // Подписываемся на изменения (на случай если роль изменится)
      unsubscribe = OBR.player.onChange((player) => {
        setIsGM(player.role === 'GM');
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return isGM;
}
