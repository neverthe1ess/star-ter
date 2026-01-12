export interface Source {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  number: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
}

export interface Thread {
  id: string;
  title: string;
  createdAt: Date;
}
