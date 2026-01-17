import { Injectable } from '@nestjs/common';
import { ResponseInputItem } from 'openai/resources/responses/responses.js';
import { OpenAiService } from './openai/openai.service';
import { PlannerContext, ToolCall, ToolPlanner } from '../core/ai-types';

@Injectable()
export class OpenAiToolPlanner implements ToolPlanner {
  constructor(private readonly openAiService: OpenAiService) {}

  async planTools(ctx: PlannerContext): Promise<ToolCall[]> {
    const input: ResponseInputItem[] = ctx.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const response = await this.openAiService.toolCallAi(
      input,
      ctx.categories,
      ctx.areas,
    );

    const toolCalls: ToolCall[] = [];
    if (response.output) {
      for (const item of response.output) {
        if (item.type !== 'function_call') continue;
        const argsJson = item.arguments || '{}';
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(argsJson) as Record<string, unknown>;
        } catch {
          args = {};
        }
        toolCalls.push({
          id: item.call_id,
          name: item.name,
          args,
          argsJson,
        });
      }
    }

    return toolCalls;
  }
}
