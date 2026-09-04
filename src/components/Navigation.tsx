import React from 'react';
import { Home, Compass, BarChart3, User, Sparkles } from 'lucide-react';

interface NavigationProps {
  currentTab: 'home' | 'explore' | 'progress' | 'profile';
  onSelectTab: (tab: 'home' | 'explore' | 'progress' | 'profile') => void;
  onOpenCheckIn: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenCheckIn,
}) => {
  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F0EDE8] px-4 pb-2 pt-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]"
    >
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* Home Tab */}
        <button
          id="nav-tab-home"
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all duration-200 ${
            currentTab === 'home'
              ? 'text-[#5A6E5A] font-semibold'
              : 'text-[#A69D91] hover:text-[#5A6E5A]'
          }`}
        >
          {currentTab === 'home' ? (
            <div className="w-1.5 h-1.5 rounded-full bg-[#5A6E5A] mb-1"></div>
          ) : (
            <Home className="w-5 h-5 mb-0.5 stroke-2" />
          )}
          <span className="text-[9px] uppercase tracking-wider font-bold">Home</span>
        </button>

        {/* Explore Tab */}
        <button
          id="nav-tab-explore"
          type="button"
          onClick={() => onSelectTab('explore')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all duration-200 ${
            currentTab === 'explore'
              ? 'text-[#5A6E5A] font-semibold'
              : 'text-[#A69D91] hover:text-[#5A6E5A]'
          }`}
        >
          {currentTab === 'explore' ? (
            <div className="w-1.5 h-1.5 rounded-full bg-[#5A6E5A] mb-1"></div>
          ) : (
            <Compass className="w-5 h-5 mb-0.5 stroke-2" />
          )}
          <span className="text-[9px] uppercase tracking-wider font-bold">Explore</span>
        </button>

        {/* Prominent Center Check In Action */}
        <div className="relative -top-6 flex flex-col items-center">
          <button
            id="nav-action-checkin-prominent"
            type="button"
            onClick={onOpenCheckIn}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-[#5A6E5A] text-white shadow-xl shadow-[#5A6E5A]/30 hover:bg-[#4A5D4A] active:scale-95 transition-all duration-200 border-4 border-white"
            title="Start Daily Check-In"
            aria-label="Start Daily Check-In"
          >
            <Sparkles className="w-6 h-6 text-[#E8F0E8]" />
          </button>
          <span className="text-[9px] uppercase tracking-wider font-bold text-[#5A6E5A] mt-1">Check In</span>
        </div>

        {/* Progress Tab */}
        <button
          id="nav-tab-progress"
          type="button"
          onClick={() => onSelectTab('progress')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all duration-200 ${
            currentTab === 'progress'
              ? 'text-[#5A6E5A] font-semibold'
              : 'text-[#A69D91] hover:text-[#5A6E5A]'
          }`}
        >
          {currentTab === 'progress' ? (
            <div className="w-1.5 h-1.5 rounded-full bg-[#5A6E5A] mb-1"></div>
          ) : (
            <BarChart3 className="w-5 h-5 mb-0.5 stroke-2" />
          )}
          <span className="text-[9px] uppercase tracking-wider font-bold">Stats</span>
        </button>

        {/* Profile Tab */}
        <button
          id="nav-tab-profile"
          type="button"
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all duration-200 ${
            currentTab === 'profile'
              ? 'text-[#5A6E5A] font-semibold'
              : 'text-[#A69D91] hover:text-[#5A6E5A]'
          }`}
        >
          {currentTab === 'profile' ? (
            <div className="w-1.5 h-1.5 rounded-full bg-[#5A6E5A] mb-1"></div>
          ) : (
            <User className="w-5 h-5 mb-0.5 stroke-2" />
          )}
          <span className="text-[9px] uppercase tracking-wider font-bold">Me</span>
        </button>
      </div>
    </nav>
  );
};
