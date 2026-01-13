import { useState, useEffect, useCallback } from 'react';
import { sendMessage as apiSendMessage } from '../../../app/actions/chat';
import { type AiAction } from '../../../lib/api/ai';
import { Message, Thread } from '../types';

// userId를 받아서 개인화 추천에 활용
export function useChat(userId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentThread, setCurrentThread] = useState<Thread>({
    id: 'default',
    title: 'New Thread',
    createdAt: new Date(),
  });

  // localStorage에서 대화 내역 불러오기
  useEffect(() => {
    const savedMessages = localStorage.getItem('chat_messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        const restored = parsed.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(restored);
      } catch {
        console.error('Failed to parse saved messages');
      }
    }
  }, []);

  // 메시지 변경 시 localStorage에 저장
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  const handleNewThread = useCallback(() => {
    setMessages([]);
    setInputValue('');
    setCurrentThread({
      id: crypto.randomUUID(),
      title: 'New Thread',
      createdAt: new Date(),
    });
    localStorage.removeItem('chat_messages');
  }, []);

  const sendMessage = useCallback(
    async (text: string, onActions?: (actions: AiAction[]) => void) => {
      if (!text.trim()) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');
      setIsLoading(true);

      if (messages.length === 0) {
        setCurrentThread((prev) => ({
          ...prev,
          title: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
        }));
      }

      try {
        const history = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        // userId를 전달하여 개인화 추천 지원
        const response = await apiSendMessage(text, history, userId);

        const aiMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.reply,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);

        if (response.actions && response.actions.length > 0 && onActions) {
          onActions(response.actions);
        }
      } catch (error) {
        console.error('Failed to get AI response:', error);
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            '죄송합니다. 오류가 발생하여 응답을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, userId],
  );

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    currentThread,
    sendMessage,
    handleNewThread,
  };
}
