// === GOOGLE APPS SCRIPT ДЛЯ CURSED HEARTS HUD ===
// Добавьте этот код в ваш существующий скрипт

// ID таблицы с данными (замените на свой)
const SPREADSHEET_ID = 'ВАШ_ID_ТАБЛИЦЫ';

// Названия листов
const PROFILES_SHEET = 'Профили';
const MONSTERS_SHEET = 'Монстры';

// === ОБРАБОТЧИКИ ЗАПРОСОВ ===

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    let data;
    
    if (e.postData) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }
    
    const action = data.action;
    let result;
    
    switch (action) {
      case 'getProfiles':
        result = getProfiles();
        break;
      case 'getStats':
        result = getStats(data.profileId);
        break;
      case 'takeDamage':
        result = takeDamage(data.profileId, data.amount, data.damageType);
        break;
      case 'heal':
        result = heal(data.profileId, data.amount);
        break;
      case 'spendMana':
        result = spendMana(data.profileId, data.amount);
        break;
      case 'restoreMana':
        result = restoreMana(data.profileId, data.amount);
        break;
      case 'castSpell':
        result = castSpell(data.profileId, data.spellIndex);
        break;
      case 'spendResource':
        result = spendResource(data.profileId, data.amount);
        break;
      case 'resetResource':
        result = resetResource(data.profileId);
        break;
      case 'addCurrency':
        result = addCurrency(data.profileId, data.gold, data.silver, data.copper);
        break;
      case 'spendCurrency':
        result = spendCurrency(data.profileId, data.gold, data.silver, data.copper);
        break;
      case 'longRest':
        result = longRest(data.profileId);
        break;
      case 'getMonsterStats':
        result = getMonsterStats(data.monsterId);
        break;
      case 'dealDamageToMonster':
        result = dealDamageToMonster(data.monsterId, data.amount, data.damageType);
        break;
      case 'updateArmor':
        result = updateArmor(data.profileId, data.physical, data.magical);
        break;
      default:
        result = { success: false, error: 'Неизвестное действие: ' + action };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// === ПОЛУЧЕНИЕ ПРОФИЛЕЙ ===

function getProfiles() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(PROFILES_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const profiles = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Пропускаем пустые строки
    
    profiles.push(parseProfileRow(headers, row));
  }
  
  return { success: true, data: profiles };
}

function getStats(profileId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(PROFILES_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === profileId) {
      return { success: true, data: parseProfileRow(headers, row) };
    }
  }
  
  return { success: false, error: 'Профиль не найден' };
}

function parseProfileRow(headers, row) {
  const getCol = (name) => headers.indexOf(name);
  
  // Парсим заклинания (формат: "Название:Стоимость:Описание;...")
  const spellsStr = row[getCol('Заклинания')] || '';
  const spells = spellsStr.split(';').filter(s => s).map(s => {
    const parts = s.split(':');
    return {
      name: parts[0] || '',
      manaCost: parseInt(parts[1]) || 0,
      description: parts[2] || ''
    };
  });
  
  // Парсим сопротивления (формат: "Тип:Значение;...")
  const resistancesStr = row[getCol('Сопротивления')] || '';
  const resistances = resistancesStr.split(';').filter(r => r).map(r => {
    const parts = r.split(':');
    return {
      type: parts[0] || '',
      value: parseInt(parts[1]) || 0
    };
  });
  
  return {
    id: row[getCol('ID')] || '',
    name: row[getCol('Имя')] || '',
    tokenId: row[getCol('TokenID')] || '',
    
    currentHp: parseInt(row[getCol('HP')]) || 0,
    maxHp: parseInt(row[getCol('MaxHP')]) || 0,
    tempHp: parseInt(row[getCol('TempHP')]) || 0,
    
    currentMana: parseInt(row[getCol('Мана')]) || 0,
    maxMana: parseInt(row[getCol('MaxМана')]) || 0,
    
    resourceName: row[getCol('ИмяРесурса')] || 'Ресурс',
    currentResource: parseInt(row[getCol('Ресурс')]) || 0,
    maxResource: parseInt(row[getCol('MaxРесурс')]) || 0,
    
    armor: {
      physical: parseInt(row[getCol('ФизБроня')]) || 0,
      magical: parseInt(row[getCol('МагБроня')]) || 0
    },
    
    resistances: resistances,
    spells: spells,
    
    gold: parseInt(row[getCol('Золото')]) || 0,
    silver: parseInt(row[getCol('Серебро')]) || 0,
    copper: parseInt(row[getCol('Медь')]) || 0
  };
}

