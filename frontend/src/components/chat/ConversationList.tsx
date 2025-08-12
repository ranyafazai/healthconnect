// No React import needed

export type ConversationLite = {
  id: number;
  name: string;
  lastMessage?: string;
  unreadCount?: number;
};

type Props = {
  items: ConversationLite[];
  onSelect: (id: number) => void;
  selectedId?: number | null;
  onSearch?: (term: string) => void;
};

export default function ConversationList({ items, onSelect, selectedId, onSearch }: Props) {
  return (
    <div className="flex h-full w-72 flex-col border-r bg-white">
      <div className="p-3">
        <input
          placeholder="Search patients..."
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 ${
              selectedId === c.id ? 'bg-gray-50' : ''
            }`}
          >
            <div className="h-8 w-8 rounded-full bg-blue-100 text-center leading-8 text-sm font-semibold text-blue-700">
              {c.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-gray-900">{c.name}</div>
              {c.lastMessage ? (
                <div className="truncate text-xs text-gray-500">{c.lastMessage}</div>
              ) : null}
            </div>
            {c.unreadCount ? (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                {c.unreadCount}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}


