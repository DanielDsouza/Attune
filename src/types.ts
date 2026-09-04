export interface UserPreferences {
  name: string;
  checkInTime: 'morning' | 'afternoon' | 'evening' | 'night';
  goals: string[]; // e.g. ['Calm', 'Stress Management', 'Focus', 'Better Sleep', 'Energy']
  interests: string[]; // e.g. ['Art', 'Music', 'Walking', 'Reading', 'Cooking', 'Yoga']
  activityTypes: string[]; // e.g. ['Guided practice', 'Independent learning', 'Movement', 'Creative', 'Social']
  soundEnabled: boolean;
  onboarded: boolean;
}

export type DesiredState = 
  | 'Calm'
  | 'Relaxed'
  | 'Energised'
  | 'Focused'
  | 'Positive'
  | 'Grounded'
  | 'Sleepy / ready for rest';

export interface EmotionalState {
  energy: number; // 1 to 5
  stress: number; // 1 to 5
  mood: number; // 1 to 5
  moodLabel: string; // e.g. 'Anxious', 'Fatigued', 'Neutral', 'Content', 'Joyful'
  whatHappened: string;
  desiredState: DesiredState;
  wantsToAct: boolean;
  timestamp: number;
}

export interface GuidanceStep {
  seconds: number;
  title: string;
  instruction: string;
  phase?: 'inhale' | 'hold' | 'exhale' | 'rest' | 'focus' | 'reflect';
}

export interface VideoGuide {
  youtubeId: string;
  title: string;
  channelName: string;
  likesOrRating?: string;
  duration?: string;
}

export interface Practice {
  id: string;
  title: string;
  subtitle: string;
  category: 'breath' | 'meditation' | 'mindful_movement' | 'focus' | 'wind_down';
  durationMinutes: number;
  description: string;
  whyHelpful: string;
  guidanceSteps: GuidanceStep[];
  targetEnergy: 'low_to_high' | 'high_to_balanced' | 'any';
  targetStress: 'high_to_low' | 'any';
  tags: string[];
  themeColor: string;
  ambientTone?: string;
  videoGuide?: VideoGuide;
}

export interface CheckInRecord {
  id: string;
  dateStr: string; // YYYY-MM-DD
  timeOfDay: string;
  stateBefore: EmotionalState;
  stateAfter?: {
    energy: number;
    stress: number;
    mood: number;
  };
  practiceId?: string;
  practiceTitle?: string;
  didHelp?: 'yes' | 'little' | 'not_really';
  wouldDoAgain?: 'yes' | 'maybe' | 'no';
  alternativeChosen?: string;
  notes?: string;
  completedAt?: number;
  timestamp: number;
}

export interface ExploreItem {
  id: string;
  type: 'diy' | 'local';
  category: 'Move' | 'Create' | 'Learn' | 'Connect' | 'Explore' | 'Relax';
  title: string;
  subtitle: string;
  durationOrSchedule: string;
  description: string;
  cost?: string;
  distance?: string;
  location?: string;
  tags: string[];
  diySteps?: {
    title: string;
    detail: string;
    durationMinutes: number;
  }[];
  difficulty?: 'Beginner' | 'All levels' | 'Intermediate';
  videoGuide?: VideoGuide;
}

export interface RecommendationResult {
  practice: Practice;
  reason: string;
  matchScore: number;
  contextSummary: string;
  secondaryOption?: Practice;
  suggestExploreFirst?: boolean;
}