// === УРОН И ЛЕЧЕНИЕ ===

function takeDamage(profileId, amount, damageType) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(PROFILES_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const getCol = (name) => headers.indexOf(name) + 1; // +1 для sheet.getRange
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] !== profileId) continue;
    
    const profile = parseProfileRow(headers, row);
    const result = calculateDamage(amount, damageType, profile);
    
    // Обновляем HP
    sheet.getRange(i + 1, getCol('HP')).setValue(result.newHp);
    
    // Обновляем TempHP если использовались
    if (profile.tempHp > 0) {
      const newTempHp = Math.max(0, profile.tempHp - Math.max(0, amount - result.absorbed - result.resisted));
      sheet.getRange(i + 1, getCol('TempHP')).setValue(newTempHp);
    }
    
    return { success: true, data: result };
  }
  
  return { success: false, error: 'Профиль не найден' };
}

function calculateDamage(amount, damageType, profile) {
  let damage = amount;
  let absorbed = 0;
  let resisted = 0;
  
  // Чистый урон игнорирует всё
  if (damageType !== 'pure') {
    // Физические типы урона
    const physicalTypes = ['slashing', 'piercing', 'bludgeoning', 'chopping'];
    
    // Применяем броню
    if (physicalTypes.includes(damageType)) {
      absorbed = Math.min(damage, profile.armor.physical);
      damage = Math.max(0, damage - profile.armor.physical);
    } else {
      absorbed = Math.min(damage, profile.armor.magical);
      damage = Math.max(0, damage - profile.armor.magical);
    }
    
    // Применяем сопротивления
    const resistance = profile.resistances.find(r => r.type === damageType);
    if (resistance && damage > 0) {
      const multiplier = 1 - (resistance.value / 100);
      const newDamage = Math.round(damage * multiplier);
      resisted = damage - newDamage;
      damage = Math.max(0, newDamage);
    }
  }
  
  // Снимаем временные HP
  let remainingDamage = damage;
  if (profile.tempHp > 0) {
    if (profile.tempHp >= remainingDamage) {
      remainingDamage = 0;
    } else {
      remainingDamage -= profile.tempHp;
    }
  }
  
  const newHp = Math.max(0, profile.currentHp - remainingDamage);
  const overkill = Math.max(0, remainingDamage - profile.currentHp);
  
  return {
    finalDamage: damage,
    absorbed: absorbed,
    resisted: resisted,
    newHp: newHp,
    overkill: overkill
  };
}

function heal(profileId, amount) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(PROFILES_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const hpCol = headers.indexOf('HP') + 1;
  const maxHpCol = headers.indexOf('MaxHP');
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] !== profileId) continue;
    
    const currentHp = parseInt(row[headers.indexOf('HP')]) || 0;
    const maxHp = parseInt(row[maxHpCol]) || 0;
    const newHp = Math.min(maxHp, currentHp + amount);
    
    sheet.getRange(i + 1, hpCol).setValue(newHp);
    
    return { success: true, data: { newHp: newHp } };
  }
  
  return { success: false, error: 'Профиль не найден' };
}

// === МАНА ===

function spendMana(profileId, amount) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(PROFILES_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const manaCol = headers.indexOf('Мана') + 1;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] !== profileId) continue;
    
    const currentMana = parseInt(row[headers.indexOf('Мана')]) || 0;
    if (currentMana < amount) {
      return { success: false, error: 'Недостаточно маны' };
    }
    
    const newMana = currentMana - amount;
    sheet.getRange(i + 1, manaCol).setValue(newMana);
    
    return { success: true, data: { newMana: newMana } };
  }
  
  return { success: false, error: 'Профиль не найден' };
}

