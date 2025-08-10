// frontend/src/lib/socket.ts
import { io, type Socket } from 'socket.io-client';

function resolveBaseUrl(): string {
  // Prefer explicit socket URL
  const socketUrl = import.meta.env.VITE_SOCKET_URL as string | undefined;
  if (socketUrl) return socketUrl.replace(/\/$/, '');

  // Derive from API URL if present
  const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5000/api';
  return apiUrl.replace(/\/?api\/?$/, '');
}

const base = resolveBaseUrl();

export function getSocket(namespace: '/chat' | '/video-call' | '/notifications' | string): Socket {
  const url = `${base}${namespace}`;
  const socket = io(url, {
    transports: ['websocket'],
    withCredentials: true,
  });
  return socket;
}


