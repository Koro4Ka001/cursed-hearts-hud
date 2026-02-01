// === HOOK: SELECTED TOKENS ===

import { useState, useEffect } from 'react';
import OBR, { Item, isImage } from '@owlbear-rodeo/sdk';

export interface SelectedTokenInfo {
  id: string;
  name: string;
  imageUrl?: string;
}

export function useSelectedTokens(): SelectedTokenInfo[] {
  const [tokens, setTokens] = useState<SelectedTokenInfo[]>([]);

  useEffect(() => {
    let unsubscribeSelection: (() => void) | null = null;
    let unsubscribeItems: (() => void) | null = null;

    const updateTokens = async (selectedIds: string[]) => {
      if (selectedIds.length === 0) {
        setTokens([]);
        return;
      }

      try {
        const items = await OBR.scene.items.getItems(selectedIds);
        const tokenInfos: SelectedTokenInfo[] = items
          .filter((item: Item) => isImage(item))
          .map((item: Item) => ({
            id: item.id,
            name: item.name || 'Без имени',
            imageUrl: isImage(item) ? item.image.url : undefined,
          }));
        
        setTokens(tokenInfos);
      } catch (error) {
        console.error('Error fetching selected tokens:', error);
        setTokens([]);
      }
    };

    OBR.onReady(async () => {
      // Получаем текущее выделение
      const selection = await OBR.player.getSelection();
      await updateTokens(selection || []);

      // Подписываемся на изменения выделения
      unsubscribeSelection = OBR.player.onChange(async (player) => {
        await updateTokens(player.selection || []);
      });

      // Подписываемся на изменения items (для обновления имён)
      unsubscribeItems = OBR.scene.items.onChange(async () => {
        const currentSelection = await OBR.player.getSelection();
        if (currentSelection && currentSelection.length > 0) {
          await updateTokens(currentSelection);
        }
      });
    });

    return () => {
      if (unsubscribeSelection) unsubscribeSelection();
      if (unsubscribeItems) unsubscribeItems();
    };
  }, []);

  return tokens;
}