function restoreMana(profileId, amount) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(PROFILES_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const manaCol = headers.indexOf('Мана') + 1;
  const maxManaCol = headers.indexOf('MaxМана');
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] !== profileId) continue;
    
    const currentMana = parseInt(row[headers.indexOf('Мана')]) || 0;
    const maxMana = parseInt(row[maxManaCol]) || 0;
    const newMana = Math.min(maxMana, currentMana + amount);
    
    sheet.getRange(i + 1, manaCol).setValue(newMana);
    
    return { success: true, data: { newMana: newMana } };
  }
  
  return { success: false, error: 'Профиль не найден' };
}

// === ЗАКЛИНАНИЯ ===

function castSpell(profileId, spellIndex) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(PROFILES_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] !== profileId) continue;
    
    const profile = parseProfileRow(headers, row);
    const spell = profile.spells[spellIndex];
    
    if (!spell) {
      return { success: false, error: 'Заклинание не найдено' };
    }
    
    if (profile.currentMana < spell.manaCost) {
      return { success: false, error: 'Недостаточно маны' };
    }
    
    const manaCol = headers.indexOf('Мана') + 1;
    const newMana = profile.currentMana - spell.manaCost;
    sheet.getRange(i + 1, manaCol).setValue(newMana);
    
    return { 
      success: true, 
      data: { 
        newMana: newMana, 
        spell: spell.name 
      } 
    };
  }
  
  return { success: false, error: 'Профиль не найден' };
}

// === РЕСУРС ===

function spendResource(profileId, amount) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(PROFILES_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const resourceCol = headers.indexOf('Ресурс') + 1;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] !== profileId) continue;
    
    const currentResource = parseInt(row[headers.indexOf('Ресурс')]) || 0;
    if (currentResource < amount) {
      return { success: false, error: 'Недостаточно ресурса' };
    }
    
    const newResource = currentResource - amount;
    sheet.getRange(i + 1, resourceCol).setValue(newResource);
    
    return { success: true, data: { newResource: newResource } };
  }
  
  return { success: false, error: 'Профиль не найден' };
}

function resetResource(profileId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(PROFILES_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const resourceCol = headers.indexOf('Ресурс') + 1;
  const maxResourceCol = headers.indexOf('MaxРесурс');
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] !== profileId) continue;
    
    const maxResource = parseInt(row[maxResourceCol]) || 0;
    sheet.getRange(i + 1, resourceCol).setValue(maxResource);
    
    return { success: true, data: { newResource: maxResource } };
  }
  
  return { success: false, error: 'Профиль не найден' };
}

// === ВАЛЮТА ===

function addCurrency(profileId, gold, silver, copper) {
  return updateCurrency(profileId, gold, silver, copper, true);
}

function spendCurrency(profileId, gold, silver, copper) {
  return updateCurrency(profileId, -gold, -silver, -copper, false);
}

function updateCurrency(profileId, goldDelta, silverDelta, copperDelta, isAdding) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(PROFILES_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const goldCol = headers.indexOf('Золото') + 1;
  const silverCol = headers.indexOf('Серебро') + 1;
  const copperCol = headers.indexOf('Медь') + 1;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] !== profileId) continue;
    
    let currentGold = parseInt(row[headers.indexOf('Золото')]) || 0;
    let currentSilver = parseInt(row[headers.indexOf('Серебро')]) || 0;
    let currentCopper = parseInt(row[headers.indexOf('Медь')]) || 0;
    
    let newGold = currentGold + goldDelta;
    let newSilver = currentSilver + silverDelta;
    let newCopper = currentCopper + copperDelta;
    
    // Конвертация при необходимости
    if (!isAdding) {
      // При трате - конвертируем вверх если не хватает
      while (newCopper < 0 && newSilver > 0) {
        newSilver--;
        newCopper += 100;
      }
      while (newSilver < 0 && newGold > 0) {
        newGold--;
        newSilver += 100;
      }
      while (newCopper < 0 && newGold > 0) {
        newGold--;
        newCopper += 10000;
      }
      
      if (newGold < 0 || newSilver < 0 || newCopper < 0) {
        return { success: false, error: 'Недостаточно монет' };
      }
    }
    
    sheet.getRange(i + 1, goldCol).setValue(newGold);
    sheet.getRange(i + 1, silverCol).setValue(newSilver);
    sheet.getRange(i + 1, copperCol).setValue(newCopper);
    
    return { 
      success: true, 
      data: { 
        gold: newGold, 
        silver: newSilver, 
        copper: newCopper 
      } 
    };
  }
  
  return { success: false, error: 'Профиль не найден' };
}

