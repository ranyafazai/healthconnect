import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Message, MessageType } from '../../types/data/message';
import { getConversation as apiGetConversation, sendMessage as apiSendMessage } from '../../Api/message.api';
import { getSocket } from '../../lib/socket';

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

// Module-level socket (avoid storing non-serializable in Redux state)
let chatSocket: ReturnType<typeof getSocket> | null = null;

export const connectChat = createAsyncThunk(
  'chat/connect',
  async (currentUserId: number, { dispatch }) => {
    if (chatSocket) return;
    chatSocket = getSocket('/chat');

    chatSocket.on('connect', () => {
      dispatch(setIsConnected(true));
      chatSocket?.emit('join-user', currentUserId);
    });

    const onNewMessage = (msg: Message) => {
      dispatch(addMessage(msg));
    };

    chatSocket.on('new-message', onNewMessage);
    chatSocket.on('message-sent', onNewMessage);

    chatSocket.on('disconnect', () => {
      dispatch(setIsConnected(false));
    });
  }
);

export const disconnectChat = createAsyncThunk('chat/disconnect', async () => {
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
  }
});

export const fetchConversation = createAsyncThunk(
  'chat/fetchConversation',
  async (otherUserId: number) => {
    const res = await apiGetConversation(otherUserId);
    return res.data?.data ?? [];
  }
);

export const sendTextMessage = createAsyncThunk(
  'chat/sendTextMessage',
  async (
    payload: { receiverId: number; content: string; appointmentId?: number | null; type?: MessageType },
    { getState, dispatch }
  ) => {
    await apiSendMessage({ ...payload, type: payload.type ?? 'TEXT' });
    // Optimistic UI update handled by component previously; here we'll let socket echo back
    // For immediate feel, dispatch optional optimistic message if needed
    const state = getState() as any;
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
      state.messages.push(action.payload);
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
      });
  },
});

export const { setIsConnected, selectConversation, addMessage, setConversations } = chatSlice.actions;

export const selectChat = (state: any) => state.chat as ChatState;

export default chatSlice.reducer;


