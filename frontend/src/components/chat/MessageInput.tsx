import React, { useState } from 'react';

type Props = {
  onSend: (content: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
};

export default function MessageInput({ onSend, onTypingStart, onTypingStop }: Props) {
  const [text, setText] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    onSend(content);
    setText('');
  }

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white p-3">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={onTypingStart}
        onBlur={onTypingStop}
        placeholder="Type a message"
        className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
      />
    </form>
  );
}


