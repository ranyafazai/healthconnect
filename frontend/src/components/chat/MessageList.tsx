import React, { useEffect, useRef } from 'react';
import type { Message } from '../../types/data/message';

type Props = {
  items: Message[];
  currentUserId?: number | string | null;
};

export default function MessageList({ items, currentUserId }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [items]);

  return (
    <div ref={ref} className="flex-1 overflow-y-auto bg-slate-50 px-4 py-3">
      {items.map((m) => {
        const mine = String(m.senderId) === String(currentUserId ?? '');
        return (
          <div key={m.id} className={`mb-2 flex ${mine ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                mine ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border'
              }`}
            >
              {m.type === 'TEXT' || m.type === 'VIDEO' ? (
                <div>{m.content}</div>
              ) : (
                <div>[{m.type} message]</div>
              )}
              <div className={`mt-1 text-[10px] ${mine ? 'text-blue-100' : 'text-gray-400'}`}>
                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


