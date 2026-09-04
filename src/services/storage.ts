import { UserPreferences, CheckInRecord, EmotionalState } from '../types';

const STORAGE_KEYS = {
  PREFERENCES: 'mindful_companion_user_prefs_v1',
  CHECK_INS: 'mindful_companion_checkins_v1',
  CURRENT_STATE: 'mindful_companion_current_state_v1',
  STREAK_OVERRIDE: 'mindful_companion_streak_v1',
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  name: 'Alex',
  checkInTime: 'evening',
  goals: ['Calm', 'Stress Management', 'Focus', 'Better Sleep'],
  interests: ['Music', 'Walking', 'Art', 'Reading', 'Yoga'],
  activityTypes: ['Guided practice', 'Movement', 'Creative activities'],
  soundEnabled: true,
  onboarded: true,
};

export const DEFAULT_INITIAL_STATE: EmotionalState = {
  energy: 2,
  stress: 4,
  mood: 2,
  moodLabel: 'Overwhelmed',
  whatHappened: 'Back-to-back work meetings and pending project deadlines.',
  desiredState: 'Relaxed',
  wantsToAct: true,
  timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
};

// Seed 6 days of realistic history so Progress & Insights are immediately informative
export const SEED_CHECK_IN_HISTORY: CheckInRecord[] = [
  {
    id: 'seed-1',
    dateStr: '2026-08-26',
    timeOfDay: 'Morning',
    stateBefore: {
      energy: 2,
      stress: 3,
      mood: 3,
      moodLabel: 'Sluggish',
      whatHappened: 'Woke up feeling groggy after restless night.',
      desiredState: 'Energised',
      wantsToAct: true,
      timestamp: Date.now() - 6 * 86400000
    },
    stateAfter: { energy: 4, stress: 2, mood: 4 },
    practiceId: 'energy-boost-7',
    practiceTitle: 'Energy Boost',
    didHelp: 'yes',
    wouldDoAgain: 'yes',
    completedAt: Date.now() - 6 * 86400000 + 420000,
    timestamp: Date.now() - 6 * 86400000
  },
  {
    id: 'seed-2',
    dateStr: '2026-08-27',
    timeOfDay: 'Evening',
    stateBefore: {
      energy: 2,
      stress: 5,
      mood: 2,
      moodLabel: 'Stressed',
      whatHappened: 'Tight project deadline crunch.',
      desiredState: 'Calm',
      wantsToAct: true,
      timestamp: Date.now() - 5 * 86400000
    },
    stateAfter: { energy: 3, stress: 2, mood: 4 },
    practiceId: 'stress-reset-10',
    practiceTitle: 'Stress Reset',
    didHelp: 'yes',
    wouldDoAgain: 'yes',
    completedAt: Date.now() - 5 * 86400000 + 600000,
    timestamp: Date.now() - 5 * 86400000
  },
  {
    id: 'seed-3',
    dateStr: '2026-08-28',
    timeOfDay: 'Afternoon',
    stateBefore: {
      energy: 3,
      stress: 4,
      mood: 3,
      moodLabel: 'Distracted',
      whatHappened: 'Inbox overload and constant interruptions.',
      desiredState: 'Focused',
      wantsToAct: true,
      timestamp: Date.now() - 4 * 86400000
    },
    stateAfter: { energy: 4, stress: 2, mood: 4 },
    practiceId: 'focus-reset-5',
    practiceTitle: 'Focus Reset',
    didHelp: 'yes',
    wouldDoAgain: 'yes',
    completedAt: Date.now() - 4 * 86400000 + 300000,
    timestamp: Date.now() - 4 * 86400000
  },
  {
    id: 'seed-4',
    dateStr: '2026-08-29',
    timeOfDay: 'Evening',
    stateBefore: {
      energy: 1,
      stress: 4,
      mood: 2,
      moodLabel: 'Drained',
      whatHappened: 'Long travel commute and heavy traffic.',
      desiredState: 'Relaxed',
      wantsToAct: true,
      timestamp: Date.now() - 3 * 86400000
    },
    stateAfter: { energy: 3, stress: 2, mood: 4 },
    practiceId: 'calm-relax-5',
    practiceTitle: 'Calm & Relax',
    didHelp: 'yes',
    wouldDoAgain: 'yes',
    completedAt: Date.now() - 3 * 86400000 + 300000,
    timestamp: Date.now() - 3 * 86400000
  },
  {
    id: 'seed-5',
    dateStr: '2026-08-30',
    timeOfDay: 'Evening',
    stateBefore: {
      energy: 2,
      stress: 3,
      mood: 3,
      moodLabel: 'Restless',
      whatHappened: 'Screen fatigue from 8 hours at desk.',
      desiredState: 'Sleepy / ready for rest',
      wantsToAct: true,
      timestamp: Date.now() - 2 * 86400000
    },
    stateAfter: { energy: 2, stress: 1, mood: 5 },
    practiceId: 'wind-down-10',
    practiceTitle: 'Wind Down',
    didHelp: 'yes',
    wouldDoAgain: 'yes',
    completedAt: Date.now() - 2 * 86400000 + 600000,
    timestamp: Date.now() - 2 * 86400000
  },
  {
    id: 'seed-6',
    dateStr: '2026-08-31',
    timeOfDay: 'Morning',
    stateBefore: {
      energy: 2,
      stress: 3,
      mood: 3,
      moodLabel: 'Anxious',
      whatHappened: 'Upcoming presentation at 10 AM.',
      desiredState: 'Grounded',
      wantsToAct: true,
      timestamp: Date.now() - 1 * 86400000
    },
    stateAfter: { energy: 3, stress: 2, mood: 4 },
    practiceId: 'grounding-3',
    practiceTitle: '3-Minute Sensory Grounding',
    didHelp: 'yes',
    wouldDoAgain: 'yes',
    completedAt: Date.now() - 1 * 86400000 + 180000,
    timestamp: Date.now() - 1 * 86400000
  }
];

export const storage = {
  getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return DEFAULT_PREFERENCES;
  },

  savePreferences(prefs: UserPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch {
      // Ignore
    }
  },

  getCheckIns(): CheckInRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHECK_INS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return SEED_CHECK_IN_HISTORY;
  },

  saveCheckIn(record: CheckInRecord): void {
    try {
      const list = this.getCheckIns();
      const existingIdx = list.findIndex(item => item.id === record.id);
      if (existingIdx >= 0) {
        list[existingIdx] = record;
      } else {
        list.unshift(record);
      }
      localStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(list));
    } catch {
      // Ignore
    }
  },

  getCurrentState(): EmotionalState {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_STATE);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return DEFAULT_INITIAL_STATE;
  },

  saveCurrentState(state: EmotionalState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_STATE, JSON.stringify(state));
    } catch {
      // Ignore
    }
  },

  resetAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
      localStorage.removeItem(STORAGE_KEYS.CHECK_INS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_STATE);
    } catch {
      // Ignore
    }
  }
};
