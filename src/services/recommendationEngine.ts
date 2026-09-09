import {
  EmotionalState,
  CheckInRecord,
  Practice,
  RecommendationResult,
  UserPreferences,
  AICheckInAnalysis,
  AIRecommendationOption,
} from '../types';
import { PRACTICES } from '../data/mockPractices';

/**
 * Generates tailored next steps based on user's emotional state, goal reflection, and preferences
 */
export function deriveNextSteps(
  currentState: EmotionalState,
  userPreferences?: UserPreferences
): string[] {
  const steps: string[] = [];
  const primaryGoal = currentState.goalReflection?.primaryGoal || userPreferences?.goals?.[0] || 'Calm';
  const { stress, energy, mood } = currentState;

  if (stress >= 4) {
    steps.push('Take 3 conscious diaphragmatic breaths before checking new messages.');
    steps.push('Step away from screens for a 5-minute warm tea or fresh air break.');
  } else if (energy <= 2) {
    steps.push('Drink a glass of cool water and gently roll your shoulders back.');
    steps.push('Take a short 5-minute stroll to stimulate circulation without fatigue.');
  } else if (mood >= 4 && energy >= 4) {
    steps.push('Channel this positive momentum into your most meaningful priority today.');
    steps.push('Jot down one small win you are grateful for right now.');
  } else {
    steps.push('Protect 10 minutes of undisturbed quiet space today.');
    steps.push('Check in with a friend or colleague with a kind word.');
  }

  // Goal-specific next step
  if (primaryGoal.toLowerCase().includes('sleep')) {
    steps.push('Dim overhead lights 45 minutes before bed and avoid blue-light screens.');
  } else if (primaryGoal.toLowerCase().includes('focus')) {
    steps.push('Close non-essential browser tabs and set a 25-minute Pomodoro focus block.');
  } else if (primaryGoal.toLowerCase().includes('stress')) {
    steps.push('Remind yourself: "I only need to handle what is in front of me right now."');
  }

  return steps.slice(0, 3);
}

/**
 * Synchronous, feedback-aware baseline recommendation.
 * Evaluates the user's past ~5 check-ins to respect negative ratings immediately.
 */
