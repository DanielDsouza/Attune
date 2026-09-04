import React, { useState } from 'react';
import { User, Volume2, VolumeX, Sparkles, RefreshCw, Trash2, Check, Clock, Heart, Compass } from 'lucide-react';
import { UserPreferences } from '../types';

interface ProfileViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  onRetakeOnboarding: () => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  preferences,
  onUpdatePreferences,
  onRetakeOnboarding,
  onResetSampleData,
  onClearAllData,
}) => {
  const [name, setName] = useState<string>(preferences.name || '');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(preferences.soundEnabled ?? true);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const handleSave = () => {
    onUpdatePreferences({
      ...preferences,
      name: name.trim() || 'Friend',
      soundEnabled,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div id="profile-view-container" className="space-y-6 pb-24 max-w-lg mx-auto px-4 pt-2">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6E5A] uppercase tracking-wider mb-1">
          <User className="w-4 h-4 text-[#5A6E5A]" />
          <span>Personal Preferences</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#4A5D4A]">
          Your Profile & Focus
        </h2>
        <p className="text-xs sm:text-sm text-[#7E7468] mt-1 leading-relaxed">
          Manage how your companion tailors recommendations to your lifestyle.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <div className="p-5 sm:p-6 rounded-[28px] bg-white border border-[#F0EDE8] shadow-sm space-y-4">
        <div>
          <label className="block text-[10px] font-semibold text-[#A69D91] uppercase tracking-wider mb-1.5">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-2xl bg-[#F5F2ED] border border-[#E8E2D9] text-sm text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#5A6E5A]/30"
          />
        </div>

        {/* Check-in time preference */}
        <div>
          <label className="block text-[10px] font-semibold text-[#A69D91] uppercase tracking-wider mb-1.5">
            Preferred Daily Check-In Time
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: 'morning', label: 'Morning (8:00 AM)' },
                { id: 'afternoon', label: 'Afternoon (1:00 PM)' },
                { id: 'evening', label: 'Evening (7:00 PM)' },
                { id: 'night', label: 'Night (10:00 PM)' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onUpdatePreferences({ ...preferences, checkInTime: t.id });
                }}
                className={`p-2.5 rounded-xl text-xs font-medium border transition-all ${
                  preferences.checkInTime === t.id
                    ? 'bg-[#5A6E5A] text-white border-[#5A6E5A] shadow-sm'
                    : 'bg-[#F5F2ED] text-[#7E7468] border-[#E8E2D9] hover:bg-[#E8E2D9]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sound toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F0EDE8]">
          <div>
            <div className="text-xs font-semibold text-[#2D2D2D]">Tibetan Singing Bowl & Breath Chimes</div>
            <div className="text-[11px] text-[#A69D91]">Synthesized ambient audio cues during practices</div>
          </div>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-[#5A6E5A] text-white border-[#5A6E5A]'
                : 'bg-[#F5F2ED] text-[#7E7468] border-[#E8E2D9]'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#5A6E5A] text-white font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-[#4A5D4A] transition-all shadow-md shadow-[#5A6E5A]/25"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>

        {savedNotice && (
          <div className="text-center text-xs text-[#5A6E5A] font-semibold animate-in fade-in">
            ✓ Preferences saved successfully!
          </div>
        )}
      </div>

      {/* Current Focus & Interests Summary */}
      <div className="p-5 rounded-[28px] bg-white border border-[#F0EDE8] shadow-sm space-y-3 text-xs">
        <div className="font-semibold text-[#2D2D2D]">Your Cultivation Focus</div>
        <div className="flex flex-wrap gap-1.5">
          {preferences.goals?.map((g) => (
            <span key={g} className="px-3 py-1 rounded-full bg-[#F5F2ED] border border-[#E8E2D9] text-[#7E7468] font-medium">
              {g}
            </span>
          ))}
        </div>

        <div className="font-semibold text-[#2D2D2D] pt-2">Saved Interests</div>
        <div className="flex flex-wrap gap-1.5">
          {preferences.interests?.map((i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-[#F5F2ED] border border-[#E8E2D9] text-[#7E7468] font-medium">
              {i}
            </span>
          ))}
        </div>
      </div>

      {/* Demo & Reset Controls */}
      <div className="p-5 rounded-[28px] bg-white border border-[#F0EDE8] shadow-sm space-y-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#A69D91]">
          Prototype Demo Controls
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={onRetakeOnboarding}
            className="w-full py-2.5 px-4 rounded-xl border border-[#F0EDE8] bg-[#F5F2ED] text-xs font-medium text-[#7E7468] hover:bg-[#E8E2D9] hover:text-[#2D2D2D] transition-all text-left flex items-center justify-between"
          >
            <span>Retake Welcome Onboarding Flow</span>
            <Sparkles className="w-3.5 h-3.5 text-[#5A6E5A]" />
          </button>

          <button
            type="button"
            onClick={onResetSampleData}
            className="w-full py-2.5 px-4 rounded-xl border border-[#F0EDE8] bg-[#F5F2ED] text-xs font-medium text-[#7E7468] hover:bg-[#E8E2D9] hover:text-[#2D2D2D] transition-all text-left flex items-center justify-between"
          >
            <span>Reload 6-Day Sample Journey (For Testing Insights)</span>
            <RefreshCw className="w-3.5 h-3.5 text-[#5A6E5A]" />
          </button>

          <button
            type="button"
            onClick={onClearAllData}
            className="w-full py-2.5 px-4 rounded-xl border border-[#F0EDE8] bg-[#F5F2ED] text-xs font-medium text-[#7E7468] hover:bg-[#E8E2D9] hover:text-[#2D2D2D] transition-all text-left flex items-center justify-between"
          >
            <span>Clear Local Storage & Reset Fresh</span>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
