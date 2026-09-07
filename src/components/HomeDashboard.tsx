import React from 'react';
import { Sparkles, Battery, AlertCircle, Smile, Flame, Play, Clock, ArrowRight, Compass, RefreshCw, Cloud, LogIn } from 'lucide-react';
import { UserPreferences, EmotionalState, RecommendationResult, Practice } from '../types';
import { RecommendationCard } from './RecommendationCard';
import type { User as FirebaseUser } from 'firebase/auth';

interface HomeDashboardProps {
  preferences: UserPreferences;
  currentState: EmotionalState;
  recommendation: RecommendationResult;
  streakDays: number;
  onOpenCheckIn: () => void;
  onStartPractice: (practice: Practice) => void;
  onNotWhatINeed: () => void;
  onGoToExplore: () => void;
  currentUser?: FirebaseUser | null;
  onGoogleLogin?: () => void;
  isSyncing?: boolean;
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
  currentUser,
  onGoogleLogin,
  isSyncing,
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
  const userName = currentUser?.displayName || preferences.name || 'Friend';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div id="home-dashboard-container" className="space-y-6 pb-24 max-w-md mx-auto px-1 pt-1">
      {/* Top Greeting & Cultural Avatar Header */}
      <header className="pt-2 pb-1">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#A69D91] font-semibold">
                {currentUser ? 'Cloud Synced' : 'Welcome Back'}
              </span>
              {currentUser && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-[#E8F0E8] text-[#5A6E5A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5A6E5A] animate-pulse" />
                  Saved
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-light text-[#4A5D4A]">
              {greeting}, {userName.split(' ')[0]}
            </h1>
          </div>

          <div className="relative">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={userName}
                className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm ring-2 ring-[#5A6E5A]/20"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#E8E2D9] border-2 border-white flex items-center justify-center text-[#5A6E5A] font-bold shadow-sm">
                {userInitial}
              </div>
            )}
            {currentUser && (
              <span
                title="Connected & Synced with Firebase"
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#5A6E5A] border-2 border-white flex items-center justify-center"
              >
                <Cloud className="w-2 h-2 text-white" />
              </span>
            )}
          </div>
        </div>

        {/* Non-intrusive Google Sign In Callout if not logged in */}
        {!currentUser && onGoogleLogin && (
          <div className="mt-3 p-3 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <div className="truncate">
                <div className="text-[11px] font-semibold text-[#2D2D2D] leading-tight">
                  Login to Save your Practise
                </div>
                <div className="text-[10px] text-[#7E7468] leading-tight">
                  Sign in with Google so data isn't lost
                </div>
              </div>
            </div>
            <button
              id="home-btn-google-login-pill"
              type="button"
              onClick={onGoogleLogin}
              disabled={isSyncing}
              className="py-1.5 px-3 rounded-xl bg-[#5A6E5A] hover:bg-[#4A5D4A] text-white text-[11px] font-medium flex-shrink-0 transition-all shadow-xs cursor-pointer"
            >
              {isSyncing ? 'Connecting...' : 'Sign in'}
            </button>
          </div>
        )}
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
