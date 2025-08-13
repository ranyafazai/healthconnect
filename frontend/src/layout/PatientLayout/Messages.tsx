import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../Redux/hooks';
import type { RootState } from '../../Redux/store';
import { connectChat, disconnectChat, fetchConversation, sendTextMessage, sendFileMessage, fetchAppointmentMessages, clearMessages, joinAppointmentRoom } from '../../Redux/chatSlice/chatSlice';
import VideoCall from '../../components/chat/VideoCall';
import AudioCall from '../../components/chat/AudioCall';
import IncomingCallPopup from '../../components/chat/IncomingCallPopup';
import { useConversations } from '../../hooks/useConversations';
import MessageList from '../../components/chat/MessageList';
import MessageInput from '../../components/chat/MessageInput';
import { Phone, Video, MessageSquare, Clock, History, Calendar } from 'lucide-react';
import { useReviewModalContext } from '../../contexts/ReviewModalContext';
import TestReviewSystem from '../../components/examples/TestReviewSystem';
import { getSocket } from '../../lib/socket';

const Messages: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { messages, loadingMessages } = useAppSelector((state: RootState) => state.chat);
  const { openReviewModal } = useReviewModalContext();
  
  const { 
    conversations, 
    loading, 
    error,
    getUpcomingConversations,
    getPastConversations,
    canStartVideoCall,
    canStartAudioCall,
    markConversationAsRead 
  } = useConversations();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isAudioCallOpen, setIsAudioCallOpen] = useState(false);
  const [currentAppointmentId, setCurrentAppointmentId] = useState<number | null>(null);
  const [isOutgoingAudio, setIsOutgoingAudio] = useState(false);
  const [isOutgoingVideo, setIsOutgoingVideo] = useState(false);
  
  // Incoming call state
  const [incomingCall, setIncomingCall] = useState<{
    isOpen: boolean;
    callerName: string;
    callType: 'VIDEO' | 'AUDIO';
    appointmentId: number;
    callerId: number;
    conversationId?: number;
  } | null>(null);
  
  // Socket ref for incoming call detection
  const callSocketRef = useRef<any>(null);
  
  // Queue for pending offers that arrive before conversations are loaded
  const pendingOffersRef = useRef<any[]>([]);
  
  // Last incoming offer payload (for answering immediately)
  const lastIncomingOfferRef = useRef<any>(null);
  
  // Removed activeTab state since we're showing all conversations in one list
  
  // Ref for messages container to enable auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connect to chat when component mounts
  useEffect(() => {
    if (user?.id) {
      dispatch(connectChat(user.id));
      setupIncomingCallDetection();
    } else {
      // no user found; skip
    }

    // Cleanup: disconnect from chat when component unmounts
    return () => {
      dispatch(disconnectChat(user?.id || 0));
      if (callSocketRef.current) {
        callSocketRef.current.disconnect();
      }
    };
  }, [dispatch, user?.id]);

  // Re-setup incoming call detection when conversations are loaded
  useEffect(() => {
    if (user?.id && conversations.length > 0) {
      // Process any pending offers that arrived before conversations were loaded
      if (pendingOffersRef.current.length > 0) {
        pendingOffersRef.current.forEach(offerData => {
          processIncomingOffer(offerData);
        });
        pendingOffersRef.current = [];
      }
    }
  }, [conversations, user?.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Setup incoming call detection
  const setupIncomingCallDetection = () => {
    if (!user?.id) return;

    try {
      callSocketRef.current = getSocket('/video-call');
      
      callSocketRef.current.on('connect', () => {
        callSocketRef.current?.emit('join-user', user.id);
      });

      // Listen for incoming call offers
      callSocketRef.current.on('offer', async (data: any) => {
        lastIncomingOfferRef.current = data;
        
        // If conversations are not loaded yet, queue the offer
        if (conversations.length === 0) {
          pendingOffersRef.current.push(data);
          return;
        }
        
        processIncomingOffer(data);
      });

      // Caller cancelled before pickup
      callSocketRef.current.on('call-cancelled', (data: any) => {
        setIncomingCall(null);
      });

      // Listen for user-joined-call events (when someone joins a call room)
      callSocketRef.current.on('user-joined-call', (_data: any) => {});

      callSocketRef.current.on('error', (data: any) => {
        console.error('❌ Call socket error:', data);
      });

      // Connect to the socket
      callSocketRef.current.auth = { userId: user.id };
      callSocketRef.current.connect();

    } catch (err) {
      console.error('❌ Failed to setup incoming call detection:', err);
    }
  };

  // Process incoming call offer
  const processIncomingOffer = (data: any) => {
    // Find the conversation to get caller details
    const conversation = conversations.find(conv => 
      conv.otherUserId === data.fromUserId || conv.id === data.fromUserId
    );
    
    if (conversation) {
      queueMicrotask(() => {
        setIncomingCall({
          isOpen: true,
          callerName: conversation.name,
          callType: data.callType === 'AUDIO' ? 'AUDIO' : 'VIDEO',
          appointmentId: conversation.appointmentId || 0,
          callerId: data.fromUserId,
          conversationId: conversation.id
        });
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      });
    } else {
      // Try to find by appointment ID if we have it
      if (data.appointmentId) {
        const appointmentConversation = conversations.find(conv => conv.appointmentId === data.appointmentId);
        if (appointmentConversation) {
          queueMicrotask(() => {
            setIncomingCall({
              isOpen: true,
              callerName: appointmentConversation.name,
              callType: data.callType === 'AUDIO' ? 'AUDIO' : 'VIDEO',
              appointmentId: appointmentConversation.appointmentId || 0,
              callerId: data.fromUserId,
              conversationId: appointmentConversation.id
            });
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
          });
        }
      }
    }
  };

  // Handle incoming call accept
  const handleAcceptIncomingCall = () => {
    if (!incomingCall) return;
    
    if (incomingCall.callType === 'VIDEO') {
      setIsVideoCallOpen(true);
      setCurrentAppointmentId(incomingCall.appointmentId);
      setSelectedId(incomingCall.conversationId || incomingCall.callerId);
      setIsOutgoingVideo(false);
    } else {
      setIsAudioCallOpen(true);
      setCurrentAppointmentId(incomingCall.appointmentId);
      setSelectedId(incomingCall.conversationId || incomingCall.callerId);
      setIsOutgoingAudio(false);
    }
    
    setIncomingCall(null);
  };

  // Handle incoming call decline
  const handleDeclineIncomingCall = () => {
    // Send decline signal to caller
    if (callSocketRef.current && incomingCall) {
      callSocketRef.current.emit('call-declined', {
        targetUserId: incomingCall.callerId
      });
    }
    setIncomingCall(null);
  };

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

  // Example function to trigger review modal after consultation ends
  const handleConsultationEnd = (doctorId: number, doctorName: string, appointmentId: number) => {
    // This would be called when a consultation ends (video call ends, messaging session ends, etc.)
    // You can add logic here to check if the patient hasn't already reviewed this appointment
    openReviewModal(doctorId, doctorName, appointmentId);
  };

  const handleVideoCall = () => {
    if (selectedId && canStartVideoCall(conversations.find(conv => conv.id === selectedId)!)) {
      setIsOutgoingVideo(true);
      setIsVideoCallOpen(true);
    } else {
      // cannot start
    }
  };

  const handleAudioCall = () => {
    if (selectedId && canStartAudioCall(conversations.find(conv => conv.id === selectedId)!)) {
      setIsOutgoingAudio(true);
      setIsAudioCallOpen(true);
    } else {
      // no-op
    }
  };

  // Removed getFilteredConversations function since we're showing all conversations

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
                 <div className="p-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>

                 {/* Removed tabs - showing all conversations in one list */}

                          {/* Conversations */}
         <div className="overflow-y-auto h-96">
           {loading ? (
             <div className="p-4 text-center text-gray-500">Loading conversations...</div>
           ) : error ? (
             <div className="p-4 text-center text-red-500">{error}</div>
           ) : conversations.length === 0 ? (
             <div className="p-4 text-center text-gray-500">
               No conversations found
             </div>
           ) : (
             conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation.id)}
                                 className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
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
             <div className="p-3 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {conversations.find(conv => conv.id === selectedId)?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {conversations.find(conv => conv.id === selectedId)?.type === 'APPOINTMENT' 
                      ? 'Appointment Conversation' 
                      : 'Patient Conversation'}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {conversations.find(conv => conv.id === selectedId)?.type === 'APPOINTMENT' && (
                    <>
                      {(() => {
                        const conversation = conversations.find(conv => conv.id === selectedId);
                        const canVideoCall = conversation && canStartVideoCall(conversation);
                        const canAudioCall = conversation && canStartAudioCall(conversation);
                        return (
                          <>
                            <button
                              onClick={handleAudioCall}
                              disabled={!canAudioCall}
                              className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Audio Call"
                            >
                              <Phone size={20} />
                            </button>
                            <button
                              onClick={handleVideoCall}
                              disabled={!canVideoCall}
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
                   
                                      {/* Test Panel - Only show for appointment conversations */}
                   {conversations.find(conv => conv.id === selectedId)?.type === 'APPOINTMENT' && (
                     <div className="p-2">
                       <TestReviewSystem
                         appointmentId={currentAppointmentId || 0}
                         doctorId={conversations.find(conv => conv.id === selectedId)?.otherUserId || 0}
                         doctorName={conversations.find(conv => conv.id === selectedId)?.name || 'Unknown Doctor'}
                       />
                     </div>
                   )}
                 </>
               )}
             </div>

                         {/* Message Input */}
             <div className="p-2 border-t border-gray-200">
              <MessageInput 
                onSend={(content) => {
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
                onSendFile={(file) => {
                  if (selectedId && currentAppointmentId) {
                    const conversation = conversations.find(conv => conv.id === selectedId);
                    if (conversation) {
                      dispatch(sendFileMessage({
                        receiverId: conversation.otherUserId,
                        file,
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
          otherUserId={conversations.find(conv => conv.id === selectedId)?.otherUserId || 0}
          currentUserId={user?.id || 0}
          isInitiator={isOutgoingVideo}
          initialOffer={lastIncomingOfferRef.current?.offer || null}
        />
      )}

      {/* Audio Call Modal */}
      {isAudioCallOpen && currentAppointmentId && selectedId && (
        <AudioCall
          isOpen={isAudioCallOpen}
          onClose={() => setIsAudioCallOpen(false)}
          appointmentId={currentAppointmentId}
          otherUserId={conversations.find(conv => conv.id === selectedId)?.otherUserId || 0}
          currentUserId={user?.id || 0}
          isInitiator={isOutgoingAudio}
          initialOffer={lastIncomingOfferRef.current?.offer || null}
        />
      )}

      {/* Incoming Call Popup */}
      {incomingCall && (
        <IncomingCallPopup
          isOpen={incomingCall.isOpen}
          onAccept={handleAcceptIncomingCall}
          onDecline={handleDeclineIncomingCall}
          callerName={incomingCall.callerName}
          callType={incomingCall.callType}
          appointmentId={incomingCall.appointmentId}
        />
      )}
    </div>
  );
};

export default Messages;
