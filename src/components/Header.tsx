import React from 'react';
import { ASSETS } from '../data/initialData';
import { TabId } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface HeaderProps {
  activeTab: TabId;
  onOpenSearch: () => void;
  onOpenInsights: () => void;
  onOpenProfile: () => void;
}

const TAB_TITLES: Record<TabId, string> = {
  'my-day': 'My Day',
  upcoming: 'Upcoming',
  'lists-and-projects': 'Lists & Projects',
  completed: 'Completed',
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenSearch,
  onOpenInsights,
  onOpenProfile,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-40 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 max-w-[680px] mx-auto px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <ImageWithFallback
            src={ASSETS.logo}
            alt="Serene Focus Logo"
            className="h-8 w-8 rounded-lg object-contain flex-shrink-0"
            fallbackIcon="spa"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-label-sm uppercase tracking-wider text-primary leading-none">
              Serene Focus
            </span>
            <h1 className="text-headline-md text-on-surface truncate leading-tight mt-0.5">
              {TAB_TITLES[activeTab]}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search tasks"
            className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[22px]">search</span>
          </button>
          <button
            type="button"
            onClick={onOpenInsights}
            aria-label="Activity and statistics"
            className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[22px]">insights</span>
          </button>
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Profile and workspace settings"
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ImageWithFallback
              src={ASSETS.profileAvatar}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-outline-variant/40"
              fallbackText="SF"
              fallbackClassName="w-8 h-8 rounded-full bg-primary text-on-primary"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
