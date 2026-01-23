import { type RefObject, useCallback } from 'react';
import { type ChatMapSectionRef } from '../ChatMapSection';
import { type ActionDispatchPayload } from '../actions/commandTypes';

export function useActionDispatcher(
  mapSectionRef: RefObject<ChatMapSectionRef | null>,
  setIsMapOpen: (isOpen: boolean) => void,
) {
  const dispatch = useCallback(
    (payload: ActionDispatchPayload) => {
      if (payload.openMapPanel) {
        setIsMapOpen(true);
      }

      // 상권 코드가 있으면 해당 상권 정보 fetch 요청
      if (payload.areaCodeToFetch && mapSectionRef.current) {
        // fetchArea 커맨드로 전달 (ChatMapSection에서 처리)
        mapSectionRef.current.executeCommand({
          type: 'map.fetchArea',
          payload: { areaCode: payload.areaCodeToFetch },
        });
        return;
      }

      if (!payload.mapCommands || payload.mapCommands.length === 0) {
        return;
      }

      if (!mapSectionRef.current) {
        console.warn('[useActionDispatcher] Map section is not ready.');
        return;
      }

      payload.mapCommands.forEach((command) => {
        try {
          mapSectionRef.current?.executeCommand(command);
        } catch (error) {
          console.error(`Error handling map command ${command.type}:`, error);
        }
      });
    },
    [mapSectionRef, setIsMapOpen],
  );

  return { dispatch };
}
