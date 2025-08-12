// frontend/src/lib/socket.ts
import { io, type Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

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
    // Auth via httpOnly cookie; no localStorage token
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
  });
  // UX hints
  socket.on('connect', () => {
    try { toast.success('Connected to realtime service'); } catch {}
  });
  socket.on('disconnect', () => {
    try { toast.error('Disconnected. Reconnecting...'); } catch {}
  });
  socket.on('reconnect', () => {
    try { toast.success('Reconnected'); } catch {}
  });
  // Reconnection UX hooks (no-op placeholders; UI can subscribe if needed)
  socket.on('reconnect_attempt', () => {});
  socket.on('reconnect_failed', () => {});
  // Basic connection lifecycle logging
  return socket;
}


