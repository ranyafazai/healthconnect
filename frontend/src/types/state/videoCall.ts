import { CallStatus } from "../data/videocall";

export interface VideoCall {
  id: number;
  messageId: number;
  roomId: string;
  status: CallStatus;
  startTime?: string;
  endTime?: string;
}

export interface VideoCallState {
  currentCall: VideoCall | null;
  loading: boolean;
  inCall: boolean;
}
