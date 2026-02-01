// === ОБНОВЛЕНИЕ HP BAR (HP Tracker от bitperfect-software) ===

import OBR, { isShape, isText, Item } from '@owlbear-rodeo/sdk';

const HP_TRACKER_KEY = 'com.bitperfect-software.hp-tracker/data';
const HP_BAR_MAX_WIDTH = 146; // Максимальная ширина бара в пикселях

interface HPTrackerData {
  health: number;
  maxHealth: number;
  tempHealth?: number;
  armorClass?: number;
  segments?: number;
}

/**
 * Обновляет HP bar на карте для указанного токена
 */
export async function updateHealthBar(
  tokenId: string, 
  currentHp: number, 
  maxHp: number, 
  tempHp: number = 0
): Promise<void> {
  try {
    // Получаем токен
    const items = await OBR.scene.items.getItems([tokenId]);
    if (items.length === 0) {
      console.warn(`Token ${tokenId} not found`);
      return;
    }
    
    const _token = items[0];
    void _token; // Для будущего использования
    
    // Обновляем метаданные HP Tracker
    await OBR.scene.items.updateItems([tokenId], (items) => {
      for (const item of items) {
        const metadata = item.metadata || {};
        const hpData: HPTrackerData = {
          health: currentHp,
          maxHealth: maxHp,
          tempHealth: tempHp,
          ...(metadata[HP_TRACKER_KEY] as object || {})
        };
        
        item.metadata = {
          ...metadata,
          [HP_TRACKER_KEY]: hpData
        };
      }
    });
    
    // Ищем attachments (hp bar и hp text)
    const attachments = await OBR.scene.items.getItemAttachments([tokenId]);
    
    const hpBarAttachment = attachments.find(
      (att: Item) => att.name === 'hp' && isShape(att)
    );
    
    const hpTextAttachment = attachments.find(
      (att: Item) => att.name === 'hp-text' && isText(att)
    );
    
    const attachmentIds: string[] = [];
    if (hpBarAttachment) attachmentIds.push(hpBarAttachment.id);
    if (hpTextAttachment) attachmentIds.push(hpTextAttachment.id);
    
    if (attachmentIds.length > 0) {
      await OBR.scene.items.updateItems(attachmentIds, (items) => {
        for (const item of items) {
          if (item.name === 'hp' && isShape(item)) {
            // Обновляем ширину бара пропорционально HP
            const hpPercent = maxHp > 0 ? Math.max(0, Math.min(1, currentHp / maxHp)) : 0;
            const newWidth = Math.round(HP_BAR_MAX_WIDTH * hpPercent);
            item.width = Math.max(1, newWidth); // Минимум 1px чтобы бар был виден
          }
          
          if (item.name === 'hp-text' && isText(item)) {
            // Обновляем текст HP
            const displayHp = tempHp > 0 ? `${currentHp}+${tempHp}` : `${currentHp}`;
            item.text.plainText = `${displayHp}/${maxHp}`;
          }
        }
      });
    }
    
    console.log(`HP bar updated for token ${tokenId}: ${currentHp}/${maxHp}`);
  } catch (error) {
    console.error('Error updating health bar:', error);
  }
}

/**
 * Получает текущие HP из метаданных токена
 */
export async function getTokenHealth(tokenId: string): Promise<HPTrackerData | null> {
  try {
    const items = await OBR.scene.items.getItems([tokenId]);
    if (items.length === 0) return null;
    
    const token = items[0];
    const metadata = token.metadata || {};
    const hpData = metadata[HP_TRACKER_KEY] as HPTrackerData | undefined;
    
    return hpData || null;
  } catch (error) {
    console.error('Error getting token health:', error);
    return null;
  }
}
