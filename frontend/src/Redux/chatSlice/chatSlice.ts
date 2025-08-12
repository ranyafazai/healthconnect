import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getSocket } from '../../lib/socket';
import { getConversation, sendMessage, getAppointmentMessages } from '../../Api/message.api';
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
};

const initialState: ChatState = {
  isConnected: false,
  connecting: false,
  conversations: [
    { id: 2, name: 'Emma Thompson', lastMessage: 'Last visit: 2 weeks ago' },
  ],
  selectedId: 2,
  messages: [],
  loadingMessages: false,
};

// Module-level socket map (avoid storing non-serializable in Redux state)
const chatSockets: Map<number, ReturnType<typeof getSocket>> = new Map();

// Function to join appointment room
export const joinAppointmentRoom = (appointmentId: number, userId: number) => {
  console.log('🔌 Attempting to join appointment room:', { appointmentId, userId });
  
  const chatSocket = chatSockets.get(userId);
  if (chatSocket && chatSocket.connected) {
    console.log('🔌 User', userId, 'joining appointment room:', appointmentId);
    console.log('🔌 Socket connection status:', chatSocket.connected);
    chatSocket.emit('join-appointment', appointmentId);
    console.log('🔌 join-appointment event emitted for user', userId, 'to appointment', appointmentId);
  } else {
    console.log('❌ User', userId, 'socket not connected for appointment room join');
    console.log('❌ Socket exists:', !!chatSocket);
    console.log('❌ Socket connected:', chatSocket?.connected);
  }
};

export const connectChat = createAsyncThunk(
  'chat/connect',
  async (currentUserId: number, { dispatch }) => {
    console.log('🔌 connectChat called for user:', currentUserId);
    
    // Check if user already has a socket connection
    if (chatSockets.has(currentUserId)) {
      const existingSocket = chatSockets.get(currentUserId);
      if (existingSocket && existingSocket.connected) {
        console.log('🔌 Chat socket already connected for user:', currentUserId);
        return;
      } else {
        console.log('🔌 Existing socket found but not connected, removing...');
        chatSockets.delete(currentUserId);
      }
    }
    
    console.log('🔌 Creating new chat socket connection for user:', currentUserId);
    const chatSocket = getSocket('/chat');
    
    // Log socket state
    console.log('🔌 Socket created, initial state:', {
      id: chatSocket.id,
      connected: chatSocket.connected
    });
    
    chatSockets.set(currentUserId, chatSocket);

    // Bind socket events before connecting
    const onNewMessage = (msg: Message) => {
      console.log('📨 User', currentUserId, 'received new message via socket:', msg);
      console.log('📨 Message details:', {
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content,
        appointmentId: msg.appointmentId
      });
      
      // Only add the message if it's intended for this user
      if (msg.receiverId === currentUserId || msg.senderId === currentUserId) {
        console.log('📨 Message is for this user, adding to state');
        dispatch(addMessage(msg));
        console.log('📨 Message dispatched to Redux state for user:', currentUserId);
      } else {
        console.log('📨 Message is not for this user, ignoring');
      }
    };

    const onMessageSent = (msg: Message) => {
      console.log('📤 User', currentUserId, 'received message sent confirmation via socket:', msg);
      console.log('📤 Message confirmation details:', {
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content,
        appointmentId: msg.appointmentId
      });
      
      // Only add the message if it's intended for this user
      if (msg.receiverId === currentUserId || msg.senderId === currentUserId) {
        console.log('📤 Message confirmation is for this user, updating state');
        dispatch(addMessage(msg));
        console.log('📤 Message confirmation dispatched to Redux state for user:', currentUserId);
      } else {
        console.log('📤 Message confirmation is not for this user, ignoring');
      }
    };

    const onJoined = (data: { userId: number; role: string }) => {
      console.log('🔌 User', currentUserId, 'joined chat room:', data);
    };

    const onAppointmentJoined = (data: { appointmentId: number }) => {
      console.log('🔌 User', currentUserId, 'joined appointment room:', data);
    };

    // Bind all events
    chatSocket.on('joined', onJoined);
    chatSocket.on('appointment-joined', onAppointmentJoined);
    chatSocket.on('new-message', onNewMessage);
    chatSocket.on('message-sent', onMessageSent);

    chatSocket.on('connect', () => {
      console.log('🔌 Chat socket connected successfully for user:', currentUserId);
      console.log('🔌 Socket details after connect:', {
        id: chatSocket.id,
        connected: chatSocket.connected
      });
      dispatch(setIsConnected(true));
      console.log('🔌 Emitting join-user for user:', currentUserId);
      chatSocket.emit('join-user', currentUserId);
    });

    chatSocket.on('disconnect', () => {
      console.log('🔌 Chat socket disconnected for user:', currentUserId);
      dispatch(setIsConnected(false));
    });

    chatSocket.on('error', (error) => {
      console.error('❌ Chat socket error for user', currentUserId, ':', error);
    });

    // If socket is already connected, emit join-user immediately
    if (chatSocket.connected) {
      console.log('🔌 Socket already connected, joining user immediately:', currentUserId);
      chatSocket.emit('join-user', currentUserId);
    } else {
      console.log('🔌 Socket not yet connected, waiting for connect event...');
    }
  }
);

export const disconnectChat = createAsyncThunk('chat/disconnect', async (userId: number) => {
  const chatSocket = chatSockets.get(userId);
  if (chatSocket) {
    console.log('🔌 Disconnecting chat socket for user:', userId);
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversation.pending, (state) => {
        state.loadingMessages = true;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.loadingMessages = false;
        state.messages = action.payload;
      })
      .addCase(fetchConversation.rejected, (state) => {
        state.loadingMessages = false;
      })
      .addCase(fetchAppointmentMessages.pending, (state) => {
        state.loadingMessages = true;
      })
      .addCase(fetchAppointmentMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;
        state.messages = action.payload;
      })
      .addCase(fetchAppointmentMessages.rejected, (state) => {
        state.loadingMessages = false;
      });
  },
});

export const { setIsConnected, selectConversation, addMessage, clearMessages, setConversations } = chatSlice.actions;

export const selectChat = (state: RootState) => state.chat as ChatState;

export default chatSlice.reducer;


