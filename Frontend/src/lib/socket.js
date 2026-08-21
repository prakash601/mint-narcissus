import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, '');

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function joinConversation(conversationId) {
  const s = getSocket();
  return new Promise((resolve) => {
    s.timeout(5000).emit('join_conversation', conversationId, (err, ack) => {
      if (err || !ack?.ok) resolve(false);
      else resolve(true);
    });
  });
}

export function leaveConversation(conversationId) {
  if (!socket) return;
  socket.emit('leave_conversation', conversationId);
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
