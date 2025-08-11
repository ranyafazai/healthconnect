import { useEffect } from 'react';
import MessageList from '../../components/chat/MessageList';
import MessageInput from '../../components/chat/MessageInput';
import { useAppDispatch, useAppSelector } from '../../Redux/hooks';
import type { RootState } from '../../Redux/store';
import { Phone, Video, Clock3, Search, User, Stethoscope } from 'lucide-react';
import { connectChat, disconnectChat, fetchConversation, selectChat, selectConversation, sendTextMessage } from '../../Redux/chatSlice/chatSlice';
import { fetchDoctorDashboard } from '../../Redux/doctorSlice/doctorSlice';

export default function Messages() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s: RootState) => s.auth);
  const currentUserId = auth.user?.id ?? null;
  const chat = useAppSelector(selectChat);
  const { conversations, selectedId, messages } = chat;

  // Connect to chat socket
  useEffect(() => {
    if (!currentUserId) return;
    dispatch(connectChat(Number(currentUserId)));
    return () => {
      dispatch(disconnectChat());
    };
  }, [dispatch, currentUserId]);

  // Load conversation on selection
  useEffect(() => {
    if (!selectedId) return;
    dispatch(fetchConversation(selectedId));
    // Refresh dashboard data to update unread message count
    if (auth.user?.doctorProfile?.id) {
      dispatch(fetchDoctorDashboard());
    }
  }, [dispatch, selectedId, auth.user?.doctorProfile?.id]);

  function handleSend(content: string) {
    if (!selectedId) return;
    dispatch(sendTextMessage({ receiverId: selectedId, content }));
    // Refresh dashboard data to update unread message count
    if (auth.user?.doctorProfile?.id) {
      dispatch(fetchDoctorDashboard());
    }
  }

  return (
    <div className="flex h-full min-h-[600px] w-full bg-gray-100">
      {/* Left sidebar */}
      <aside className="flex w-72 flex-col border-r bg-white">
        {/* Doctor header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            {auth.user?.doctorProfile?.firstName?.charAt(0) || 'D'}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900">
              Dr. {auth.user?.doctorProfile?.firstName} {auth.user?.doctorProfile?.lastName}
            </div>
            <div className="truncate text-xs text-gray-500">{auth.user?.doctorProfile?.specialization || 'Doctor'}</div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-2 pt-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search patients..."
              className="w-full rounded-md border px-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                selectedId === c.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-sm font-semibold text-cyan-700">
                {c.name.split(' ').map((s) => s[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-gray-900">{c.name}</div>
                {c.lastMessage ? (
                  <div className="truncate text-xs text-gray-500">{c.lastMessage}</div>
                ) : (
                  <div className="text-xs text-gray-400">No messages yet</div>
                )}
              </div>
            </button>
          ))}
          
          {conversations.length === 0 && (
            <div className="px-4 py-8 text-center">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-400">Start chatting with your patients</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main panel */}
      <div className="flex min-w-0 flex-1 flex-col">
        {selectedId ? (
          <>
            {/* Top header with patient details and actions */}
            <div className="flex items-center justify-between border-b bg-white px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-600 text-sm font-semibold text-white">
                    {conversations.find((c) => c.id === selectedId)?.name.split(' ').map((s) => s[0]).join('').slice(0, 2) || 'PT'}
                  </div>
                  <span className="absolute -right-0 -bottom-0 block h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-gray-900">
                    {conversations.find((c) => c.id === selectedId)?.name || 'Select a chat'}
                  </div>
                  <div className="truncate text-xs text-gray-500">
                    Patient • Last visit: 2 weeks ago
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button className="rounded-full p-2 hover:bg-gray-100 transition-colors" aria-label="Audio call">
                  <Phone className="h-4 w-4" />
                </button>
                <button className="rounded-full p-2 hover:bg-gray-100 transition-colors" aria-label="Video call">
                  <Video className="h-4 w-4" />
                </button>
                <button className="rounded-full p-2 hover:bg-gray-100 transition-colors" aria-label="Patient History">
                  <Clock3 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Security banner */}
            <div className="flex items-center gap-2 border-b bg-white/60 px-5 py-2 text-xs text-gray-600">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span>End-to-end encrypted</span>
              <span>•</span>
              <span>HIPAA compliant</span>
              <span>•</span>
              <span>Patient conversations are secure and private</span>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-hidden">
              <MessageList items={messages} currentUserId={currentUserId} />
            </div>
            <MessageInput onSend={handleSend} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Conversation</h3>
              <p className="text-gray-500">Choose a patient from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
