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

// Keep track of all socket instances for cleanup
const socketInstances: Set<Socket> = new Set();

export function getSocket(namespace: '/chat' | '/video-call' | '/notifications' | string): Socket {
  const url = `${base}${namespace}`;
  const socket = io(url, {
    transports: ['websocket'],
    withCredentials: true,
    // Auth via httpOnly cookie; no localStorage token
    autoConnect: false, // Don't auto-connect, let components control connection
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
  });
  
  // Track this socket instance
  socketInstances.add(socket);
  
  // UX hints - only show for successful connections
  socket.on('connect', () => {
    try { toast.success('Connected to realtime service'); } catch {}
  });
  
  socket.on('disconnect', (reason) => {
    // Remove from tracking when disconnected
    socketInstances.delete(socket);
    // Only show error for unexpected disconnections
    if (reason !== 'io client disconnect') {
      try { toast.error('Disconnected. Reconnecting...'); } catch {}
    }
  });
  
  socket.on('reconnect', () => {
    try { toast.success('Reconnected'); } catch {}
  });
  
  // Reconnection UX hooks (no-op placeholders; UI can subscribe if needed)
  socket.on('reconnect_attempt', () => {});
  socket.on('reconnect_failed', () => {});
  
  return socket;
}

// Utility function to disconnect all sockets
export function disconnectAllSockets(): void {
  socketInstances.forEach(socket => {
    if (socket.connected) {
      socket.disconnect();
    }
  });
  socketInstances.clear();
}


