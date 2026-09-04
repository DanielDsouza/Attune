import { EmotionalState, CheckInRecord, Practice, RecommendationResult } from '../types';
import { PRACTICES } from '../data/mockPractices';

/**
 * Recommendation Engine for Mindful Companion MVP.
 * Implements rule-based decision trees factoring in:
 * 1. Current State (Energy, Stress, Mood)
 * 2. Desired State (Calm, Relaxed, Energised, Focused, Positive, Grounded, Sleepy)
 * 3. Historical Feedback (Avoids repeated meditation if user indicated poor response).
 * 
 * NOTE: Architecture is modular and returns structured scoring, making it
 * trivial to swap for an ML or Gemini-powered model in future releases.
 */
export function getRecommendation(
  currentState: EmotionalState,
  history: CheckInRecord[] = []
): RecommendationResult {
  const { energy, stress, desiredState } = currentState;

  // 1. Analyze historical resistance to meditation
  const recentMeditationOutcomes = history
    .filter(h => h.didHelp !== undefined)
    .slice(-3); // check last 3 logged sessions

  const consecutiveDissatisfied = recentMeditationOutcomes.length >= 2 &&
    recentMeditationOutcomes.every(h => h.didHelp === 'not_really');

  // If user consistently dislikes traditional meditation, flag Explore as first path
  if (consecutiveDissatisfied) {
    const fallback = PRACTICES.find(p => p.id === 'grounding-3') || PRACTICES[0];
    return {
      practice: fallback,
      reason: "Based on your recent feedback, traditional sitting practices haven't felt right. We recommend trying hands-on creative or movement activities in Explore.",
      matchScore: 0.95,
      contextSummary: `Energy ${energy}/5 · Stress ${stress}/5 · Looking for ${desiredState}`,
      suggestExploreFirst: true
    };
  }

  // 2. Rule: High Stress + Low Energy -> Gentle Calming Reset
  if (stress >= 4 && energy <= 2) {
    const practice = PRACTICES.find(p => p.id === 'calm-relax-5') || PRACTICES[0];
    return {
      practice,
      reason: "You're feeling low on energy but carrying significant stress. A gentle 5-minute practice helps you reset without demanding heavy physical or mental effort.",
      matchScore: 0.98,
      contextSummary: `Energy ${energy}/5 · Stress ${stress}/5 · Goal: ${desiredState}`,
      secondaryOption: PRACTICES.find(p => p.id === 'grounding-3')
    };
  }

  // 3. Rule: High Stress -> Stress Reset (4-7-8 balancing)
  if (stress >= 4 || desiredState === 'Calm' || desiredState === 'Grounded') {
    if (desiredState === 'Grounded') {
      const practice = PRACTICES.find(p => p.id === 'grounding-3') || PRACTICES[0];
      return {
        practice,
        reason: "You're seeking to feel grounded. A quick 3-minute 5-4-3-2-1 sensory scan anchors your awareness firmly back to the physical present.",
        matchScore: 0.94,
        contextSummary: `Stress ${stress}/5 · Desired: Grounded`,
        secondaryOption: PRACTICES.find(p => p.id === 'stress-reset-10')
      };
    }

    const practice = PRACTICES.find(p => p.id === 'stress-reset-10') || PRACTICES[0];
    return {
      practice,
      reason: "Your stress is elevated and you want to find calm. Structured breath retentions and guided somatic grounding will help dissolve acute overwhelm.",
      matchScore: 0.96,
      contextSummary: `Stress ${stress}/5 · Desired: ${desiredState}`,
      secondaryOption: PRACTICES.find(p => p.id === 'calm-relax-5')
    };
  }

  // 4. Rule: Low Energy + Goal is Energised / Positive -> Energy Boost
  if (energy <= 2 || desiredState === 'Energised') {
    const practice = PRACTICES.find(p => p.id === 'energy-boost-7') || PRACTICES[2];
    return {
      practice,
      reason: "Your physical or mental energy is running low. Rhythmic oxygenating breathwork and posture alignment will gently wake up your body and clear fatigue.",
      matchScore: 0.93,
      contextSummary: `Energy ${energy}/5 · Desired: Energised`,
      secondaryOption: PRACTICES.find(p => p.id === 'focus-reset-5')
    };
  }

  // 5. Rule: Desired State is Sleepy / Ready for Rest
  if (desiredState === 'Sleepy / ready for rest') {
    const practice = PRACTICES.find(p => p.id === 'wind-down-10') || PRACTICES[4];
    return {
      practice,
      reason: "You're preparing for restorative sleep. Extended 4-4-6 tranquil exhalations and progressive muscle release will cue your nervous system to fully let go.",
      matchScore: 0.97,
      contextSummary: `Energy ${energy}/5 · Preparing for Sleep`,
      secondaryOption: PRACTICES.find(p => p.id === 'calm-relax-5')
    };
  }

  // 6. Rule: Desired State is Focused
  if (desiredState === 'Focused') {
    const practice = PRACTICES.find(p => p.id === 'focus-reset-5') || PRACTICES[3];
    return {
      practice,
      reason: "You want crisp mental focus. Box breathing equalizes autonomic tension, sharpening single-point attention for high-priority tasks.",
      matchScore: 0.95,
      contextSummary: `Desired: Focused Clarity`,
      secondaryOption: PRACTICES.find(p => p.id === 'energy-boost-7')
    };
  }

  // Default balanced recommendation
  const practice = PRACTICES.find(p => p.id === 'calm-relax-5') || PRACTICES[0];
  return {
    practice,
    reason: "A balanced 5-minute practice to cultivate ease, steady your breathing, and bring mindful awareness to the rest of your day.",
    matchScore: 0.9,
    contextSummary: `Energy ${energy}/5 · Stress ${stress}/5 · Desired: ${desiredState}`,
    secondaryOption: PRACTICES.find(p => p.id === 'focus-reset-5')
  };
}
