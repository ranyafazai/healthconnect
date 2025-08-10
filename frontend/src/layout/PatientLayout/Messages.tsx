import { useEffect } from 'react';
import MessageList from '../../components/chat/MessageList';
import MessageInput from '../../components/chat/MessageInput';
// sockets managed by Redux connectChat
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../Redux/store';
import { Phone, Video, Clock3, Search } from 'lucide-react';
import { connectChat, disconnectChat, fetchConversation, selectChat, selectConversation, sendTextMessage } from '../../Redux/chatSlice/chatSlice';

// (types are managed by Redux slice; no local usage here)

export default function Messages() {
  const dispatch = useDispatch();
  const auth = useSelector((s: RootState) => s.auth);
  const currentUserId = auth.user?.id ?? null;
  const chat = useSelector(selectChat);
  const { conversations, selectedId, messages } = chat;

  // sockets (managed by Redux connectChat; local instance not required)

  // join my user room
  useEffect(() => {
    if (!currentUserId) return;
    dispatch(connectChat(Number(currentUserId)) as any);
    return () => {
      dispatch(disconnectChat() as any);
    };
  }, [dispatch, currentUserId]);

  // load conversation on selection
  useEffect(() => {
    if (!selectedId) return;
    dispatch(fetchConversation(selectedId) as any);
  }, [dispatch, selectedId]);

  // real-time handlers
  // (Socket listeners are registered in chatSlice via connectChat)

  function handleSend(content: string) {
    if (!selectedId) return;
    dispatch(sendTextMessage({ receiverId: selectedId, content }) as any);
  }

  return (
    <div className="flex h-full min-h-[600px] w-full bg-gray-100">
      {/* Left sidebar */}
      <aside className="flex w-72 flex-col border-r bg-white">
        {/* Doctor header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            DJ
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900">Dr. Sarah Johnson</div>
            <div className="truncate text-xs text-gray-500">Internal Medicine</div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search patients..."
              className="w-full rounded-md border px-8 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="px-4 pb-2 text-xs font-medium text-gray-700">Active Patients</div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => dispatch(selectConversation(c.id))}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 ${
                selectedId === c.id ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                {c.name.split(' ').map((s) => s[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-gray-900">{c.name}</div>
                {c.lastMessage ? (
                  <div className="truncate text-xs text-gray-500">{c.lastMessage}</div>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main panel */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header with patient details and actions */}
        <div className="flex items-center justify-between border-b bg-white px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
                ET
              </div>
              <span className="absolute -right-0 -bottom-0 block h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-gray-900">
                {conversations.find((c) => c.id === selectedId)?.name || 'Select a chat'}
              </div>
              <div className="truncate text-xs text-gray-500">
                Age: 45 • Hypertension • Last visit: 2 weeks ago
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button className="rounded-full p-2 hover:bg-gray-100" aria-label="Audio call">
              <Phone className="h-4 w-4" />
            </button>
            <button className="rounded-full p-2 hover:bg-gray-100" aria-label="Video call" onClick={() => alert('Start video call (wire to /video-call socket)')}>
              <Video className="h-4 w-4" />
            </button>
            <button className="rounded-full p-2 hover:bg-gray-100" aria-label="History">
              <Clock3 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Security banner */}
        <div className="flex items-center gap-2 border-b bg-white/60 px-5 py-2 text-xs text-gray-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>End-to-end encrypted</span>
          <span>•</span>
          <span>HIPAA compliant</span>
          <span>•</span>
          <span>Your conversations are secure and private</span>
        </div>

        {/* Messages area */}
        <MessageList items={messages} currentUserId={currentUserId} />
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