export function getFallbackRecommendation(
  currentState: EmotionalState,
  history: CheckInRecord[] = [],
  userPreferences?: UserPreferences
): RecommendationResult {
  const { energy, stress, desiredState, goalReflection } = currentState;
  const nextSteps = deriveNextSteps(currentState, userPreferences);

  // Goal alignment note
  const primaryGoal = goalReflection?.primaryGoal || userPreferences?.goals?.[0];
  let goalAlignmentNote: string | undefined;
  if (primaryGoal) {
    if (goalReflection?.status === 'progressing') {
      goalAlignmentNote = `Aligned with your goal of "${primaryGoal}" — maintaining steady forward flow.`;
    } else if (goalReflection?.status === 'need_support') {
      goalAlignmentNote = `Prioritizing restorative care to support your "${primaryGoal}" journey today.`;
    } else if (goalReflection?.status === 'distracted') {
      goalAlignmentNote = `Gentle refocusing practice to bring you back to your "${primaryGoal}" anchor.`;
    } else {
      goalAlignmentNote = `Tailored to your journey toward ${primaryGoal}.`;
    }
  }

  // Feedback Learning Loop: Check last 5 sessions for disliked practices
  const recentFeedbackSessions = history
    .filter((h) => h.practiceId || h.practiceTitle)
    .slice(0, 5);

  const dislikedPracticeIds = new Set(
    recentFeedbackSessions
      .filter((h) => h.didHelp === 'not_really' || h.wouldDoAgain === 'no')
      .map((h) => h.practiceId)
      .filter(Boolean)
  );

  const consecutiveDissatisfied =
    recentFeedbackSessions.length >= 2 &&
    recentFeedbackSessions.slice(0, 2).every((h) => h.didHelp === 'not_really');

  // If user consistently dislikes traditional meditation, flag Explore as first path
  if (consecutiveDissatisfied) {
    const fallback = PRACTICES.find((p) => p.id === 'grounding-3') || PRACTICES[0];
    return {
      practice: fallback,
      reason:
        "Based on your recent feedback, traditional sitting practices haven't felt right. We recommend trying hands-on creative or movement activities in Explore.",
      matchScore: 0.95,
      contextSummary: `Energy ${energy}/5 · Stress ${stress}/5 · Looking for ${desiredState}`,
      suggestExploreFirst: true,
      goalAlignmentNote,
      suggestedNextSteps: nextSteps,
      feedbackLearningNote:
        'Learned: Multiple sessions felt unhelpful; pivoting away from sitting meditation toward tactile Explore paths.',
      adaptedFromFeedback: true,
    };
  }

  // 1. High Stress + Low Energy -> Calming Reset or Grounding
  if (stress >= 4 && energy <= 2) {
    if (!dislikedPracticeIds.has('calm-relax-5')) {
      const practice = PRACTICES.find((p) => p.id === 'calm-relax-5') || PRACTICES[0];
      return {
        practice,
        reason:
          "You're feeling low on energy but carrying significant stress. A gentle 5-minute practice helps you reset without demanding heavy physical or mental effort.",
        matchScore: 0.98,
        contextSummary: `Energy ${energy}/5 · Stress ${stress}/5 · Goal: ${desiredState}`,
        secondaryOption: PRACTICES.find((p) => p.id === 'grounding-3'),
        goalAlignmentNote,
        suggestedNextSteps: nextSteps,
      };
    } else {
      const practice = PRACTICES.find((p) => p.id === 'grounding-3') || PRACTICES[0];
      return {
        practice,
        reason:
          'Because seated breathwork felt unhelpful recently, this 3-minute sensory grounding anchors your stress through tangible physical cues instead.',
        matchScore: 0.95,
        contextSummary: `Energy ${energy}/5 · Stress ${stress}/5 · Goal: ${desiredState}`,
        secondaryOption: PRACTICES.find((p) => p.id === 'energy-boost-7'),
        goalAlignmentNote,
        suggestedNextSteps: nextSteps,
        feedbackLearningNote:
          'Adapted: Switched from Calm & Relax to tactile Sensory Grounding based on your previous "Not really" rating.',
        adaptedFromFeedback: true,
      };
    }
  }

  // 2. High Stress -> Stress Reset or Grounding
  if (stress >= 4 || desiredState === 'Calm' || desiredState === 'Grounded') {
    if (desiredState === 'Grounded' || dislikedPracticeIds.has('stress-reset-10')) {
      const practice = PRACTICES.find((p) => p.id === 'grounding-3') || PRACTICES[0];
      const isAdapted = dislikedPracticeIds.has('stress-reset-10');
      return {
        practice,
        reason: isAdapted
          ? 'Because seated meditation didn\'t feel helpful recently, this 3-minute sensory grounding anchors your stress through physical contact points instead.'
          : "You're seeking to feel grounded. A quick 3-minute 5-4-3-2-1 sensory scan anchors your awareness firmly back to the physical present.",
        matchScore: 0.94,
        contextSummary: `Stress ${stress}/5 · Desired: Grounded`,
        secondaryOption: PRACTICES.find((p) => p.id === 'energy-boost-7'),
        goalAlignmentNote,
        suggestedNextSteps: nextSteps,
        feedbackLearningNote: isAdapted
          ? 'Adapted: Pivoted away from Stress Reset following your recent "Not really" rating.'
          : undefined,
        adaptedFromFeedback: isAdapted,
      };
    }

    const practice = PRACTICES.find((p) => p.id === 'stress-reset-10') || PRACTICES[0];
    return {
      practice,
      reason:
        'Your stress is elevated and you want to find calm. Structured breath retentions and guided somatic grounding will help dissolve acute overwhelm.',
      matchScore: 0.96,
      contextSummary: `Stress ${stress}/5 · Desired: ${desiredState}`,
      secondaryOption: PRACTICES.find((p) => p.id === 'calm-relax-5'),
      goalAlignmentNote,
      suggestedNextSteps: nextSteps,
    };
  }

  // 3. Low Energy or Desired State Energised -> Movement or Grounding
  if (energy <= 2 || desiredState === 'Energised') {
    if (!dislikedPracticeIds.has('energy-boost-7')) {
      const practice = PRACTICES.find((p) => p.id === 'energy-boost-7') || PRACTICES[2];
      return {
        practice,
        reason:
          'Your energy is running low. Rhythmic oxygenating breathwork and posture alignment will gently wake up your body and clear fatigue.',
        matchScore: 0.93,
        contextSummary: `Energy ${energy}/5 · Desired: Energised`,
        secondaryOption: PRACTICES.find((p) => p.id === 'focus-reset-5'),
        goalAlignmentNote,
        suggestedNextSteps: nextSteps,
      };
    } else {
      const practice = PRACTICES.find((p) => p.id === 'grounding-3') || PRACTICES[0];
      return {
        practice,
        reason:
          'A quick 3-minute sensory pause to clear mental sluggishness and reset your focus without physical strain.',
        matchScore: 0.91,
        contextSummary: `Energy ${energy}/5 · Desired: Reset`,
        secondaryOption: PRACTICES.find((p) => p.id === 'calm-relax-5'),
        goalAlignmentNote,
        suggestedNextSteps: nextSteps,
        feedbackLearningNote: 'Adapted: Avoided movement practice per past feedback.',
        adaptedFromFeedback: true,
      };
    }
  }

  // 4. Sleepy / Ready for rest -> Wind Down
  if (desiredState === 'Sleepy / ready for rest') {
    const practice = PRACTICES.find((p) => p.id === 'wind-down-10') || PRACTICES[4];
    return {
      practice,
      reason:
        "You're preparing for restorative sleep. Extended 4-4-6 tranquil exhalations and progressive muscle release will cue your nervous system to fully let go.",
      matchScore: 0.97,
      contextSummary: `Energy ${energy}/5 · Preparing for Sleep`,
      secondaryOption: PRACTICES.find((p) => p.id === 'calm-relax-5'),
      goalAlignmentNote,
      suggestedNextSteps: nextSteps,
    };
  }

  // 5. Focused Clarity -> Focus Reset
  if (desiredState === 'Focused') {
    const practice = PRACTICES.find((p) => p.id === 'focus-reset-5') || PRACTICES[3];
    return {
      practice,
      reason:
        'You want crisp mental focus. Box breathing equalizes autonomic tension, sharpening single-point attention for high-priority tasks.',
      matchScore: 0.95,
      contextSummary: `Desired: Focused Clarity`,
      secondaryOption: PRACTICES.find((p) => p.id === 'energy-boost-7'),
      goalAlignmentNote,
      suggestedNextSteps: nextSteps,
    };
  }

  // Default balanced practice
  const practice = PRACTICES.find((p) => p.id === 'calm-relax-5') || PRACTICES[0];
  return {
    practice,
    reason:
      'A balanced 5-minute practice to cultivate ease, steady your breathing, and bring mindful awareness to the rest of your day.',
    matchScore: 0.9,
    contextSummary: `Energy ${energy}/5 · Stress ${stress}/5 · Desired: ${desiredState}`,
    secondaryOption: PRACTICES.find((p) => p.id === 'focus-reset-5'),
    goalAlignmentNote,
    suggestedNextSteps: nextSteps,
  };
}

