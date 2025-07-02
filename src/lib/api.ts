import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8080';

export interface LoginResponse {
  token: string;
}

export interface PlayerLocation {
  x: number;
  y: number;
  z: number;
  world: string;
}

export interface PlayerDetails {
  id: string;
  name: string;
  isOnline: boolean;
  level: number;
  exp: number;
  gameMode: string;
  isOp: boolean;
  ping: number;
  health: number;
  location: PlayerLocation;
}

export interface Player {
  id: string;
  name: string;
  isOnline: boolean;
}

export interface PlayersResponse {
  players: Player[];
}

export interface CommandResponse {
  success: boolean;
  message: string;
}

export interface HealthResponse {
  uptime: number;
}

const api = axios.create({
  baseURL: BASE_URL,
});

export const login = async (username: string, password: string): Promise<string> => {
  const response = await api.post<LoginResponse>('/auth/login', {
    username,
    password,
  });
  return response.data.token;
};

export const executeCommand = async (token: string, command: string): Promise<CommandResponse> => {
  const response = await api.post<CommandResponse>(
    '/api/gatekeeper/execute-command',
    { command },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

export const listPlayers = async (token: string): Promise<PlayersResponse> => {
  const response = await api.get<PlayersResponse>(
    '/api/gatekeeper/online-players',
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

// Auth token management
export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

export const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
};

export const clearStoredToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
};

export const getServerHealth = async (token: string): Promise<HealthResponse> => {
  const response = await api.get<HealthResponse>(
    '/health',
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

// Helper function to format uptime
export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0) return 'Just started';
  
  return parts.join(' ');
};

export const getPlayerDetails = async (token: string, playerId: string): Promise<PlayerDetails> => {
  const response = await api.get<PlayerDetails>(
    `/api/gatekeeper/player/${playerId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

export const kickPlayer = async (token: string, playerId: string, reason: string): Promise<CommandResponse> => {
  const response = await api.post<CommandResponse>(
    `/api/gatekeeper/player/${playerId}/kick`,
    { reason },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

export const sendPrivateMessage = async (token: string, playerId: string, message: string): Promise<CommandResponse> => {
  const response = await api.post<CommandResponse>(
    `/api/gatekeeper/player/${playerId}/message`,
    { message },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
