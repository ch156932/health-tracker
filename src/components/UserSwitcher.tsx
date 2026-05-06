import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store/useStore';

export default function UserSwitcher() {
  const { users, currentUser, switchUser } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
      <span className="text-base font-semibold text-gray-800">健康生活</span>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-sm font-medium text-green-700"
        >
          <span>{currentUser?.avatar}</span>
          <span>{currentUser?.name}</span>
          <ChevronDown size={14} />
        </button>
        {open && (
          <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-40">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => { switchUser(user.id); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 ${
                  user.id === currentUser?.id ? 'text-green-600 bg-green-50' : 'text-gray-700'
                }`}
              >
                <span>{user.avatar}</span>
                <span>{user.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
