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
    console.log('🔌 join-appointment event emitted for user', userId, 'to appointment', appointmentId);
  } else {
    
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
    
    // Log socket state
    
    
    chatSockets.set(currentUserId, chatSocket);

    // Bind socket events before connecting
    const onNewMessage = (msg: Message) => {
      
      
      // Only add the message if it's intended for this user
      if (msg.receiverId === currentUserId || msg.senderId === currentUserId) {
        console.log('📨 Message is for this user, adding to state');
        console.log('📨 Dispatching addMessage for user:', currentUserId);
        
        dispatch(addMessage(msg));
        
        console.log('📨 Message dispatched to Redux state for user:', currentUserId);
      } else {
        
      }
    };

    const onMessageSent = (msg: Message) => {
      
      
      // Only add the message if it's intended for this user
      if (msg.receiverId === currentUserId || msg.senderId === currentUserId) {
        
        dispatch(addMessage(msg));
        
      } else {
        
      }
    };

    const onJoined = (data: { userId: number; role: string }) => {};

    const onAppointmentJoined = (data: { appointmentId: number }) => {};

    // Bind all events
    chatSocket.on('joined', onJoined);
    chatSocket.on('appointment-joined', onAppointmentJoined);
    chatSocket.on('new-message', onNewMessage);
    chatSocket.on('message-sent', onMessageSent);

    chatSocket.on('connect', () => {
      
      dispatch(setIsConnected(true));
      chatSocket.emit('join-user', currentUserId);
      // Fetch unread count upon connect
      try { axios.get('/messages/unread/count').then(r => dispatch(setUnreadCount(r.data?.data?.count || 0))); } catch {}
    });

    chatSocket.on('disconnect', () => {
      
      dispatch(setIsConnected(false));
    });

    chatSocket.on('error', (error) => {
      console.error('❌ Chat socket error for user', currentUserId, ':', error);
    });

    // If socket is already connected, emit join-user immediately
    if (chatSocket.connected) {
      
      chatSocket.emit('join-user', currentUserId);
    } else {
      
    }
  }
);

export const disconnectChat = createAsyncThunk('chat/disconnect', async (userId: number) => {
  const chatSocket = chatSockets.get(userId);
  if (chatSocket) {
  
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
        createdAt: new Date(),
      };
      dispatch(addMessage(optimistic));
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
      // Check if message already exists to avoid duplicates
      const existingMessageIndex = state.messages.findIndex(msg => msg.id === action.payload.id);
      
      if (existingMessageIndex !== -1) {
        // Update existing message (for optimistic updates)
        state.messages[existingMessageIndex] = action.payload;
      } else {
        // Add new message
        state.messages.push(action.payload);
      }
      
      // Sort messages by creation time (newest at the bottom for chat UI)
      state.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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
          console.log('📥 Merging', newMessages.length, 'new conversation messages from API');
          state.messages.push(...newMessages);
          // Sort messages by creation time
          state.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        } else {
          console.log('📥 No new conversation messages to merge from API');
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
          console.log('📥 Merging', newMessages.length, 'new messages from API');
          state.messages.push(...newMessages);
          // Sort messages by creation time
          state.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        } else {
          console.log('📥 No new messages to merge from API');
        }
      })
      .addCase(fetchAppointmentMessages.rejected, (state) => {
        state.loadingMessages = false;
      });
  },
});

export const { setIsConnected, selectConversation, addMessage, clearMessages, setConversations } = chatSlice.actions;

export const selectChat = (state: RootState) => state.chat as ChatState;

export default chatSlice.reducer;


