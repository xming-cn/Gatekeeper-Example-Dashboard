import axios from 'axios';

// Get server address from localStorage or use default
export const getServerAddress = (): string => {
  if (typeof window === 'undefined') return '127.0.0.1:8080';
  return localStorage.getItem('serverAddress') || '127.0.0.1:8080';
};

export const setServerAddress = (address: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('serverAddress', address);
};

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

// Create a new axios instance for each request with the current server address
const getApi = () => axios.create({
  baseURL: `https://${getServerAddress()}`
});

export const login = async (username: string, password: string): Promise<string> => {
  const response = await getApi().post<LoginResponse>('/auth/login', {
    username,
    password,
  });
  return response.data.token;
};

export const executeCommand = async (token: string, command: string): Promise<CommandResponse> => {
  const response = await getApi().post<CommandResponse>(
    '/api/gatekeeper/execute-command',
    { command },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

export const listPlayers = async (token: string): Promise<PlayersResponse> => {
  const response = await getApi().get<PlayersResponse>(
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
  const response = await getApi().get<HealthResponse>(
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
  const response = await getApi().get<PlayerDetails>(
    `/api/gatekeeper/player/${playerId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

export const kickPlayer = async (token: string, playerId: string, reason: string): Promise<CommandResponse> => {
  const response = await getApi().post<CommandResponse>(
    `/api/gatekeeper/player/${playerId}/kick`,
    { reason },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

export const sendPrivateMessage = async (token: string, playerId: string, message: string): Promise<CommandResponse> => {
  const response = await getApi().post<CommandResponse>(
    `/api/gatekeeper/player/${playerId}/message`,
    { message },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