/**
 * Primary Real LLM Recommendation Engine Call.
 * Sends the current emotional state, desired state, and recent history (~5 check-ins with outcomes/ratings)
 * to the backend `/api/recommendation` endpoint powered by Attune AI Engine.
 *
 * Implements the Feedback Learning Loop:
 * If the user previously logged "not_really" or "no", Attune reads this in the prompt context,
 * avoids the disliked practice/modality, and explains its adaptation in the one-line reason.
 */
export async function getLLMRecommendation(
  currentState: EmotionalState,
  history: CheckInRecord[] = [],
  userPreferences?: UserPreferences
): Promise<RecommendationResult> {
  try {
    // Only send the last 5 check-ins to keep prompt dense and focused
    const recentHistory = history.slice(0, 5);

    const response = await fetch('/api/recommendation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentState,
        history: recentHistory,
        preferences: userPreferences,
      }),
    });

    if (!response.ok) {
      console.warn(`[Recommendation Engine] Server returned ${response.status}, using smart fallback`);
      return getFallbackRecommendation(currentState, history, userPreferences);
    }

    const data = await response.json();

    // Use dynamically synthesized Practice object from Attune AI engine if provided
    const matchedPractice: Practice =
      data.practice ||
      PRACTICES.find((p) => p.id === data.recommendedPracticeId) ||
      PRACTICES[0];

    const secondaryOption = data.secondaryOption
      ? data.secondaryOption
      : data.secondaryOptionId
      ? PRACTICES.find((p) => p.id === data.secondaryOptionId)
      : undefined;

    const nextSteps =
      Array.isArray(data.suggestedNextSteps) && data.suggestedNextSteps.length > 0
        ? data.suggestedNextSteps
        : deriveNextSteps(currentState, userPreferences);

    const isAdapted = Boolean(
      data.feedbackLearningNote ||
        (data.reason &&
          (data.reason.toLowerCase().includes('feedback') ||
            data.reason.toLowerCase().includes('because') ||
            data.reason.toLowerCase().includes('didn\'t feel') ||
            data.reason.toLowerCase().includes('instead')))
    );

    return {
      practice: matchedPractice,
      reason: data.reason || 'A personalized practice created for your current state and feedback history.',
      matchScore: data.matchScore ?? 0.96,
      contextSummary:
        data.contextSummary ||
        `Energy ${currentState.energy}/5 · Stress ${currentState.stress}/5 · Desired: ${currentState.desiredState}`,
      secondaryOption,
      suggestExploreFirst: Boolean(data.suggestExploreFirst),
      goalAlignmentNote: data.goalAlignmentNote,
      suggestedNextSteps: nextSteps,
      feedbackLearningNote: data.feedbackLearningNote,
      isAIGenerated: true,
      adaptedFromFeedback: isAdapted,
      videoGuide: matchedPractice.videoGuide || data.videoGuide,
      videoRecommendationReason: matchedPractice.videoGuide?.recommendationReason || data.videoRecommendationReason,
    };
  } catch (err) {
    console.info('[Recommendation Engine] Using responsive smart fallback for recommendation:', err);
    return getFallbackRecommendation(currentState, history, userPreferences);
  }
}