// === ДОЛГИЙ ОТДЫХ ===
// Восстанавливает ТОЛЬКО HP и Mana, НЕ ресурс!

function longRest(profileId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(PROFILES_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const hpCol = headers.indexOf('HP') + 1;
  const manaCol = headers.indexOf('Мана') + 1;
  const maxHpCol = headers.indexOf('MaxHP');
  const maxManaCol = headers.indexOf('MaxМана');
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] !== profileId) continue;
    
    const maxHp = parseInt(row[maxHpCol]) || 0;
    const maxMana = parseInt(row[maxManaCol]) || 0;
    
    sheet.getRange(i + 1, hpCol).setValue(maxHp);
    sheet.getRange(i + 1, manaCol).setValue(maxMana);
    // РЕСУРС НЕ ВОССТАНАВЛИВАЕМ!
    
    return { 
      success: true, 
      data: { 
        hp: maxHp, 
        mana: maxMana 
      } 
    };
  }
  
  return { success: false, error: 'Профиль не найден' };
}

// === МОНСТРЫ ===

function getMonsterStats(monsterId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(MONSTERS_SHEET);
  if (!sheet) {
    return { success: false, error: 'Лист монстров не найден' };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === monsterId || row[headers.indexOf('TokenID')] === monsterId) {
      return { success: true, data: parseMonsterRow(headers, row) };
    }
  }
  
  // Если монстр не найден, возвращаем базовые статы
  return { 
    success: true, 
    data: {
      id: monsterId,
      name: 'Неизвестный',
      tokenId: monsterId,
      currentHp: 10,
      maxHp: 10,
      armor: { physical: 0, magical: 0 },
      resistances: []
    }
  };
}

function parseMonsterRow(headers, row) {
  const getCol = (name) => headers.indexOf(name);
  
  const resistancesStr = row[getCol('Сопротивления')] || '';
  const resistances = resistancesStr.split(';').filter(r => r).map(r => {
    const parts = r.split(':');
    return {
      type: parts[0] || '',
      value: parseInt(parts[1]) || 0
    };
  });
  
  return {
    id: row[getCol('ID')] || '',
    name: row[getCol('Имя')] || '',
    tokenId: row[getCol('TokenID')] || '',
    currentHp: parseInt(row[getCol('HP')]) || 0,
    maxHp: parseInt(row[getCol('MaxHP')]) || 0,
    armor: {
      physical: parseInt(row[getCol('ФизБроня')]) || 0,
      magical: parseInt(row[getCol('МагБроня')]) || 0
    },
    resistances: resistances
  };
}

function dealDamageToMonster(monsterId, amount, damageType) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(MONSTERS_SHEET);
  if (!sheet) {
    return { success: false, error: 'Лист монстров не найден' };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const hpCol = headers.indexOf('HP') + 1;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] !== monsterId && row[headers.indexOf('TokenID')] !== monsterId) continue;
    
    const monster = parseMonsterRow(headers, row);
    
    // Используем ту же функцию расчёта урона
    const profile = {
      currentHp: monster.currentHp,
      tempHp: 0,
      armor: monster.armor,
      resistances: monster.resistances
    };
    
    const result = calculateDamage(amount, damageType, profile);
    
    sheet.getRange(i + 1, hpCol).setValue(result.newHp);
    
    return { success: true, data: result };
  }
  
  return { success: false, error: 'Монстр не найден' };
}

// === БРОНЯ ===

function updateArmor(profileId, physical, magical) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(PROFILES_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const physCol = headers.indexOf('ФизБроня') + 1;
  const magCol = headers.indexOf('МагБроня') + 1;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] !== profileId) continue;
    
    sheet.getRange(i + 1, physCol).setValue(physical);
    sheet.getRange(i + 1, magCol).setValue(magical);
    
    return { 
      success: true, 
      data: { 
        physical: physical, 
        magical: magical 
      } 
    };
  }
  
  return { success: false, error: 'Профиль не найден' };
}
