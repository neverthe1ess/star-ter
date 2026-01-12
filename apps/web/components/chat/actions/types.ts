import { type AiAction } from '../../../lib/api/ai';
import { type ChatMapSectionRef } from '../ChatMapSection';

export interface ActionContext {
  mapSection: ChatMapSectionRef | null;
  openMapPanel: () => void;
}

export interface ActionHandler {
  canHandle(type: string): boolean;
  handle(action: AiAction, context: ActionContext): Promise<void> | void;
}
