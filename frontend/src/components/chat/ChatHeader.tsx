import React from 'react';

type Props = {
  name: string;
  subtitle?: string;
  onCall?: () => void;
  onVideo?: () => void;
};

export default function ChatHeader({ name, subtitle, onCall, onVideo }: Props) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3 bg-white">
      <div>
        <div className="font-semibold text-gray-900">{name}</div>
        {subtitle ? (
          <div className="text-xs text-gray-500">{subtitle}</div>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label="Audio call"
          onClick={onCall}
          className="rounded-full p-2 hover:bg-gray-100"
        >
          📞
        </button>
        <button
          aria-label="Video call"
          onClick={onVideo}
          className="rounded-full p-2 hover:bg-gray-100"
        >
          🎥
        </button>
      </div>
    </div>
  );
}


