// === КАЛЬКУЛЯТОР УРОНА ===

import type { DamageType, Armor, Resistance, DamageResult } from '../types';

// Физические типы урона (применяется физическая броня)
const PHYSICAL_DAMAGE_TYPES: DamageType[] = [
  'slashing', 'piercing', 'bludgeoning', 'chopping'
];

// Магические типы урона (применяется магическая броня)
const MAGICAL_DAMAGE_TYPES: DamageType[] = [
  'fire', 'ice', 'lightning', 'light', 'darkness',
  'nature', 'arcane', 'necromancy', 'blood', 'chaos',
  'order', 'psionics', 'poison', 'sound', 'force'
];

// Чистый урон игнорирует всё
// 'pure' не входит ни в один список

export function isPhysicalDamage(type: DamageType): boolean {
  return PHYSICAL_DAMAGE_TYPES.includes(type);
}

export function isMagicalDamage(type: DamageType): boolean {
  return MAGICAL_DAMAGE_TYPES.includes(type);
}

export function isPureDamage(type: DamageType): boolean {
  return type === 'pure';
}

export interface CalculateDamageParams {
  baseDamage: number;
  damageType: DamageType;
  armor: Armor;
  resistances: Resistance[];
  currentHp: number;
  maxHp: number;
  tempHp: number;
}

export function calculateDamage(params: CalculateDamageParams): DamageResult {
  const { baseDamage, damageType, armor, resistances, currentHp, tempHp } = params;
  
  let damage = baseDamage;
  let absorbed = 0;
  let resisted = 0;
  
  // Чистый урон игнорирует броню и сопротивления
  if (!isPureDamage(damageType)) {
    // 1. Применяем броню
    if (isPhysicalDamage(damageType) && armor.physical > 0) {
      absorbed = Math.min(damage, armor.physical);
      damage = Math.max(0, damage - armor.physical);
    } else if (isMagicalDamage(damageType) && armor.magical > 0) {
      absorbed = Math.min(damage, armor.magical);
      damage = Math.max(0, damage - armor.magical);
    }
    
    // 2. Применяем сопротивления/уязвимости
    const resistance = resistances.find(r => r.type === damageType);
    if (resistance && damage > 0) {
      // Положительное значение = сопротивление (уменьшает урон)
      // Отрицательное значение = уязвимость (увеличивает урон)
      const multiplier = 1 - (resistance.value / 100);
      const newDamage = Math.round(damage * multiplier);
      resisted = damage - newDamage;
      damage = Math.max(0, newDamage);
    }
  }
  
  // 3. Сначала снимаем временные HP
  let remainingDamage = damage;
  let _newTempHp = tempHp;
  
  if (tempHp > 0 && remainingDamage > 0) {
    if (tempHp >= remainingDamage) {
      _newTempHp = tempHp - remainingDamage;
      remainingDamage = 0;
    } else {
      remainingDamage -= tempHp;
      _newTempHp = 0;
    }
  }
  void _newTempHp; // Для будущего использования
  
  // 4. Снимаем основные HP
  const newHp = Math.max(0, currentHp - remainingDamage);
  const overkill = Math.max(0, remainingDamage - currentHp);
  
  return {
    finalDamage: damage,
    absorbed,
    resisted,
    newHp,
    overkill
  };
}

// Расчёт лечения
export function calculateHealing(currentHp: number, maxHp: number, healAmount: number): number {
  return Math.min(maxHp, currentHp + healAmount);
}
