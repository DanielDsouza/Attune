import React, { useState } from 'react';
import {
  User,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  Trash2,
  Check,
  Cloud,
  LogOut,
  LogIn,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Bell,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { UserPreferences, ReminderSettings } from '../types';
import { soundEngine } from '../services/soundEngine';
import { requestBrowserNotificationPermission } from '../services/calendarService';
import type { User as FirebaseUser } from 'firebase/auth';

interface ProfileViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  onRetakeOnboarding: () => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
  currentUser?: FirebaseUser | null;
  onGoogleLogin?: () => void;
  onLogout?: () => void;
  isSyncing?: boolean;
  lastSyncedTime?: number | null;
  authError?: string | null;
  onManualSync?: () => void;
  onSyncGoogleCalendar?: (settings: ReminderSettings) => Promise<void>;
  onRemoveGoogleCalendar?: () => Promise<void>;
  isCalendarSyncing?: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  preferences,
  onUpdatePreferences,
  onRetakeOnboarding,
  onResetSampleData,
  onClearAllData,
  currentUser,
  onGoogleLogin,
  onLogout,
  isSyncing = false,
  lastSyncedTime,
  authError,
  onManualSync,
  onSyncGoogleCalendar,
  onRemoveGoogleCalendar,
  isCalendarSyncing = false,
}) => {
  const [name, setName] = useState<string>(preferences.name || '');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(preferences.soundEnabled ?? true);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  // Reminder settings local state
  const currentReminder = preferences.reminderSettings || {
    enabled: true,
    frequency: 'daily',
    preferredTime: '08:30',
    alarmSoundEnabled: true,
    browserNotificationEnabled: false,
    googleCalendarEnabled: false,
  };

  const [reminderFreq, setReminderFreq] = useState<'daily' | 'weekly'>(currentReminder.frequency);
  const [reminderTime, setReminderTime] = useState<string>(currentReminder.preferredTime);
  const [alarmSound, setAlarmSound] = useState<boolean>(currentReminder.alarmSoundEnabled);
  const [browserNotification, setBrowserNotification] = useState<boolean>(
    currentReminder.browserNotificationEnabled
  );
  const [isTestingChime, setIsTestingChime] = useState<boolean>(false);
  const [calendarConfirmAction, setCalendarConfirmAction] = useState<'sync' | 'remove' | null>(null);

  const handleSave = () => {
    const updatedReminder: ReminderSettings = {
      ...currentReminder,
      frequency: reminderFreq,
      preferredTime: reminderTime,
      alarmSoundEnabled: alarmSound,
      browserNotificationEnabled: browserNotification,
    };

    onUpdatePreferences({
      ...preferences,
      name: name.trim() || 'Friend',
      soundEnabled,
      reminderSettings: updatedReminder,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleTestChime = () => {
    setIsTestingChime(true);
    soundEngine.playReminderAlarm();
    setTimeout(() => setIsTestingChime(false), 2500);
  };

  const handleEnableNotification = async () => {
    const res = await requestBrowserNotificationPermission();
    if (res === 'granted') {
      setBrowserNotification(true);
      const updatedReminder: ReminderSettings = {
        ...currentReminder,
        frequency: reminderFreq,
        preferredTime: reminderTime,
        alarmSoundEnabled: alarmSound,
        browserNotificationEnabled: true,
      };
      onUpdatePreferences({
        ...preferences,
        reminderSettings: updatedReminder,
      });
    } else {
      alert('Notification permissions are blocked in your browser. You can enable them in browser site settings.');
    }
  };

  const handleConfirmCalendarSync = async () => {
    setCalendarConfirmAction(null);
    if (!onSyncGoogleCalendar) return;
    const settings: ReminderSettings = {
      ...currentReminder,
      frequency: reminderFreq,
      preferredTime: reminderTime,
      alarmSoundEnabled: alarmSound,
      browserNotificationEnabled: browserNotification,
      googleCalendarEnabled: true,
    };
    await onSyncGoogleCalendar(settings);
  };

  const handleConfirmCalendarRemove = async () => {
    setCalendarConfirmAction(null);
    if (!onRemoveGoogleCalendar) return;
    await onRemoveGoogleCalendar();
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

      {/* Google Cloud Account & Persistence Card */}
      <div className="p-5 sm:p-6 rounded-[28px] bg-white border border-[#F0EDE8] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E8F0E8] text-[#5A6E5A] flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#2D2D2D] flex items-center gap-1.5">
                <span>Google Account & Cloud Sync</span>
                {currentUser && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F0E8] text-[#5A6E5A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5A6E5A] animate-pulse" />
                    Synced
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#7E7468]">
                {currentUser
                  ? 'Your progress and check-ins are saved to Firebase Firestore'
                  : 'Sign in to never lose your details across sessions or devices'}
              </div>
            </div>
          </div>
        </div>

        {authError && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{authError}</div>
          </div>
        )}

        {currentUser ? (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F5F2ED] border border-[#E8E2D9]">
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#5A6E5A] text-white flex items-center justify-center font-bold text-sm">
                    {(currentUser.displayName || currentUser.email || 'G').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-[#2D2D2D]">
                    {currentUser.displayName || 'Google User'}
                  </div>
                  <div className="text-[11px] text-[#7E7468] truncate max-w-[200px]">
                    {currentUser.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {onManualSync && (
                  <button
                    type="button"
                    onClick={onManualSync}
                    disabled={isSyncing}
                    title="Synchronize now"
                    className="p-2 rounded-xl bg-white text-[#7E7468] hover:text-[#2D2D2D] border border-[#E8E2D9] transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#5A6E5A]' : ''}`} />
                  </button>
                )}
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Sign Out"
                    className="py-1.5 px-3 rounded-xl bg-white text-[#C86D51] hover:bg-rose-50 border border-[#E8E2D9] text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#A69D91] px-1">
              <span className="flex items-center gap-1 text-[#5A6E5A]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Protected by Zero-Trust Firestore ABAC rules</span>
              </span>
              {lastSyncedTime && (
                <span>
                  Last synced: {new Date(lastSyncedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <p className="text-xs text-[#7E7468] leading-relaxed">
              Without Google login, your data is saved solely in your local browser cache. Sign in with Google to automatically backup your daily check-ins, mindful streaks, and reflections.
            </p>

            <button
              id="btn-google-login-profile"
              type="button"
              onClick={onGoogleLogin}
              disabled={isSyncing}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-[#F5F2ED] text-[#2D2D2D] font-medium text-xs border border-[#D5CEC4] flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>{isSyncing ? 'Connecting to Google...' : 'Sign in with Google'}</span>
            </button>
          </div>
        )}
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

      {/* Mindful Reminders & Google Calendar Integration Card */}
      <div className="p-5 sm:p-6 rounded-[28px] bg-white border border-[#F0EDE8] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E8F0E8] text-[#5A6E5A] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#2D2D2D] flex items-center gap-1.5">
                <span>Reminders & Google Calendar</span>
                {preferences.reminderSettings?.googleCalendarEventId && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F0E8] text-[#5A6E5A]">
                    <Check className="w-3 h-3" />
                    Event Active
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#7E7468]">
                Alarms, push notifications & automatic calendar sync
              </div>
            </div>
          </div>
        </div>

        {/* Cadence selection */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-semibold text-[#A69D91] uppercase tracking-wider">
            Check-In Cadence
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setReminderFreq('daily')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                reminderFreq === 'daily'
                  ? 'bg-[#5A6E5A] text-white border-[#5A6E5A]'
                  : 'bg-[#F5F2ED] text-[#7E7468] border-[#E8E2D9] hover:bg-[#E8E2D9]'
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => setReminderFreq('weekly')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                reminderFreq === 'weekly'
                  ? 'bg-[#5A6E5A] text-white border-[#5A6E5A]'
                  : 'bg-[#F5F2ED] text-[#7E7468] border-[#E8E2D9] hover:bg-[#E8E2D9]'
              }`}
            >
              Weekly
            </button>
          </div>
        </div>

        {/* Time Picker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-[10px] font-semibold text-[#A69D91] uppercase tracking-wider">
              Reminder Time
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="px-2 py-1 rounded-xl bg-[#F5F2ED] border border-[#E8E2D9] text-xs font-bold text-[#5A6E5A] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { time: '08:30', label: '🌅 8:30 AM' },
              { time: '13:00', label: '☀️ 1:00 PM' },
              { time: '20:30', label: '🌙 8:30 PM' },
            ].map((p) => (
              <button
                key={p.time}
                type="button"
                onClick={() => setReminderTime(p.time)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
                  reminderTime === p.time
                    ? 'bg-[#5A6E5A] text-white border-[#5A6E5A]'
                    : 'bg-[#F5F2ED] text-[#7E7468] border-[#E8E2D9] hover:bg-[#E8E2D9]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chime Alarm Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FBF9F6] border border-[#F0EDE8]">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-[#5A6E5A]" />
            <div>
              <div className="text-xs font-medium text-[#2D2D2D]">Mindful Singing Bowl Chime</div>
              <div className="text-[10px] text-[#7E7468]">Plays soft alarm tone when reminder fires</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestChime}
              disabled={isTestingChime}
              className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-[#F5F2ED] hover:bg-[#E8E2D9] text-[#5A6E5A] border border-[#E8E2D9] cursor-pointer"
            >
              {isTestingChime ? 'Chiming...' : 'Preview'}
            </button>
            <input
              type="checkbox"
              checked={alarmSound}
              onChange={(e) => setAlarmSound(e.target.checked)}
              className="w-4 h-4 accent-[#5A6E5A] rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Browser Notification */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FBF9F6] border border-[#F0EDE8]">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-[#5A6E5A]" />
            <div>
              <div className="text-xs font-medium text-[#2D2D2D]">Push / Device Notification</div>
              <div className="text-[10px] text-[#7E7468]">Displays notification on your screen</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleEnableNotification}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
              browserNotification
                ? 'bg-[#E8F0E8] text-[#5A6E5A] border border-[#C8DACB]'
                : 'bg-[#5A6E5A] text-white'
            }`}
          >
            {browserNotification ? '✓ Enabled' : 'Enable'}
          </button>
        </div>

        {/* Google Calendar Action Section */}
        <div className="pt-2 border-t border-[#F0EDE8] space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold text-[#2D2D2D] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#5A6E5A]" />
                <span>Google Calendar Recurring Reminder</span>
              </div>
              <p className="text-[11px] text-[#7E7468] mt-0.5 leading-relaxed">
                Adds a recurring event to your calendar with a direct link that opens the app for your mood and goal check-in.
              </p>
            </div>
          </div>

          {currentUser ? (
            <div className="space-y-2">
              {preferences.reminderSettings?.googleCalendarEventLink && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#E8F0E8] border border-[#C8DACB] text-[11px]">
                  <span className="text-[#4A5D4A] font-medium">Calendar Event Active</span>
                  <a
                    href={preferences.reminderSettings.googleCalendarEventLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#5A6E5A] font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>View in Google Calendar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCalendarConfirmAction('sync')}
                  disabled={isCalendarSyncing}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#5A6E5A] hover:bg-[#4A5D4A] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {isCalendarSyncing
                      ? 'Syncing...'
                      : preferences.reminderSettings?.googleCalendarEventId
                      ? 'Update Calendar Schedule'
                      : 'Add to Google Calendar'}
                  </span>
                </button>

                {preferences.reminderSettings?.googleCalendarEventId && (
                  <button
                    type="button"
                    onClick={() => setCalendarConfirmAction('remove')}
                    disabled={isCalendarSyncing}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-rose-50 text-[#C86D51] border border-[#E8E2D9] text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-[#F5F2ED] border border-[#E8E2D9] flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#7E7468]">
                Log in with Google to schedule events on your Calendar
              </span>
              {onGoogleLogin && (
                <button
                  type="button"
                  onClick={onGoogleLogin}
                  className="py-1 px-2.5 rounded-lg bg-[#5A6E5A] text-white text-[10px] font-semibold flex items-center gap-1 hover:bg-[#4A5D4A] cursor-pointer"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Log In</span>
                </button>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full py-2.5 px-4 rounded-xl border border-[#D5CEC4] bg-[#F5F2ED] hover:bg-[#E8E2D9] text-xs font-medium text-[#2D2D2D] transition-all cursor-pointer text-center"
        >
          Save Reminder Times & Preferences
        </button>
      </div>

      {/* Calendar Confirmation Modal (Guarantees Workspace Guideline Compliance) */}
      {calendarConfirmAction && (
        <div className="fixed inset-0 z-50 bg-[#2D2D2D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-6 max-w-sm w-full shadow-2xl border border-[#F0EDE8] space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F0E8] text-[#5A6E5A] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-medium text-[#2D2D2D]">
                {calendarConfirmAction === 'sync'
                  ? 'Confirm Google Calendar Reminder'
                  : 'Remove Calendar Event'}
              </h3>
              <p className="text-xs text-[#7E7468] mt-1 leading-relaxed">
                {calendarConfirmAction === 'sync'
                  ? `Would you like to schedule a ${reminderFreq} recurring reminder on your Google Calendar at ${reminderTime}? This event includes a direct link to open Mindful Companion.`
                  : 'Are you sure you want to delete this reminder from your Google Calendar?'}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCalendarConfirmAction(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#E8E2D9] text-xs font-semibold text-[#7E7468] hover:bg-[#F5F2ED]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={calendarConfirmAction === 'sync' ? handleConfirmCalendarSync : handleConfirmCalendarRemove}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white ${
                  calendarConfirmAction === 'sync' ? 'bg-[#5A6E5A] hover:bg-[#4A5D4A]' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {calendarConfirmAction === 'sync' ? 'Confirm Schedule' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

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
