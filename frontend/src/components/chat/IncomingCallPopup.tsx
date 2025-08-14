import { createPortal } from 'react-dom';
// No React default import required
import { Phone, Video, PhoneOff, PhoneCall } from 'lucide-react';

interface IncomingCallPopupProps {
  isOpen: boolean;
  callerName: string;
  callType: 'VIDEO' | 'AUDIO';
  appointmentId: number;
  onAccept: () => void;
  onDecline: () => void;
}

const IncomingCallPopup: React.FC<IncomingCallPopupProps> = ({
  isOpen,
  callerName,
  callType,
  appointmentId,
  onAccept,
  onDecline
}) => {
  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="text-center">
          {/* Call Icon */}
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            {callType === 'VIDEO' ? (
              <Video className="w-8 h-8 text-green-600" />
            ) : (
              <Phone className="w-8 h-8 text-green-600" />
            )}
          </div>

          {/* Caller Info */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Incoming {callType === 'VIDEO' ? 'Video' : 'Audio'} Call
          </h3>
          <p className="text-gray-600 mb-1">{callerName}</p>
          <p className="text-sm text-gray-500 mb-6">Appointment #{appointmentId}</p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onDecline}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <PhoneOff size={20} />
              Decline
            </button>
            <button
              onClick={onAccept}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <PhoneCall size={20} />
              Accept
            </button>
          </div>

          {/* Call Status */}
          <div className="mt-4 text-xs text-gray-500">
            <p>This call is for your scheduled appointment</p>
            <p>Please ensure you're in a quiet, private location</p>
          </div>
        </div>
      </div>
    </div>
  );

  const root = typeof document !== 'undefined' ? document.body : null;
  return root ? createPortal(content, root) : content;
};

export default IncomingCallPopup;
