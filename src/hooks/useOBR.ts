// === HOOK: OBR SDK ===

import { useState, useEffect } from 'react';
import OBR, { Player } from '@owlbear-rodeo/sdk';

interface OBRState {
  ready: boolean;
  playerId: string | null;
  playerName: string | null;
  playerColor: string | null;
  sceneReady: boolean;
}

export function useOBR() {
  const [state, setState] = useState<OBRState>({
    ready: false,
    playerId: null,
    playerName: null,
    playerColor: null,
    sceneReady: false,
  });

  useEffect(() => {
    let unsubscribePlayer: (() => void) | null = null;
    let unsubscribeScene: (() => void) | null = null;

    OBR.onReady(async () => {
      // Получаем информацию о игроке
      const playerId = OBR.player.id;
      const playerName = await OBR.player.getName();
      const playerColor = await OBR.player.getColor();
      const sceneReady = await OBR.scene.isReady();

      setState({
        ready: true,
        playerId,
        playerName,
        playerColor,
        sceneReady,
      });

      // Подписываемся на изменения игрока
      unsubscribePlayer = OBR.player.onChange((player: Player) => {
        setState(prev => ({
          ...prev,
          playerName: player.name,
          playerColor: player.color,
        }));
      });

      // Подписываемся на изменения готовности сцены
      unsubscribeScene = OBR.scene.onReadyChange((ready: boolean) => {
        setState(prev => ({
          ...prev,
          sceneReady: ready,
        }));
      });
    });

    return () => {
      if (unsubscribePlayer) unsubscribePlayer();
      if (unsubscribeScene) unsubscribeScene();
    };
  }, []);

  return state;
}
