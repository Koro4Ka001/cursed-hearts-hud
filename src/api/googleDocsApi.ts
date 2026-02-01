// === GOOGLE DOCS API ===

import { GOOGLE_API_URL, API_TIMEOUT } from './config';
import type { CharacterProfile, MonsterProfile, ApiResponse, DamageType, DamageResult } from '../types';

async function fetchApi<T>(action: string, params: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const response = await fetch(GOOGLE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({ action, ...params }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Превышено время ожидания' };
    }
    return { success: false, error: String(error) };
  }
}

// === ПРОФИЛИ ===

export async function getProfiles(): Promise<ApiResponse<CharacterProfile[]>> {
  return fetchApi<CharacterProfile[]>('getProfiles');
}

export async function getStats(profileId: string): Promise<ApiResponse<CharacterProfile>> {
  return fetchApi<CharacterProfile>('getStats', { profileId });
}

// === УРОН И ЛЕЧЕНИЕ ===

export async function takeDamage(
  profileId: string, 
  amount: number, 
  damageType: DamageType
): Promise<ApiResponse<DamageResult>> {
  return fetchApi<DamageResult>('takeDamage', { profileId, amount, damageType });
}

export async function heal(profileId: string, amount: number): Promise<ApiResponse<{ newHp: number }>> {
  return fetchApi<{ newHp: number }>('heal', { profileId, amount });
}

// === МАНА ===

export async function spendMana(profileId: string, amount: number): Promise<ApiResponse<{ newMana: number }>> {
  return fetchApi<{ newMana: number }>('spendMana', { profileId, amount });
}

export async function restoreMana(profileId: string, amount: number): Promise<ApiResponse<{ newMana: number }>> {
  return fetchApi<{ newMana: number }>('restoreMana', { profileId, amount });
}

// === ЗАКЛИНАНИЯ ===

export async function castSpell(
  profileId: string, 
  spellIndex: number
): Promise<ApiResponse<{ newMana: number; spell: string }>> {
  return fetchApi<{ newMana: number; spell: string }>('castSpell', { profileId, spellIndex });
}

// === РЕСУРС ===

export async function spendResource(profileId: string, amount: number): Promise<ApiResponse<{ newResource: number }>> {
  return fetchApi<{ newResource: number }>('spendResource', { profileId, amount });
}

export async function resetResource(profileId: string): Promise<ApiResponse<{ newResource: number }>> {
  return fetchApi<{ newResource: number }>('resetResource', { profileId });
}

// === ВАЛЮТА ===

export async function addCurrency(
  profileId: string, 
  gold: number, 
  silver: number, 
  copper: number
): Promise<ApiResponse<{ gold: number; silver: number; copper: number }>> {
  return fetchApi<{ gold: number; silver: number; copper: number }>('addCurrency', { 
    profileId, gold, silver, copper 
  });
}

export async function spendCurrency(
  profileId: string, 
  gold: number, 
  silver: number, 
  copper: number
): Promise<ApiResponse<{ gold: number; silver: number; copper: number }>> {
  return fetchApi<{ gold: number; silver: number; copper: number }>('spendCurrency', { 
    profileId, gold, silver, copper 
  });
}

// === ОТДЫХ ===

export async function longRest(profileId: string): Promise<ApiResponse<{ hp: number; mana: number }>> {
  // Долгий отдых восстанавливает ТОЛЬКО HP и Mana, НЕ ресурс
  return fetchApi<{ hp: number; mana: number }>('longRest', { profileId });
}

// === МОНСТРЫ ===

export async function getMonsterStats(monsterId: string): Promise<ApiResponse<MonsterProfile>> {
  return fetchApi<MonsterProfile>('getMonsterStats', { monsterId });
}

export async function dealDamageToMonster(
  monsterId: string,
  amount: number,
  damageType: DamageType
): Promise<ApiResponse<DamageResult>> {
  return fetchApi<DamageResult>('dealDamageToMonster', { monsterId, amount, damageType });
}

// === БРОНЯ ===

export async function updateArmor(
  profileId: string,
  physical: number,
  magical: number
): Promise<ApiResponse<{ physical: number; magical: number }>> {
  return fetchApi<{ physical: number; magical: number }>('updateArmor', { 
    profileId, physical, magical 
  });
}
