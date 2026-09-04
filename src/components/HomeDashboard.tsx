import React from 'react';
import { Sparkles, Battery, AlertCircle, Smile, Flame, Play, Clock, ArrowRight, Compass, RefreshCw } from 'lucide-react';
import { UserPreferences, EmotionalState, RecommendationResult, Practice } from '../types';
import { RecommendationCard } from './RecommendationCard';

interface HomeDashboardProps {
  preferences: UserPreferences;
  currentState: EmotionalState;
  recommendation: RecommendationResult;
  streakDays: number;
  onOpenCheckIn: () => void;
  onStartPractice: (practice: Practice) => void;
  onNotWhatINeed: () => void;
  onGoToExplore: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  preferences,
  currentState,
  recommendation,
  streakDays,
  onOpenCheckIn,
  onStartPractice,
  onNotWhatINeed,
  onGoToExplore,
}) => {
  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  };

  const greeting = getGreeting();
  const userName = preferences.name || 'Friend';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div id="home-dashboard-container" className="space-y-6 pb-24 max-w-md mx-auto px-1 pt-1">
      {/* Top Greeting & Cultural Avatar Header */}
      <header className="pt-2 pb-1">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#A69D91] font-semibold mb-1">
              Welcome Back
            </h2>
            <h1 className="text-2xl sm:text-3xl font-serif font-light text-[#4A5D4A]">
              {greeting}, {userName}
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E8E2D9] border-2 border-white flex items-center justify-center text-[#5A6E5A] font-bold shadow-sm">
            {userInitial}
          </div>
        </div>
      </header>

      {/* Current State Summary Card */}
      <section className="bg-[#FBF9F6] p-5 rounded-[32px] border border-[#F0EDE8] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A69D91]">
              Current State
            </h3>
            <button
              id="home-btn-recheckin"
              type="button"
              onClick={onOpenCheckIn}
              className="text-[11px] text-[#5A6E5A] font-semibold hover:underline flex items-center gap-1 ml-1"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Update</span>
            </button>
          </div>
          <span className="text-[10px] bg-[#E8F0E8] text-[#5A6E5A] px-2.5 py-1 rounded-full font-semibold">
            {streakDays} Day Streak
          </span>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center bg-white p-3 rounded-2xl shadow-sm border border-[#F0EDE8]">
            <span className="text-lg mb-1">🔋</span>
            <span className="text-[10px] text-[#A69D91] uppercase tracking-wider font-semibold">Energy</span>
            <span className="font-bold text-sm text-[#2D2D2D] mt-0.5">{currentState.energy}/5</span>
          </div>

          <div className="flex flex-col items-center bg-white p-3 rounded-2xl shadow-sm border border-[#F0EDE8]">
            <span className="text-lg mb-1">🌪️</span>
            <span className="text-[10px] text-[#A69D91] uppercase tracking-wider font-semibold">Stress</span>
            <span className="font-bold text-sm text-[#2D2D2D] mt-0.5">{currentState.stress}/5</span>
          </div>

          <div className="flex flex-col items-center bg-white p-3 rounded-2xl shadow-sm border border-[#F0EDE8]">
            <span className="text-lg mb-1">☁️</span>
            <span className="text-[10px] text-[#A69D91] uppercase tracking-wider font-semibold">Mood</span>
            <span className="font-bold text-xs text-[#2D2D2D] mt-0.5 truncate max-w-full">
              {currentState.moodLabel.split('/')[0].trim()}
            </span>
          </div>
        </div>

        {/* What happened note */}
        {currentState.whatHappened && (
          <p className="text-xs text-[#7E7468] italic bg-white/80 p-3 rounded-2xl border border-[#F0EDE8] leading-relaxed">
            "{currentState.whatHappened}"
          </p>
        )}
      </section>

      {/* Recommended Practice Section */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-[#2D2D2D] px-1">
          Your Personal Reset
        </h3>
        <RecommendationCard
          recommendation={recommendation}
          currentState={currentState}
          onStartPractice={() => onStartPractice(recommendation.practice)}
          onNotWhatINeed={onNotWhatINeed}
          onCheckInAgain={onOpenCheckIn}
        />
      </section>

      {/* Alternative Explore Organic Banner */}
      <section
        onClick={onGoToExplore}
        className="bg-[#5A6E5A] p-4 rounded-[24px] text-white flex items-center justify-between shadow-md hover:bg-[#4A5D4A] transition-all cursor-pointer group"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg shadow-inner">
            🎨
          </div>
          <div>
            <p className="text-xs font-semibold">Feeling restless?</p>
            <p className="text-[11px] text-[#E8F0E8] opacity-90">Try Mandala Art & beyond meditation</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
      </section>
    </div>
  );
};
