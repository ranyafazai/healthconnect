import { useEffect, useRef } from 'react';
import { useAppSelector } from '../../Redux/hooks';
import type { Message } from '../../types/data/message';
import MessageDisplay from './MessageDisplay';

type Props = {
  items: Message[];
  currentUserId?: number | string | null;
};

export default function MessageList({ items, currentUserId }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const currentUser = useAppSelector(state => state.auth.user as any);
  
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [items]);

  return (
    <div ref={ref} className="flex-1 overflow-y-auto bg-slate-50 px-4 py-3">
      {items.map((message) => {
        const isOwnMessage = String(message.senderId) === String(currentUserId ?? '');
        return (
          <MessageDisplay
            key={message.id}
            message={message}
            currentUser={currentUser!}
            isOwnMessage={isOwnMessage}
          />
        );
      })}
    </div>
  );
}


