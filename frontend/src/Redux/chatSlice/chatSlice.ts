import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getSocket } from '../../lib/socket';
import { getConversation, sendMessage, getAppointmentMessages } from '../../Api/message.api';
import axios from '../../lib/axios';
import type { Message, MessageType } from '../../types/data/message';
import type { RootState } from '../store';

export type ConversationLite = {
  id: number;
  name: string;
  lastMessage?: string;
};

type ChatState = {
  isConnected: boolean;
  connecting: boolean;
  conversations: ConversationLite[];
  selectedId: number | null;
  messages: Message[];
  loadingMessages: boolean;
  unreadCount?: number;
};

const initialState: ChatState = {
  isConnected: false,
  connecting: false,
  conversations: [],
  selectedId: null,
  messages: [],
  loadingMessages: false,
  unreadCount: 0,
};

// Module-level socket map (avoid storing non-serializable in Redux state)
const chatSockets: Map<number, ReturnType<typeof getSocket>> = new Map();

// Function to join appointment room
export const joinAppointmentRoom = (appointmentId: number, userId: number) => {
  const chatSocket = chatSockets.get(userId);
  if (chatSocket && chatSocket.connected) {
    chatSocket.emit('join-appointment', appointmentId);
  } else {
    // Socket not connected
  }
};

export const connectChat = createAsyncThunk(
  'chat/connect',
  async (currentUserId: number, { dispatch }) => {
    // Check if user already has a socket connection
    if (chatSockets.has(currentUserId)) {
      const existingSocket = chatSockets.get(currentUserId);
      if (existingSocket && existingSocket.connected) {
        return;
      } else {
        chatSockets.delete(currentUserId);
      }
    }

    const chatSocket = getSocket('/chat');

    chatSockets.set(currentUserId, chatSocket);

    // Bind socket events before connecting
    const onNewMessage = (msg: Message) => {
      // Only add the message if it's intended for this user
      if (msg.receiverId === currentUserId || msg.senderId === currentUserId) {
        dispatch(addMessage(msg));
        
        // Also dispatch an action to update conversation list
        if (msg.appointmentId && msg.content) {
          dispatch(updateConversationLastMessage({
            conversationId: msg.appointmentId,
            message: msg.content,
            timestamp: typeof msg.createdAt === 'string' ? msg.createdAt : new Date(msg.createdAt).toISOString()
          }));
        }
      } else {
        
      }
    };

    const onMessageSent = (msg: Message) => {
      // Only add the message if it's intended for this user
      if (msg.receiverId === currentUserId || msg.senderId === currentUserId) {
        dispatch(addMessage(msg));
        
        // Also dispatch an action to update conversation list
        if (msg.appointmentId && msg.content) {
          dispatch(updateConversationLastMessage({
            conversationId: msg.appointmentId,
            message: msg.content,
            timestamp: typeof msg.createdAt === 'string' ? msg.createdAt : new Date(msg.createdAt).toISOString()
          }));
        }
      } else {
        
      }
    };

    const onJoined = () => {};

    const onAppointmentJoined = () => {};

    // Bind all events
    chatSocket.on('joined', onJoined);
    chatSocket.on('appointment-joined', onAppointmentJoined);
    chatSocket.on('new-message', onNewMessage);
    chatSocket.on('message-sent', onMessageSent);

    chatSocket.on('connect', () => {
      dispatch(setIsConnected(true));
      chatSocket.emit('join-user', currentUserId);
      // Fetch unread count upon connect
      try { 
        axios.get('/messages/unread/count').then(r => dispatch(setUnreadCount(r.data?.data?.count || 0))); 
      } catch {
        // Ignore unread count fetch errors
      }
    });

    chatSocket.on('disconnect', () => {
      dispatch(setIsConnected(false));
    });

    chatSocket.on('error', () => {});

    // Connect the socket
    chatSocket.connect();
    
    // Wait for connection to be established
    if (chatSocket.connected) {
      chatSocket.emit('join-user', currentUserId);
    } else {
      // Socket will emit join-user when connected via the connect event handler
    }
  }
);

export const disconnectChat = createAsyncThunk('chat/disconnect', async (userId: number) => {
  const chatSocket = chatSockets.get(userId);
  if (chatSocket && chatSocket.connected) {
    chatSocket.disconnect();
    chatSockets.delete(userId);
  }
});

export const fetchConversation = createAsyncThunk(
  'chat/fetchConversation',
  async (otherUserId: number) => {
    const res = await getConversation(otherUserId);
    return res.data?.data ?? [];
  }
);

export const fetchAppointmentMessages = createAsyncThunk(
  'chat/fetchAppointmentMessages',
  async (appointmentId: number) => {
    const res = await getAppointmentMessages(appointmentId);
    return res.data?.data ?? [];
  }
);

export const sendTextMessage = createAsyncThunk(
  'chat/sendTextMessage',
  async (
    payload: { receiverId: number; content: string; appointmentId?: number | null; type?: MessageType },
    { getState, dispatch }
  ) => {
    await sendMessage({ ...payload, type: payload.type ?? 'TEXT' });
    // Optimistic UI update handled by component previously; here we'll let socket echo back
    // For immediate feel, dispatch optional optimistic message if needed
    const state = getState() as RootState;
    const currentUserId = state?.auth?.user?.id as number | undefined;
    if (currentUserId) {
             const optimistic: Message = {
         id: Date.now(),
         senderId: Number(currentUserId),
         receiverId: payload.receiverId,
         appointmentId: payload.appointmentId ?? undefined,
         content: payload.content,
         type: 'TEXT',
         isRead: false,
         createdAt: new Date().toISOString() as any, // Convert to ISO string for Redux serialization
       };
      dispatch(addMessage(optimistic));
    }
  }
);

