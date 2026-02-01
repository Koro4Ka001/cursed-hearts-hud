// === КОМПОНЕНТ: ВИД ГМ ===

import { useEffect } from 'react';
import { TokenCard } from './TokenCard';
import { useSelectedTokens } from '@/hooks/useSelectedTokens';
import { useBindingsStore } from '@/stores/bindingsStore';

export function GMView() {
  const selectedTokens = useSelectedTokens();
  const { loadBindings } = useBindingsStore();
  
  // Загружаем привязки при монтировании
  useEffect(() => {
    loadBindings();
  }, [loadBindings]);
  
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#b8860b]">Cursed Hearts</h1>
          <p className="text-sm text-[#8a8273]">Режим Мастера</p>
        </div>
        <div className="text-xs px-2 py-1 rounded bg-red-900/30 text-red-400 border border-red-900/50">
          ГМ
        </div>
      </div>
      
      {/* Instructions */}
      {selectedTokens.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-[#333]">
            <svg className="w-8 h-8 text-[#8a8273]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#d1c7b7] mb-2">Выберите токены</h2>
          <p className="text-sm text-[#8a8273] max-w-[250px]">
            Выделите один или несколько токенов на карте, чтобы управлять их характеристиками
          </p>
        </div>
      )}
      
      {/* Token Cards */}
      {selectedTokens.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-[#8a8273]">
            Выбрано токенов: <span className="text-[#b8860b] font-medium">{selectedTokens.length}</span>
          </div>
          
          {selectedTokens.map(token => (
            <TokenCard
              key={token.id}
              tokenId={token.id}
              tokenName={token.name}
              imageUrl={token.imageUrl}
            />
          ))}
        </div>
      )}
      
      {/* Quick actions */}
      {selectedTokens.length > 0 && (
        <div className="pt-4 border-t border-[#222]">
          <h3 className="text-sm font-medium text-[#8a8273] mb-2">Подсказки</h3>
          <ul className="text-xs text-[#666] space-y-1">
            <li>• Нажмите на токен для раскрытия панели урона</li>
            <li>• HP bar на карте обновляется автоматически</li>
            <li>• Чистый урон игнорирует броню и сопротивления</li>
          </ul>
        </div>
      )}
    </div>
  );
}
