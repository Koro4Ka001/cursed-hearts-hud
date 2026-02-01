// === ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ ===

import { PlayerView } from '@/components/PlayerView';
import { GMView } from '@/components/GMView';
import { useOBR } from '@/hooks/useOBR';
import { useIsGM } from '@/hooks/useIsGM';

export function App() {
  const { ready, playerId, playerName, sceneReady } = useOBR();
  const isGM = useIsGM();
  
  // Loading state
  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#b8860b] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8a8273]">Подключение к Owlbear Rodeo...</p>
        </div>
      </div>
    );
  }
  
  // Scene not ready
  if (!sceneReady) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mb-4 mx-auto">
            <svg className="w-full h-full text-[#b8860b]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#d1c7b7] mb-2">Ожидание сцены</h2>
          <p className="text-sm text-[#8a8273]">Сцена ещё не загружена. Попросите ГМа открыть карту.</p>
        </div>
      </div>
    );
  }
  
  // Main content
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d1c7b7]">
      {isGM ? (
        <GMView />
      ) : (
        <PlayerView 
          playerId={playerId || ''} 
          playerName={playerName || 'Игрок'} 
        />
      )}
    </div>
  );
}
