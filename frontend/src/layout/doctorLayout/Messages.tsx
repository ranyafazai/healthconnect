import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../Redux/hooks';
import type { RootState } from '../../Redux/store';
import { connectChat, disconnectChat, fetchConversation, sendTextMessage, fetchAppointmentMessages, clearMessages, joinAppointmentRoom } from '../../Redux/chatSlice/chatSlice';
import VideoCall from '../../components/chat/VideoCall';
import AudioCall from '../../components/chat/AudioCall';
import { useConversations } from '../../hooks/useConversations';
import MessageList from '../../components/chat/MessageList';
import MessageInput from '../../components/chat/MessageInput';
import { Phone, Video, MessageSquare, Clock, History, Calendar } from 'lucide-react';

const Messages: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { messages, loadingMessages } = useAppSelector((state: RootState) => state.chat);
  
  const { 
    conversations, 
    loading, 
    error,
    getUpcomingConversations,
    getPastConversations,
    canStartVideoCall,
    markConversationAsRead 
  } = useConversations();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isAudioCallOpen, setIsAudioCallOpen] = useState(false);
  const [currentAppointmentId, setCurrentAppointmentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  
  // Ref for messages container to enable auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connect to chat when component mounts
  useEffect(() => {
    if (user?.id) {
      dispatch(connectChat(user.id));
    } else {
      // no user found; skip
    }

    // Cleanup: disconnect from chat when component unmounts
    return () => {
      dispatch(disconnectChat(user?.id || 0));
    };
  }, [dispatch, user?.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSelectConversation = (conversationId: number) => {
    setSelectedId(conversationId);
    markConversationAsRead(conversationId);
    
    // Clear previous messages first
    dispatch(clearMessages());
    
    // Find the conversation to get appointment details
    const conversation = conversations.find(conv => conv.id === conversationId);
    
    if (conversation?.appointmentId) {
      setCurrentAppointmentId(conversation.appointmentId);
      
      // Join appointment room for real-time messaging
      joinAppointmentRoom(conversation.appointmentId, user?.id || 0);
      
      // Fetch messages for this appointment
      dispatch(fetchAppointmentMessages(conversation.appointmentId));
    } else if (conversation?.otherUserId) {
      // For non-appointment conversations, fetch by user ID
      dispatch(fetchConversation(conversation.otherUserId));
    }
  };

  const handleVideoCall = () => {
    if (selectedId && canStartVideoCall(conversations.find(conv => conv.id === selectedId)!)) {
      setIsVideoCallOpen(true);
    } else {
      // cannot start
    }
  };

  const handleAudioCall = () => {
    if (selectedId && canStartVideoCall(conversations.find(conv => conv.id === selectedId)!)) {
      setIsAudioCallOpen(true);
    } else {
      // cannot start
    }
  };

  const getFilteredConversations = () => {
    switch (activeTab) {
      case 'upcoming':
        return getUpcomingConversations();
      case 'past':
        return getPastConversations();
      default:
        return conversations;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'UPCOMING': { color: 'bg-blue-100 text-blue-800', icon: Calendar },
      'ACTIVE': { color: 'bg-green-100 text-green-800', icon: Clock },
      'PAST': { color: 'bg-gray-100 text-gray-800', icon: History }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  const getTypeIcon = (type: string, appointmentType?: string) => {
    if (type === 'DOCTOR_TO_DOCTOR') {
      return <MessageSquare size={16} className="text-blue-500" />;
    }
    
    if (appointmentType === 'VIDEO') {
      return <Video size={16} className="text-purple-500" />;
    }
    
    return <MessageSquare size={16} className="text-green-500" />;
  };

  return (
    <div className="flex h-full">
      {/* Conversation List */}
      <div className="w-80 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'upcoming'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'past'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All
          </button>
        </div>

        {/* Conversations */}
        <div className="overflow-y-auto h-96">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading conversations...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : getFilteredConversations().length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {activeTab === 'upcoming' ? 'No upcoming conversations' : 
               activeTab === 'past' ? 'No past conversations' : 'No conversations'}
            </div>
          ) : (
            getFilteredConversations().map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedId === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(conversation.type, conversation.appointmentType)}
                    <span className="font-medium text-gray-900">{conversation.name}</span>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage || 'No messages yet'}
                  </span>
                  {conversation.lastMessageTime && (
                    <span className="text-xs text-gray-400">
                      {new Date(conversation.lastMessageTime).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  {getStatusBadge(conversation.status)}
                  {conversation.appointmentDate && (
                    <span className="text-xs text-gray-500">
                      {new Date(conversation.appointmentDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {conversations.find(conv => conv.id === selectedId)?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {conversations.find(conv => conv.id === selectedId)?.type === 'APPOINTMENT' 
                      ? 'Appointment Conversation' 
                      : 'Doctor Conversation'}
                  </p>
                  {/* Debug: Message counter */}
                  <p className="text-xs text-blue-600 mt-1">
                    Messages: {messages.length} | Connected: {user?.id ? 'Yes' : 'No'}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {conversations.find(conv => conv.id === selectedId)?.type === 'APPOINTMENT' && (
                    <>
                      {(() => {
                        const conversation = conversations.find(conv => conv.id === selectedId);
                        const canCall = conversation && canStartVideoCall(conversation);
                        return (
                          <>
                            <button
                              onClick={handleAudioCall}
                              disabled={!canCall}
                              className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Audio Call"
                            >
                              <Phone size={20} />
                            </button>
                            <button
                              onClick={handleVideoCall}
                              disabled={!canCall}
                              className="p-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Video Call"
                            >
                              <Video size={20} />
                            </button>
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Loading messages...</div>
                </div>
              ) : (
                <>
                  <MessageList items={messages} currentUserId={user?.id || 0} />
                  <div ref={messagesEndRef} /> {/* Scroll anchor */}
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <MessageInput 
                onSend={(content) => {
                  // Handle sending message
                  console.log('💬 Doctor sending message:', content);
                  console.log('📝 Message details:', {
                    conversationId: selectedId,
                    appointmentId: currentAppointmentId,
                    content,
                    timestamp: new Date().toISOString()
                  });
                  
                  if (selectedId && currentAppointmentId) {
                    const conversation = conversations.find(conv => conv.id === selectedId);
                    if (conversation) {
                      dispatch(sendTextMessage({
                        receiverId: conversation.otherUserId,
                        content,
                        appointmentId: currentAppointmentId
                      }));
                    }
                  }
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Select a conversation to start messaging</p>
              <p className="text-sm">Choose from your upcoming or past appointments</p>
            </div>
          </div>
        )}
      </div>

      {/* Video Call Modal */}
      {isVideoCallOpen && currentAppointmentId && selectedId && (
        <VideoCall
          isOpen={isVideoCallOpen}
          onClose={() => setIsVideoCallOpen(false)}
          appointmentId={currentAppointmentId}
          otherUserId={selectedId}
          currentUserId={user?.id || 0}
        />
      )}

      {/* Audio Call Modal */}
      {isAudioCallOpen && currentAppointmentId && selectedId && (
        <AudioCall
          isOpen={isAudioCallOpen}
          onClose={() => setIsAudioCallOpen(false)}
          appointmentId={currentAppointmentId}
          otherUserId={selectedId}
          currentUserId={user?.id || 0}
        />
      )}
    </div>
  );
};

export default Messages;