export const sendFileMessage = createAsyncThunk(
  'chat/sendFileMessage',
  async (
    payload: { receiverId: number; file: File; appointmentId?: number | null },
    { getState, dispatch }
  ) => {
    try {
      // Determine message type based on file type
      let messageType: MessageType = 'FILE';
      if (payload.file.type.startsWith('image/')) {
        messageType = 'IMAGE';
      } else if (payload.file.type.startsWith('video/')) {
        messageType = 'VIDEO';
      }
      
      // Create optimistic message first (for immediate UI feedback)
      const state = getState() as RootState;
      const currentUserId = state?.auth?.user?.id as number | undefined;
      if (currentUserId) {
        const optimistic: Message = {
          id: Date.now(),
          senderId: Number(currentUserId),
          receiverId: payload.receiverId,
          appointmentId: payload.appointmentId ?? undefined,
          content: payload.file.name,
          type: messageType,
          fileId: undefined, // Will be set after upload
          isRead: false,
          createdAt: new Date().toISOString() as any,
        };
        dispatch(addMessage(optimistic));
      }
      
      // Upload the file
      const formData = new FormData();
      formData.append('file', payload.file);
      formData.append('fileType', 'CHAT_MEDIA');
      
      const uploadResponse = await axios.post('/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const fileId = uploadResponse.data?.data?.id;
      
      if (!fileId) {
        throw new Error('Failed to upload file');
      }
      
      // Send the message with the file ID via Socket.IO
      if (currentUserId) {
        const chatSocket = chatSockets.get(currentUserId);
        if (chatSocket && chatSocket.connected) {
          chatSocket.emit('send-message', {
            receiverId: payload.receiverId,
            appointmentId: payload.appointmentId,
            content: payload.file.name,
            type: messageType,
            fileId: fileId
          });
        } else {
          // Fallback to HTTP if Socket.IO not available
          await sendMessage({
            receiverId: payload.receiverId,
            appointmentId: payload.appointmentId,
            content: payload.file.name,
            type: messageType,
            fileId: fileId
          });
        }
      }
      
      
    } catch (error) {
      console.error('Failed to send file message:', error);
      throw error;
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setIsConnected(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
    },
    selectConversation(state, action: PayloadAction<number | null>) {
      state.selectedId = action.payload;
      state.messages = [];
    },
    addMessage(state, action: PayloadAction<Message>) {
      
      
      // Ensure createdAt is a string for Redux serialization
      const messageToAdd = {
        ...action.payload,
        createdAt: typeof action.payload.createdAt === 'string' 
          ? action.payload.createdAt 
          : new Date(action.payload.createdAt).toISOString()
      };
      
      // Check if message already exists to avoid duplicates
      const existingMessageIndex = state.messages.findIndex(msg => msg.id === messageToAdd.id);
      
      if (existingMessageIndex !== -1) {
        // Update existing message (for optimistic updates)
        
        state.messages[existingMessageIndex] = messageToAdd;
      } else {
        // Add new message
        
        state.messages.push(messageToAdd);
      }
      
      // Sort messages by creation time (newest at the bottom for chat UI)
      state.messages.sort((a, b) => {
        const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : a.createdAt.getTime();
        const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : b.createdAt.getTime();
        return timeA - timeB;
      });
      
      
    },
    updateConversationLastMessage(_state, _action: PayloadAction<{ conversationId: number; message: string; timestamp: string }>) {
      // Handled in UI hook
    },
    clearMessages(state) {
      state.messages = [];
    },
    setConversations(state, action: PayloadAction<ConversationLite[]>) {
      state.conversations = action.payload;
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversation.pending, (state) => {
        state.loadingMessages = true;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.loadingMessages = false;
        // Merge messages instead of replacing to preserve socket messages
        const existingMessageIds = new Set(state.messages.map(msg => msg.id));
        const newMessages = action.payload.filter(msg => !existingMessageIds.has(msg.id));
        
        if (newMessages.length > 0) {
          // Ensure all messages have string dates for Redux serialization
          const serializedMessages = newMessages.map(msg => ({
            ...msg,
            createdAt: typeof msg.createdAt === 'string' 
              ? msg.createdAt 
              : new Date(msg.createdAt).toISOString()
          }));
          state.messages.push(...serializedMessages);
          state.messages.sort((a, b) => {
            const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : a.createdAt.getTime();
            const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : b.createdAt.getTime();
            return timeA - timeB;
          });
        }
      })
      .addCase(fetchConversation.rejected, (state) => {
        state.loadingMessages = false;
      })
      .addCase(fetchAppointmentMessages.pending, (state) => {
        state.loadingMessages = true;
      })
      .addCase(fetchAppointmentMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;
        // Merge messages instead of replacing to preserve socket messages
        const existingMessageIds = new Set(state.messages.map(msg => msg.id));
        const newMessages = action.payload.filter(msg => !existingMessageIds.has(msg.id));
        
        if (newMessages.length > 0) {
          // Ensure all messages have string dates for Redux serialization
          const serializedMessages = newMessages.map(msg => ({
            ...msg,
            createdAt: typeof msg.createdAt === 'string' 
              ? msg.createdAt 
              : new Date(msg.createdAt).toISOString()
          }));
          state.messages.push(...serializedMessages);
          state.messages.sort((a, b) => {
            const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : a.createdAt.getTime();
            const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : b.createdAt.getTime();
            return timeA - timeB;
          });
        }
      })
      .addCase(fetchAppointmentMessages.rejected, (state) => {
        state.loadingMessages = false;
      });
  },
});

export const { setIsConnected, selectConversation, addMessage, clearMessages, setConversations, setUnreadCount, updateConversationLastMessage } = chatSlice.actions;

export const selectChat = (state: RootState) => state.chat as ChatState;

export default chatSlice.reducer;


