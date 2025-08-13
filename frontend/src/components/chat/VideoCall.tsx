import { useEffect, useRef, useState } from 'react';
import { Phone, Video, Mic, MicOff, VideoOff, Monitor, MonitorOff, PhoneOff, Settings } from 'lucide-react';
import { getSocket } from '../../lib/socket';

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: number;
  otherUserId: number;
  currentUserId: number;
  roomId?: string;
  isInitiator?: boolean;
  initialOffer?: RTCSessionDescriptionInit | null;
}

export default function VideoCall({ 
  isOpen, 
  onClose, 
  appointmentId, 
  otherUserId, 
  currentUserId,
  roomId,
  isInitiator = false,
  initialOffer = null
}: VideoCallProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<any>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCreatedOfferRef = useRef<boolean>(false);

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
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      await initializeWebRTC();
      connectToSocket();

      // If receiver has initial offer, answer immediately
      if (!isInitiator && initialOffer && peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(initialOffer));
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          socketRef.current?.emit('answer', {
            targetUserId: otherUserId,
            answer
          });
        } catch (err) {
          console.error('Error applying initial offer/creating answer (video):', err);
        }
      }
      
    } catch (err) {
      console.error('Failed to initialize call:', err);
      setError('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const initializeWebRTC = async () => {
    try {
      let configuration: RTCConfiguration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      try {
        const res = await fetch('/api/webrtc-config');
        if (res.ok) {
          const cfg = await res.json();
          if (cfg?.iceServers && Array.isArray(cfg.iceServers)) {
            configuration = { iceServers: cfg.iceServers } as RTCConfiguration;
          }
        }
      } catch {}

      peerConnectionRef.current = new RTCPeerConnection(configuration);

      localStreamRef.current?.getTracks().forEach(track => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addTrack(track, localStreamRef.current!);
        }
      });

      peerConnectionRef.current.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('ice-candidate', {
            targetUserId: otherUserId,
            candidate: event.candidate
          });
        }
      };

      peerConnectionRef.current.onconnectionstatechange = () => {
        if (peerConnectionRef.current?.connectionState === 'connected') {
          setIsConnected(true);
        }
      };

    } catch (err) {
      console.error('Failed to initialize WebRTC:', err);
      setError('Failed to initialize video call.');
    }
  };

  const connectToSocket = () => {
    try {
      socketRef.current = getSocket('/video-call');
      
      socketRef.current.on('connect', () => {
        socketRef.current?.emit('join-user', currentUserId);
        socketRef.current?.emit('join-call', { appointmentId, roomId });
      });

      socketRef.current.on('call-joined', async (data: any) => {
        if (data.roomId && isInitiator && !hasCreatedOfferRef.current) {
          try {
            if (peerConnectionRef.current) {
              hasCreatedOfferRef.current = true;
              const offer = await peerConnectionRef.current.createOffer();
              await peerConnectionRef.current.setLocalDescription(offer);
              socketRef.current?.emit('offer', {
                targetUserId: otherUserId,
                offer,
                callType: 'VIDEO'
              });
            }
          } catch (e) {
            console.error('Error creating initial offer (video):', e);
            hasCreatedOfferRef.current = false;
          }
        }
      });

      socketRef.current.on('user-joined-call', (_data: any) => {});

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
            console.error('Error handling offer (video):', err);
          }
        }
      });

      socketRef.current.on('answer', async (data: any) => {
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          } catch (err) {
            console.error('Error handling answer (video):', err);
          }
        }
      });

      socketRef.current.on('ice-candidate', async (data: any) => {
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (err) {
            console.error('Error adding ICE candidate (video):', err);
          }
        }
      });

      socketRef.current.on('call-ended', () => {
        handleEndCall();
      });

      socketRef.current.on('call-declined', (data: any) => {
        setError('Call was declined by the other user.');
        setTimeout(() => {
          handleEndCall();
        }, 2000);
      });

      socketRef.current.on('call-cancelled', (data: any) => {
        setError('Caller cancelled the call.');
        setTimeout(() => handleEndCall(), 1000);
      });

      // Explicit connect with auth
      socketRef.current.auth = { userId: currentUserId };
      socketRef.current.connect();

    } catch (err) {
      console.error('Failed to connect to socket:', err);
      setError('Failed to connect to call server.');
    }
  };

  const createOffer = async () => {
    if (peerConnectionRef.current) {
      try {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        
        socketRef.current?.emit('offer', {
          targetUserId: otherUserId,
          offer
        });
      } catch (err) {
        console.error('Failed to create offer:', err);
      }
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

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
        
        screenStreamRef.current = screenStream;
        
        // Replace video track
        const videoTrack = screenStream.getVideoTracks()[0];
        if (peerConnectionRef.current && localStreamRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(s => 
            s.track?.kind === 'video'
          );
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        }
        
        setIsScreenSharing(true);
      } else {
        // Restore camera video
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
          screenStreamRef.current = null;
        }
        
        if (peerConnectionRef.current && localStreamRef.current) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          const sender = peerConnectionRef.current.getSenders().find(s => 
            s.track?.kind === 'video'
          );
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack);
          }
        }
        
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error('Failed to toggle screen share:', err);
      setError('Failed to toggle screen sharing.');
    }
  };

  const handleEndCall = () => {
    // If we are initiator and socket exists, inform receiver even if not in room
    if (isInitiator && socketRef.current) {
      socketRef.current.emit('cancel-call', { targetUserId: otherUserId, appointmentId });
    }
    cleanupCall();
    onClose();
  };

  const cleanupCall = () => {
    // Stop all tracks
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    remoteStreamRef.current?.getTracks().forEach(track => track.stop());
    screenStreamRef.current?.getTracks().forEach(track => track.stop());
    
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
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setIsRecording(false);
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
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-gray-900 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h3 className="text-lg font-semibold">Video Call</h3>
              <p className="text-sm text-gray-300">
                {isConnected ? `Connected • ${formatDuration(callDuration)}` : 'Connecting...'}
              </p>
            </div>
            <button
              onClick={handleEndCall}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="absolute top-20 left-4 right-4 z-20 bg-red-600 text-white p-3 rounded-lg text-center">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Video Grid */}
        <div className="relative w-full h-full">
          {/* Remote Video (Main) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute top-20 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff size={32} className="text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6">
          <div className="flex items-center justify-center gap-4">
            {/* Mute/Unmute */}
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full transition-colors ${
                isMuted ? 'bg-red-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            {/* Video On/Off */}
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-colors ${
                isVideoOff ? 'bg-red-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>

            {/* Screen Share */}
            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-full transition-colors ${
                isScreenSharing ? 'bg-blue-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {isScreenSharing ? <MonitorOff size={24} /> : <Monitor size={24} />}
            </button>

            {/* Settings */}
            <button className="p-4 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
              <Settings size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
