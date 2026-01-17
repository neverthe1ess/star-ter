import { Injectable } from '@nestjs/common';
import { ClaudeService } from './claude/claude.service';
import { CLAUDE_PROMPTS } from '../prompts/claude-prompts';
import { TOOLS } from '../tools/definitions';
import { PlannerContext, ToolCall, ToolPlanner } from '../core/ai-types';
import type Anthropic from '@anthropic-ai/sdk';

interface ClaudeToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

@Injectable()
export class ClaudeToolPlanner implements ToolPlanner {
  constructor(private readonly claudeService: ClaudeService) {}

  async planTools(ctx: PlannerContext): Promise<ToolCall[]> {
    const messages: Anthropic.MessageParam[] = ctx.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const systemPrompt = CLAUDE_PROMPTS.TOOL_CALL_SYSTEM.replace(
      '${categoryVectors}',
      this.claudeService.formatCategoryVectors(ctx.categories),
    ).replace(
      '${areaVectors}',
      this.claudeService.formatAreaVectors(ctx.areas),
    );

    const tools = this.convertToolsForClaude();
    const response = await this.claudeService.toolCall(
      messages,
      systemPrompt,
      tools,
    );

    return response.toolCalls.map((toolCall) => ({
      id: toolCall.id,
      name: toolCall.name,
      args: toolCall.arguments,
      argsJson: JSON.stringify(toolCall.arguments || {}),
    }));
  }

  private convertToolsForClaude(): ClaudeToolDefinition[] {
    return TOOLS.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: {
        type: 'object',
        properties:
          (tool.parameters as { properties?: Record<string, unknown> })
            .properties || {},
        required: (tool.parameters as { required?: string[] }).required || [],
      },
    }));
  }
}
