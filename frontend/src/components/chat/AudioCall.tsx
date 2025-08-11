import React, { useEffect, useRef, useState } from 'react';
import { Phone, Mic, MicOff, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { getSocket } from '../../lib/socket';

interface AudioCallProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: number;
  otherUserId: number;
  currentUserId: number;
  roomId?: string;
}

export default function AudioCall({ 
  isOpen, 
  onClose, 
  appointmentId, 
  otherUserId, 
  currentUserId,
  roomId 
}: AudioCallProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<any>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      initializeCall();
    } else {
      cleanupCall();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isConnected) {
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isConnected]);

  const initializeCall = async () => {
    try {
      setError(null);
      
      // Get user media (audio only)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      
      localStreamRef.current = stream;

      // Initialize WebRTC
      await initializeWebRTC();
      
      // Connect to socket
      connectToSocket();
      
    } catch (err) {
      console.error('Failed to initialize call:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const initializeWebRTC = async () => {
    try {
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };

      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Add local stream tracks
      localStreamRef.current?.getTracks().forEach(track => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addTrack(track, localStreamRef.current!);
        }
      });

      // Handle incoming streams
      peerConnectionRef.current.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
        // Play remote audio
        const audioElement = new Audio();
        audioElement.srcObject = event.streams[0];
        audioElement.play().catch(console.error);
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('ice-candidate', {
            targetUserId: otherUserId,
            candidate: event.candidate
          });
        }
      };

      // Handle connection state changes
      peerConnectionRef.current.onconnectionstatechange = () => {
        if (peerConnectionRef.current?.connectionState === 'connected') {
          setIsConnected(true);
        }
      };

    } catch (err) {
      console.error('Failed to initialize WebRTC:', err);
      setError('Failed to initialize audio call.');
    }
  };

  const connectToSocket = () => {
    try {
      socketRef.current = getSocket('/video-call'); // Using same namespace for audio calls
      
      socketRef.current.on('connect', () => {
        socketRef.current?.emit('join-user', currentUserId);
        socketRef.current?.emit('join-call', { appointmentId, roomId });
      });

      socketRef.current.on('call-joined', (data: any) => {
        console.log('Joined audio call:', data);
        if (data.roomId) {
          // Room joined successfully
        }
      });

      socketRef.current.on('user-joined-call', (data: any) => {
        console.log('User joined audio call:', data);
        // Other user joined the call
      });

      socketRef.current.on('offer', async (data: any) => {
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            
            socketRef.current?.emit('answer', {
              targetUserId: data.fromUserId,
              answer
            });
          } catch (err) {
            console.error('Error handling offer:', err);
          }
        }
      });

      socketRef.current.on('answer', async (data: any) => {
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          } catch (err) {
            console.error('Error handling answer:', err);
          }
        }
      });

      socketRef.current.on('ice-candidate', async (data: any) => {
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (err) {
            console.error('Error adding ICE candidate:', err);
          }
        }
      });

      socketRef.current.on('call-ended', () => {
        handleEndCall();
      });

      socketRef.current.on('error', (data: any) => {
        setError(data.message || 'Call error occurred');
      });

    } catch (err) {
      console.error('Failed to connect to socket:', err);
      setError('Failed to connect to call server.');
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // Note: Speaker control is limited in web browsers
    // This is mainly for UI state management
  };

  const handleEndCall = () => {
    cleanupCall();
    onClose();
  };

  const cleanupCall = () => {
    // Stop all tracks
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    remoteStreamRef.current?.getTracks().forEach(track => track.stop());
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.emit('end-call');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    // Reset state
    setIsConnected(false);
    setIsMuted(false);
    setIsSpeakerOn(true);
    setCallDuration(0);
    setError(null);
    
    // Clear interval
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="relative w-full h-full max-w-md max-h-[90vh] bg-gray-900 rounded-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-b from-black/50 to-transparent p-6 text-center">
          <div className="text-white">
            <h3 className="text-xl font-semibold mb-2">Audio Call</h3>
            <p className="text-sm text-gray-300">
              {isConnected ? `Connected • ${formatDuration(callDuration)}` : 'Connecting...'}
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-6 mb-4 bg-red-600 text-white p-3 rounded-lg text-center">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Call Status */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Phone size={48} className="text-white" />
            </div>
            <h4 className="text-lg font-medium text-white mb-2">
              {isConnected ? 'Call in Progress' : 'Connecting...'}
            </h4>
            <p className="text-gray-300 text-sm">
              {isConnected ? 'You are now connected' : 'Please wait while we connect you'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gradient-to-t from-black/50 to-transparent p-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* Mute/Unmute */}
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full transition-colors ${
                isMuted ? 'bg-red-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            {/* Speaker On/Off */}
            <button
              onClick={toggleSpeaker}
              className={`p-4 rounded-full transition-colors ${
                isSpeakerOn ? 'bg-blue-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {isSpeakerOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
          </div>

          {/* End Call Button */}
          <div className="flex justify-center">
            <button
              onClick={handleEndCall}
              className="p-4 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
