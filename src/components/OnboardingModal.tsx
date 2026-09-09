import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Heart, Clock, Compass, Calendar, Bell, Volume2, ShieldCheck, LogIn } from 'lucide-react';
import { UserPreferences, ReminderSettings } from '../types';
import { soundEngine } from '../services/soundEngine';
import { requestBrowserNotificationPermission } from '../services/calendarService';
import type { User as FirebaseUser } from 'firebase/auth';

interface OnboardingModalProps {
  initialPreferences: UserPreferences;
  onComplete: (prefs: UserPreferences) => void;
  currentUser?: FirebaseUser | null;
  onGoogleLogin?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialPreferences,
  onComplete,
  currentUser,
  onGoogleLogin,
}) => {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>(initialPreferences.name || '');
  const [checkInTime, setCheckInTime] = useState<UserPreferences['checkInTime']>(
    initialPreferences.checkInTime || 'evening'
  );
  const [goals, setGoals] = useState<string[]>(initialPreferences.goals || ['Calm', 'Stress Management']);
  const [interests, setInterests] = useState<string[]>(
    initialPreferences.interests || ['Walking', 'Music', 'Art']
  );
  const [activityTypes, setActivityTypes] = useState<string[]>(
    initialPreferences.activityTypes || ['Guided practice', 'Movement', 'Creative activities']
  );

  // Reminder settings state
  const [reminderFrequency, setReminderFrequency] = useState<'daily' | 'weekly'>(
    initialPreferences.reminderSettings?.frequency || 'daily'
  );
  const [preferredTime, setPreferredTime] = useState<string>(
    initialPreferences.reminderSettings?.preferredTime || '08:30'
  );
  const [alarmSoundEnabled, setAlarmSoundEnabled] = useState<boolean>(
    initialPreferences.reminderSettings?.alarmSoundEnabled ?? true
  );
  const [browserNotificationEnabled, setBrowserNotificationEnabled] = useState<boolean>(
    initialPreferences.reminderSettings?.browserNotificationEnabled ?? false
  );
  const [googleCalendarEnabled, setGoogleCalendarEnabled] = useState<boolean>(
    initialPreferences.reminderSettings?.googleCalendarEnabled ?? true
  );
  const [isTestingChime, setIsTestingChime] = useState<boolean>(false);

  const goalOptions = [
    'Calm & Ease',
    'Stress Management',
    'Mental Focus',
    'Better Sleep',
    'Physical Energy',
    'Emotional Balance',
  ];

  const interestOptions = [
    'Walking & Nature',
    'Music & Sound',
    'Visual Art & Mandala',
    'Reading & Journaling',
    'Gentle Yoga & Stretch',
    'Cooking & Tea',
    'Photography',
    'Crafts & Building',
  ];

  const activityOptions = [
    { label: 'Guided practice', desc: 'Breathwork & calming meditation' },
    { label: 'Independent learning', desc: 'DIY mindful skills & micro-activities' },
    { label: 'Movement', desc: 'Somatic walks, stretching, and mobility' },
    { label: 'Creative activities', desc: 'Art, free-writing, and acoustic music' },
    { label: 'Social activities', desc: 'Community workshops & micro-connections' },
  ];

  const toggleItem = (list: string[], item: string, setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      if (list.length > 1) {
        setList(list.filter((i) => i !== item));
      }
    } else {
      setList([...list, item]);
    }
  };

  const handleTestChime = () => {
    setIsTestingChime(true);
    soundEngine.playReminderAlarm();
    setTimeout(() => setIsTestingChime(false), 2500);
  };

  const handleEnableNotification = async () => {
    const res = await requestBrowserNotificationPermission();
    if (res === 'granted') {
      setBrowserNotificationEnabled(true);
    } else {
      alert('Notification permissions are currently blocked in your browser. You can enable them in browser site settings.');
    }
  };

  const handleFinish = () => {
    const reminderSettings: ReminderSettings = {
      enabled: true,
      frequency: reminderFrequency,
      preferredTime,
      alarmSoundEnabled,
      browserNotificationEnabled,
      googleCalendarEnabled,
      googleCalendarEventId: initialPreferences.reminderSettings?.googleCalendarEventId,
      googleCalendarEventLink: initialPreferences.reminderSettings?.googleCalendarEventLink,
      lastCalendarSync: initialPreferences.reminderSettings?.lastCalendarSync,
    };

    const updated: UserPreferences = {
      name: name.trim() || 'Friend',
      checkInTime,
      goals,
      interests,
      activityTypes,
      soundEnabled: true,
      onboarded: true,
      reminderSettings,
    };
    onComplete(updated);
  };

  return (
    <div
      id="onboarding-overlay"
      className="fixed inset-0 z-50 bg-[#2D2D2D]/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="onboarding-card"
        className="w-full max-w-md bg-[#FBF9F6] rounded-[36px] shadow-2xl border border-[#F0EDE8] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-300"
      >
        {/* Progress Bar Header */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between text-[11px] text-[#A69D91] mb-2 font-semibold uppercase tracking-wider">
            <span>Step {step} of 5</span>
            <span>Mindful Onboarding</span>
          </div>
          <div className="w-full bg-[#E8E2D9] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#5A6E5A] h-full transition-all duration-300 ease-out"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Welcome & Name */}
        {step === 1 && (
          <div className="p-6 pt-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F0E8] text-[#5A6E5A] flex items-center justify-center mb-4 border border-[#C8DACB]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-light text-[#4A5D4A] mb-2">
              How are you feeling?
            </h2>
            <p className="text-xs sm:text-sm text-[#7E7468] leading-relaxed mb-6">
              Let’s figure out what you need. Mindful Companion is your personal space to pause, reflect, and discover small, meaningful actions.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#A69D91] uppercase tracking-wider mb-2">
                  What should we call you?
                </label>
                <input
                  id="onboarding-input-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name (e.g., Alex)"
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border border-[#F0EDE8] text-[#2D2D2D] placeholder-[#A69D91] focus:outline-none focus:ring-2 focus:ring-[#5A6E5A]/30 focus:border-[#5A6E5A] text-sm transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#A69D91] uppercase tracking-wider mb-2">
                  Preferred daily check-in time
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(
                    [
                      { id: 'morning', label: 'Morning', time: '8:00 AM' },
                      { id: 'afternoon', label: 'Afternoon', time: '1:00 PM' },
                      { id: 'evening', label: 'Evening', time: '7:00 PM' },
                      { id: 'night', label: 'Night', time: '10:00 PM' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCheckInTime(t.id)}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        checkInTime === t.id
                          ? 'bg-[#5A6E5A] text-white border-[#5A6E5A] shadow-sm'
                          : 'bg-white text-[#2D2D2D] border-[#F0EDE8] hover:bg-[#F5F2ED]'
                      }`}
                    >
                      <div className="text-sm font-medium">{t.label}</div>
                      <div
                        className={`text-xs ${
                          checkInTime === t.id ? 'text-[#E8F0E8]' : 'text-[#7E7468]'
                        }`}
                      >
                        {t.time}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              id="onboarding-btn-step1-next"
              type="button"
              onClick={() => setStep(2)}
              className="mt-8 w-full py-4 px-6 rounded-2xl bg-[#5A6E5A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#4A5D4A] active:scale-[0.99] transition-all shadow-md shadow-[#5A6E5A]/25"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: What they want to improve */}
        {step === 2 && (
          <div className="p-6 pt-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F0E8] text-[#5A6E5A] flex items-center justify-center mb-4 border border-[#C8DACB]">
              <Heart className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-light text-[#4A5D4A] mb-2">
              What would you like to cultivate?
            </h2>
            <p className="text-xs sm:text-sm text-[#7E7468] leading-relaxed mb-5">
              Select the areas you’d most like to support right now.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {goalOptions.map((g) => {
                const selected = goals.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleItem(goals, g, setGoals)}
                    className={`p-3.5 rounded-2xl text-left border flex items-center justify-between text-sm font-medium transition-all ${
                      selected
                        ? 'bg-[#5A6E5A] text-white border-[#5A6E5A] shadow-sm'
                        : 'bg-white text-[#2D2D2D] border-[#F0EDE8] hover:bg-[#F5F2ED]'
                    }`}
                  >
                    <span>{g}</span>
                    {selected && <Check className="w-4 h-4 text-[#E8F0E8] flex-shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3.5 px-5 rounded-2xl border border-[#F0EDE8] bg-white text-[#7E7468] text-sm font-medium hover:bg-[#F5F2ED] transition-all"
              >
                Back
              </button>
              <button
                id="onboarding-btn-step2-next"
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#5A6E5A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#4A5D4A] active:scale-[0.99] transition-all shadow-md shadow-[#5A6E5A]/25"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Interests & Hobbies */}
        {step === 3 && (
          <div className="p-6 pt-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F0E8] text-[#5A6E5A] flex items-center justify-center mb-4 border border-[#C8DACB]">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-light text-[#4A5D4A] mb-2">
              Your Interests & Hobbies
            </h2>
            <p className="text-xs sm:text-sm text-[#7E7468] leading-relaxed mb-5">
              Wellbeing is more than sitting in silence. We recommend creative, tactile, and outdoor micro-practices tailored to what you enjoy.
            </p>

            <div className="flex flex-wrap gap-2">
              {interestOptions.map((item) => {
                const selected = interests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleItem(interests, item, setInterests)}
                    className={`py-2 px-3.5 rounded-full text-xs font-medium border transition-all ${
                      selected
                        ? 'bg-[#5A6E5A] text-white border-[#5A6E5A] shadow-sm'
                        : 'bg-white text-[#7E7468] border-[#F0EDE8] hover:bg-[#F5F2ED]'
                    }`}
                  >
                    {selected ? `✓ ${item}` : item}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3.5 px-5 rounded-2xl border border-[#F0EDE8] bg-white text-[#7E7468] text-sm font-medium hover:bg-[#F5F2ED] transition-all"
              >
                Back
              </button>
              <button
                id="onboarding-btn-step3-next"
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#5A6E5A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#4A5D4A] active:scale-[0.99] transition-all shadow-md shadow-[#5A6E5A]/25"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Preferred Activity Types */}
        {step === 4 && (
          <div className="p-6 pt-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F0E8] text-[#5A6E5A] flex items-center justify-center mb-4 border border-[#C8DACB]">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-light text-[#4A5D4A] mb-2">
              Preferred Activity Types
            </h2>
            <p className="text-xs sm:text-sm text-[#7E7468] leading-relaxed mb-4">
              How do you like to reset your mind and body?
            </p>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {activityOptions.map((act) => {
                const selected = activityTypes.includes(act.label);
                return (
                  <button
                    key={act.label}
                    type="button"
                    onClick={() => toggleItem(activityTypes, act.label, setActivityTypes)}
                    className={`w-full p-3.5 rounded-2xl text-left border transition-all flex items-start justify-between ${
                      selected
                        ? 'bg-[#5A6E5A] text-white border-[#5A6E5A] shadow-sm'
                        : 'bg-white text-[#2D2D2D] border-[#F0EDE8] hover:bg-[#F5F2ED]'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-medium">{act.label}</div>
                      <div
                        className={`text-xs mt-0.5 ${
                          selected ? 'text-[#E8F0E8]' : 'text-[#7E7468]'
                        }`}
                      >
                        {act.desc}
                      </div>
                    </div>
                    {selected && <Check className="w-4 h-4 text-[#E8F0E8] flex-shrink-0 ml-2 mt-0.5" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-3.5 px-5 rounded-2xl border border-[#F0EDE8] bg-white text-[#7E7468] text-sm font-medium hover:bg-[#F5F2ED] transition-all"
              >
                Back
              </button>
              <button
                id="onboarding-btn-step4-next"
                type="button"
                onClick={() => setStep(5)}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#5A6E5A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#4A5D4A] active:scale-[0.99] transition-all shadow-md shadow-[#5A6E5A]/25"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Mindful Reminders, Alarm & Google Calendar */}
        {step === 5 && (
          <div className="p-6 pt-4 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F0E8] text-[#5A6E5A] flex items-center justify-center mb-1 border border-[#C8DACB]">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-light text-[#4A5D4A]">
                Mindful Reminders & Schedule
              </h2>
              <p className="text-xs sm:text-sm text-[#7E7468] leading-relaxed mt-1">
                Establish a consistent rhythm. We'll remind you to check in with your mood, progress on goals, and suggest next steps.
              </p>
            </div>

            {/* Frequency Selection */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-[#A69D91] uppercase tracking-wider">
                How often would you like to check in?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReminderFrequency('daily')}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border transition-all ${
                    reminderFrequency === 'daily'
                      ? 'bg-[#5A6E5A] text-white border-[#5A6E5A] shadow-xs'
                      : 'bg-white text-[#7E7468] border-[#F0EDE8] hover:bg-[#F5F2ED]'
                  }`}
                >
                  Daily Pause (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setReminderFrequency('weekly')}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border transition-all ${
                    reminderFrequency === 'weekly'
                      ? 'bg-[#5A6E5A] text-white border-[#5A6E5A] shadow-xs'
                      : 'bg-white text-[#7E7468] border-[#F0EDE8] hover:bg-[#F5F2ED]'
                  }`}
                >
                  Weekly Reflection
                </button>
              </div>
            </div>

            {/* Preferred Time of Day */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-semibold text-[#A69D91] uppercase tracking-wider">
                  Preferred Reminder Time
                </label>
                <input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="px-2 py-1 rounded-xl bg-white border border-[#E8E2D9] text-xs font-semibold text-[#5A6E5A] focus:outline-none focus:ring-1 focus:ring-[#5A6E5A]"
                />
              </div>

              {/* Quick Time Presets */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { time: '08:30', label: '🌅 8:30 AM (Morning Spark)' },
                  { time: '13:00', label: '☀️ 1:00 PM (Midday Reset)' },
                  { time: '20:30', label: '🌙 8:30 PM (Evening Wind-Down)' },
                ].map((preset) => (
                  <button
                    key={preset.time}
                    type="button"
                    onClick={() => setPreferredTime(preset.time)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
                      preferredTime === preset.time
                        ? 'bg-[#5A6E5A] text-white border-[#5A6E5A]'
                        : 'bg-white text-[#7E7468] border-[#F0EDE8] hover:bg-[#F5F2ED]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alarm Chime & Browser Notifications Settings */}
            <div className="space-y-2 pt-1">
              <div className="p-3.5 rounded-2xl bg-white border border-[#F0EDE8] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E8F0E8] text-[#5A6E5A] flex items-center justify-center flex-shrink-0">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#2D2D2D]">Mindful Singing Bowl Chime</div>
                    <div className="text-[11px] text-[#7E7468]">Gentle alarm tone at reminder time</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestChime}
                    disabled={isTestingChime}
                    className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-[#F5F2ED] hover:bg-[#E8E2D9] text-[#5A6E5A] border border-[#E8E2D9] transition-all cursor-pointer"
                  >
                    {isTestingChime ? 'Chiming...' : 'Preview'}
                  </button>
                  <input
                    type="checkbox"
                    checked={alarmSoundEnabled}
                    onChange={(e) => setAlarmSoundEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#5A6E5A] rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Browser Notification */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#F0EDE8] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E8F0E8] text-[#5A6E5A] flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#2D2D2D]">Device / Browser Notification</div>
                    <div className="text-[11px] text-[#7E7468]">Push notification with link to app</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleEnableNotification}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    browserNotificationEnabled
                      ? 'bg-[#E8F0E8] text-[#5A6E5A] border border-[#C8DACB]'
                      : 'bg-[#5A6E5A] text-white'
                  }`}
                >
                  {browserNotificationEnabled ? '✓ Enabled' : 'Enable'}
                </button>
              </div>

              {/* Google Calendar Provision */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8E2D9] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#E8F0E8] text-[#5A6E5A] flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#2D2D2D]">Google Calendar Reminder</div>
                      <div className="text-[11px] text-[#7E7468]">Adds event with 1-click app opener</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={googleCalendarEnabled}
                    onChange={(e) => setGoogleCalendarEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#5A6E5A] rounded cursor-pointer"
                  />
                </div>

                {currentUser ? (
                  <div className="text-[11px] text-[#5A6E5A] bg-[#E8F0E8] p-2 rounded-xl flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Signed in as {currentUser.email}. Will sync to your Google Calendar.</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-[#7E7468] bg-[#FBF9F6] p-2 rounded-xl flex items-center justify-between gap-2 border border-[#F0EDE8]">
                    <span>Sign in with Google to sync directly to Calendar</span>
                    {onGoogleLogin && (
                      <button
                        type="button"
                        onClick={onGoogleLogin}
                        className="py-1 px-2.5 rounded-lg bg-[#5A6E5A] text-white text-[10px] font-semibold flex items-center gap-1 flex-shrink-0 hover:bg-[#4A5D4A]"
                      >
                        <LogIn className="w-3 h-3" />
                        <span>Sign In</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-2">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="py-3.5 px-5 rounded-2xl border border-[#F0EDE8] bg-white text-[#7E7468] text-sm font-medium hover:bg-[#F5F2ED] transition-all"
              >
                Back
              </button>
              <button
                id="onboarding-btn-finish"
                type="button"
                onClick={handleFinish}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#5A6E5A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#4A5D4A] active:scale-[0.99] transition-all shadow-md shadow-[#5A6E5A]/25"
              >
                <span>Enter Companion</span>
                <Check className="w-4 h-4 text-[#E8F0E8]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