/**
 * Backward-compatible wrapper that returns fallback synchronously.
 */
export function getRecommendation(
  currentState: EmotionalState,
  history: CheckInRecord[] = [],
  userPreferences?: UserPreferences
): RecommendationResult {
  return getFallbackRecommendation(currentState, history, userPreferences);
}

/**
 * Sends check-in message, 1-10 stress level, feelings, and desired outcome to Attune AI Engine
 * for deep emotional & neurological analysis and personalized, unique recommendations.
 */
export async function analyzeCheckInWithAttune(data: {
  message: string;
  stressRating10: number;
  desiredOutcome?: string;
  feelingTags?: string[];
}): Promise<AICheckInAnalysis> {
  const { message, stressRating10, desiredOutcome, feelingTags } = data;

  try {
    const response = await fetch('/api/analyze-checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        stressRating10,
        desiredOutcome,
        feelingTags,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      const mappedRecommendations: AIRecommendationOption[] = (result.recommendations || []).map(
        (r: any) => {
          const synthesizedPractice: Practice =
            r.practice ||
            PRACTICES.find((p) => p.id === r.practiceId) ||
            PRACTICES[0];

          return {
            practiceId: synthesizedPractice.id || r.practiceId,
            practice: synthesizedPractice,
            tag: r.tag || 'Personalized Match',
            reason: r.reason || synthesizedPractice.whyHelpful,
            videoGuide: synthesizedPractice.videoGuide || r.videoGuide,
            videoRecommendationReason: r.videoRecommendationReason || synthesizedPractice.videoGuide?.recommendationReason,
          };
        }
      );

      if (mappedRecommendations.length === 0) {
        mappedRecommendations.push({
          practiceId: 'calm-relax-5',
          practice: PRACTICES[0],
          tag: 'Top Recommendation · 5m',
          reason: 'A gentle 5-minute diaphragmatic release to steady breathing and ease stress.',
        });
      }

      return {
        emotionalReflection: result.emotionalReflection,
        stressAssessment: result.stressAssessment || `Stress Level ${stressRating10}/10`,
        stressRating10: result.stressRating10 || stressRating10,
        recommendations: mappedRecommendations,
        keyTakeaway:
          result.keyTakeaway ||
          'Taking a moment for yourself right now can shift the tone of your whole day.',
        source: result.source,
      };
    }
  } catch (err) {
    console.info('[Recommendation Engine] analyzeCheckIn using resilient fallback:', err);
  }

  // Resilient fallback if network fails
  const fallbackRecs: AIRecommendationOption[] = [
    {
      practiceId: 'calm-relax-5',
      practice: PRACTICES.find((p) => p.id === 'calm-relax-5') || PRACTICES[0],
      tag: 'Top Match · 5 Min Breath',
      reason: 'Diaphragmatic breathing directly downregulates stress and brings physical ease.',
      videoGuide: PRACTICES[0].videoGuide,
    },
    {
      practiceId: 'grounding-3',
      practice: PRACTICES.find((p) => p.id === 'grounding-3') || PRACTICES[1],
      tag: 'Rapid 3-Min Reset',
      reason: '5-4-3-2-1 sensory grounding when your thoughts feel fast or tense.',
      videoGuide: PRACTICES[1].videoGuide,
    },
    {
      practiceId: 'stress-reset-10',
      practice: PRACTICES.find((p) => p.id === 'stress-reset-10') || PRACTICES[1],
      tag: 'Deeper Muscle Release',
      reason: '4-7-8 balancing breath with full body awareness to dissolve tension.',
      videoGuide: PRACTICES[1].videoGuide,
    },
  ];

  return {
    emotionalReflection: `Thank you for checking in honestly. With a stress level of ${stressRating10}/10, your mind and body are seeking a quiet moment of release. A short, steady breathing practice will support you in finding balance.`,
    stressAssessment: `Stress Assessment (${stressRating10}/10)`,
    stressRating10,
    recommendations: fallbackRecs,
    keyTakeaway: 'Giving yourself a few conscious minutes right now creates lasting resilience.',
    source: 'client-fallback',
  };
}
