/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserPreferences,
  EmotionalState,
  CheckInRecord,
  Practice,
  ExploreItem,
  RecommendationResult,
} from './types';
import {
  storage,
  DEFAULT_PREFERENCES,
  DEFAULT_INITIAL_STATE,
  SEED_CHECK_IN_HISTORY,
} from './services/storage';
import { getRecommendation } from './services/recommendationEngine';
import { soundEngine } from './services/soundEngine';
import { Navigation } from './components/Navigation';
import { OnboardingModal } from './components/OnboardingModal';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { PracticePlayer } from './components/PracticePlayer';
import { PostPracticeFeedback } from './components/PostPracticeFeedback';
import { AlternativePathsModal } from './components/AlternativePathsModal';
import { HomeDashboard } from './components/HomeDashboard';
import { ExploreView } from './components/ExploreView';
import { ProgressView } from './components/ProgressView';
import { ProfileView } from './components/ProfileView';

export default function App() {
  // App state
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    storage.getPreferences()
  );
  const [currentState, setCurrentState] = useState<EmotionalState>(() =>
    storage.getCurrentState()
  );
  const [history, setHistory] = useState<CheckInRecord[]>(() =>
    storage.getCheckIns()
  );

  // Active view tab: 'home' | 'explore' | 'progress' | 'profile'
  const [currentTab, setCurrentTab] = useState<
    'home' | 'explore' | 'progress' | 'profile'
  >('home');

  // Modal / Flow states
  const [showOnboarding, setShowOnboarding] = useState<boolean>(
    !preferences.onboarded
  );
  const [showCheckInModal, setShowCheckInModal] = useState<boolean>(false);
  const [activePractice, setActivePractice] = useState<Practice | null>(null);
  const [stateBeforePractice, setStateBeforePractice] =
    useState<EmotionalState | null>(null);
  const [showPostFeedback, setShowPostFeedback] = useState<boolean>(false);
  const [showAlternativesModal, setShowAlternativesModal] =
    useState<boolean>(false);
  const [selectedExploreItem, setSelectedExploreItem] =
    useState<ExploreItem | null>(null);

  // Calculate streak
  const streakDays = Math.max(
    1,
    new Set(history.map((h) => h.dateStr || new Date(h.timestamp).toDateString()))
      .size
  );

  // Recommendation derived from current state and history
  const [recommendation, setRecommendation] = useState<RecommendationResult>(
    () => getRecommendation(currentState, history)
  );

  // Sync sound engine
  useEffect(() => {
    soundEngine.setMuted(!preferences.soundEnabled);
  }, [preferences.soundEnabled]);

  // Recalculate recommendation when currentState or history updates
  useEffect(() => {
    const rec = getRecommendation(currentState, history);
    setRecommendation(rec);
  }, [currentState, history]);

  // Save changes to localStorage
  const handleUpdatePreferences = (updated: UserPreferences) => {
    setPreferences(updated);
    storage.savePreferences(updated);
  };

  const handleCompleteOnboarding = (updated: UserPreferences) => {
    setPreferences(updated);
    storage.savePreferences(updated);
    setShowOnboarding(false);
  };

  // Handle Daily Check In completion
  const handleCheckInComplete = (newState: EmotionalState) => {
    setCurrentState(newState);
    storage.saveCurrentState(newState);
    setShowCheckInModal(false);

    // If user clicked "Yes, show my recommendation"
    if (newState.wantsToAct) {
      const rec = getRecommendation(newState, history);
      setRecommendation(rec);

      // If user consistently dislikes meditation, open Alternatives directly
      if (rec.suggestExploreFirst) {
        setShowAlternativesModal(true);
      }
    } else {
      // Just record the check-in
      const newRecord: CheckInRecord = {
        id: `checkin-${Date.now()}`,
        dateStr: new Date().toISOString().split('T')[0],
        timeOfDay: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        stateBefore: newState,
        timestamp: Date.now(),
      };
      const updatedHistory = [newRecord, ...history];
      setHistory(updatedHistory);
      storage.saveCheckIn(newRecord);
    }
  };

  // Start Practice
  const handleStartPractice = (practice: Practice) => {
    setStateBeforePractice(currentState);
    setActivePractice(practice);
  };

  // When practice completes in player
  const handlePracticeFinished = () => {
    setActivePractice(null);
    setShowPostFeedback(true);
  };

  // Save Post-Practice feedback
  const handleSaveFeedback = (feedback: {
    stateAfter: { energy: number; stress: number; mood: number };
    didHelp: 'yes' | 'little' | 'not_really';
    wouldDoAgain: 'yes' | 'maybe' | 'no';
    notes?: string;
  }) => {
    if (!stateBeforePractice || !activePractice) {
      // Use fallback practice if not set
      const practice = recommendation.practice;
      const record: CheckInRecord = {
        id: `practice-${Date.now()}`,
        dateStr: new Date().toISOString().split('T')[0],
        timeOfDay: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        stateBefore: currentState,
        stateAfter: feedback.stateAfter,
        practiceId: practice.id,
        practiceTitle: practice.title,
        didHelp: feedback.didHelp,
        wouldDoAgain: feedback.wouldDoAgain,
        notes: feedback.notes,
        completedAt: Date.now(),
        timestamp: Date.now(),
      };

      const updatedHistory = [record, ...history];
      setHistory(updatedHistory);
      storage.saveCheckIn(record);
      setShowPostFeedback(false);
      return;
    }

    const record: CheckInRecord = {
      id: `practice-${Date.now()}`,
      dateStr: new Date().toISOString().split('T')[0],
      timeOfDay: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      stateBefore: stateBeforePractice,
      stateAfter: feedback.stateAfter,
      practiceId: activePractice.id,
      practiceTitle: activePractice.title,
      didHelp: feedback.didHelp,
      wouldDoAgain: feedback.wouldDoAgain,
      notes: feedback.notes,
      completedAt: Date.now(),
      timestamp: Date.now(),
    };

    const updatedHistory = [record, ...history];
    setHistory(updatedHistory);
    storage.saveCheckIn(record);

    // Update current state to reflect post-practice
    const updatedState: EmotionalState = {
      ...currentState,
      energy: feedback.stateAfter.energy,
      stress: feedback.stateAfter.stress,
      mood: feedback.stateAfter.mood,
      timestamp: Date.now(),
    };
    setCurrentState(updatedState);
    storage.saveCurrentState(updatedState);

    setShowPostFeedback(false);
  };

  // Demo Resets
  const handleResetSampleData = () => {
    setHistory(SEED_CHECK_IN_HISTORY);
    setCurrentState(DEFAULT_INITIAL_STATE);
    storage.saveCurrentState(DEFAULT_INITIAL_STATE);
    localStorage.setItem(
      'mindful_companion_checkins_v1',
      JSON.stringify(SEED_CHECK_IN_HISTORY)
    );
    alert('Loaded 6-day sample mindful journey with before & after ratings!');
  };

  const handleClearAll = () => {
    storage.resetAllData();
    setPreferences(DEFAULT_PREFERENCES);
    setCurrentState(DEFAULT_INITIAL_STATE);
    setHistory([]);
    setShowOnboarding(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#2D2D2D] flex flex-col justify-between selection:bg-[#E8E2D9] selection:text-[#4A5D4A]">
      {/* Top Mobile-First App Wrapper */}
      <main className="flex-1 w-full max-w-md mx-auto pt-4 px-3 sm:px-0">
        {currentTab === 'home' && (
          <HomeDashboard
            preferences={preferences}
            currentState={currentState}
            recommendation={recommendation}
            streakDays={streakDays}
            onOpenCheckIn={() => setShowCheckInModal(true)}
            onStartPractice={handleStartPractice}
            onNotWhatINeed={() => setShowAlternativesModal(true)}
            onGoToExplore={() => setCurrentTab('explore')}
          />
        )}

        {currentTab === 'explore' && (
          <ExploreView
            onStartDiyPractice={(item) => {
              setSelectedExploreItem(item);
            }}
            selectedInitialItem={selectedExploreItem}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressView history={history} streakDays={streakDays} />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onRetakeOnboarding={() => setShowOnboarding(true)}
            onResetSampleData={handleResetSampleData}
            onClearAllData={handleClearAll}
          />
        )}
      </main>

      {/* Persistent Bottom Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCheckIn={() => setShowCheckInModal(true)}
      />

      {/* Guided Practice Active Full-Screen Screen */}
      {activePractice && (
        <PracticePlayer
          practice={activePractice}
          onComplete={handlePracticeFinished}
          onCancel={() => setActivePractice(null)}
        />
      )}

      {/* Post Practice Feedback Modal */}
      {showPostFeedback && (
        <PostPracticeFeedback
          practice={activePractice || recommendation.practice}
          stateBefore={stateBeforePractice || currentState}
          onSaveFeedback={handleSaveFeedback}
          onOpenAlternatives={() => {
            setShowPostFeedback(false);
            setShowAlternativesModal(true);
          }}
        />
      )}

      {/* Daily Check-In Modal Flow */}
      {showCheckInModal && (
        <DailyCheckInModal
          isOpen={showCheckInModal}
          onClose={() => setShowCheckInModal(false)}
          onComplete={handleCheckInComplete}
        />
      )}

      {/* Alternative Paths ("Maybe meditation isn't what you need right now") */}
      {showAlternativesModal && (
        <AlternativePathsModal
          isOpen={showAlternativesModal}
          onClose={() => setShowAlternativesModal(false)}
          onSelectExploreItem={(item) => {
            setShowAlternativesModal(false);
            setSelectedExploreItem(item);
            setCurrentTab('explore');
          }}
          onGoToExploreTab={() => {
            setShowAlternativesModal(false);
            setCurrentTab('explore');
          }}
        />
      )}

      {/* Welcome Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          initialPreferences={preferences}
          onComplete={handleCompleteOnboarding}
        />
      )}
    </div>
  );
}
