import React from 'react';
import { TabId } from '../types';

interface BottomNavProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

const NAV_ITEMS: Array<{ id: TabId; label: string; icon: string }> = [
  { id: 'my-day', label: 'My Day', icon: 'wb_sunny' },
  { id: 'upcoming', label: 'Upcoming', icon: 'calendar_today' },
  { id: 'lists-and-projects', label: 'Lists', icon: 'folder' },
  { id: 'completed', label: 'Done', icon: 'check_circle' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-0 left-0 right-0 w-full z-40 pb-safe bg-surface/85 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.04)]"
    >
      <div className="h-16 max-w-[680px] mx-auto px-2 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors gap-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] ${
                  isActive ? 'material-symbols-filled' : ''
                }`}
              >
                {item.icon}
              </span>
              <span className="text-label-sm">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
