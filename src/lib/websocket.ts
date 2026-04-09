/**
 * WebSocket Service for Real-time Chat
 */

import { WebSocketMessage, TypingStatus } from '@/types/chat';

type MessageHandler = (message: WebSocketMessage) => void;
type ConnectionHandler = () => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/^http/, 'ws');
  private userId: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectHandlers: Set<ConnectionHandler> = new Set();
  private disconnectHandlers: Set<ConnectionHandler> = new Set();
  private isIntentionalClose: boolean = false;

  connect(userId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.userId = userId;
    this.isIntentionalClose = false;

    try {
      this.ws = new WebSocket(`${this.url}?userId=${userId}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.connectHandlers.forEach(handler => handler());
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.messageHandlers.forEach(handler => handler(message));
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = () => {
        // WebSocket Event objects have no serializable detail — log a plain string instead
        console.warn('[WebSocket] Connection error — will retry if not intentional close');
      };

      this.ws.onclose = () => {
        this.disconnectHandlers.forEach(handler => handler());

        if (!this.isIntentionalClose && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          // Exponential backoff: 3s, 6s, 12s, 24s, 48s
          const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
          setTimeout(() => {
            if (this.userId) {
              this.connect(this.userId);
            }
          }, delay);
        }
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  disconnect(): void {
    this.isIntentionalClose = true;
    this.userId = null;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  }

  sendMessage(conversationId: string, content: string): void {
    this.send({
      type: 'message',
      data: { conversationId, content },
    });
  }

  sendTyping(conversationId: string, isTyping: boolean): void {
    this.send({
      type: 'typing',
      data: { conversationId, isTyping },
    });
  }

  markMessageSeen(messageId: string, conversationId: string): void {
    this.send({
      type: 'seen',
      data: { messageId, conversationId },
    });
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.connectHandlers.add(handler);
    return () => this.connectHandlers.delete(handler);
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectHandlers.add(handler);
    return () => this.disconnectHandlers.delete(handler);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();
