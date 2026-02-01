// === ТИПЫ ДАННЫХ ===

export type DamageType = 
  | 'slashing' | 'piercing' | 'bludgeoning' | 'chopping'
  | 'fire' | 'ice' | 'lightning' | 'light' | 'darkness'
  | 'nature' | 'arcane' | 'necromancy' | 'blood' | 'chaos'
  | 'order' | 'psionics' | 'poison' | 'sound' | 'force'
  | 'pure';

export const DAMAGE_TYPE_NAMES: Record<DamageType, string> = {
  slashing: 'Режущий',
  piercing: 'Колющий',
  bludgeoning: 'Дробящий',
  chopping: 'Рубящий',
  fire: 'Огонь',
  ice: 'Лёд',
  lightning: 'Молния',
  light: 'Свет',
  darkness: 'Тьма',
  nature: 'Природа',
  arcane: 'Аркана',
  necromancy: 'Некромантия',
  blood: 'Кровь',
  chaos: 'Хаос',
  order: 'Порядок',
  psionics: 'Псионика',
  poison: 'Яд',
  sound: 'Звук',
  force: 'Сила',
  pure: 'Чистый',
};

export const DAMAGE_TYPES: DamageType[] = [
  'slashing', 'piercing', 'bludgeoning', 'chopping',
  'fire', 'ice', 'lightning', 'light', 'darkness',
  'nature', 'arcane', 'necromancy', 'blood', 'chaos',
  'order', 'psionics', 'poison', 'sound', 'force', 'pure'
];

export interface Spell {
  name: string;
  manaCost: number;
  description?: string;
}

export interface Resistance {
  type: DamageType;
  value: number; // процент сопротивления (положительный) или уязвимости (отрицательный)
}

export interface Armor {
  physical: number;
  magical: number;
}

export interface CharacterProfile {
  id: string;
  name: string;
  tokenId?: string;
  
  // HP
  currentHp: number;
  maxHp: number;
  tempHp: number;
  
  // Mana
  currentMana: number;
  maxMana: number;
  
  // Resource (не восстанавливается отдыхом)
  resourceName: string;
  currentResource: number;
  maxResource: number;
  
  // Защита
  armor: Armor;
  resistances: Resistance[];
  
  // Заклинания
  spells: Spell[];
  
  // Валюта
  gold: number;
  silver: number;
  copper: number;
}

export interface MonsterProfile {
  id: string;
  name: string;
  tokenId: string;
  
  currentHp: number;
  maxHp: number;
  
  armor: Armor;
  resistances: Resistance[];
}

export interface TokenBinding {
  playerId: string;
  tokenId: string;
  profileId: string;
}

export interface SelectedToken {
  id: string;
  name: string;
  isPlayer: boolean;
  profile?: CharacterProfile | MonsterProfile;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DamageResult {
  finalDamage: number;
  absorbed: number;
  resisted: number;
  newHp: number;
  overkill: number;
}
