/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import {
  UserPreferences,
  EmotionalState,
  CheckInRecord,
  Practice,
  ExploreItem,
  RecommendationResult,
  ReminderSettings,
} from './types';
import {
  storage,
  DEFAULT_PREFERENCES,
  DEFAULT_INITIAL_STATE,
  SEED_CHECK_IN_HISTORY,
} from './services/storage';
import {
  loginWithGoogle,
  logoutUser,
  onAuthChange,
  syncUserProfile,
  loadUserDataFromFirestore,
  saveCheckInToFirestore,
  clearUserCheckInsInFirestore,
  getGoogleAccessToken,
} from './services/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  getLLMRecommendation,
  getFallbackRecommendation,
} from './services/recommendationEngine';
import { soundEngine } from './services/soundEngine';
import {
  syncMindfulCalendarEvent,
  removeMindfulCalendarEvent,
  triggerBrowserNotification,
} from './services/calendarService';
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
import { FirstTimeCheckInFlow } from './components/FirstTimeCheckInFlow';

export default function App() {
  // Google Auth & Cloud Sync states
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<number | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isCalendarSyncing, setIsCalendarSyncing] = useState<boolean>(false);

  // App state
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    storage.getPreferences()
  );
  const [currentState, setCurrentState] = useState<EmotionalState>(() =>
    storage.getCurrentState() || DEFAULT_INITIAL_STATE
  );
  const [history, setHistory] = useState<CheckInRecord[]>(() =>
    storage.getCheckIns()
  );

  // Guest first-time cycle completed flag
  const [hasCompletedGuestCycle, setHasCompletedGuestCycle] = useState<boolean>(
    () => history.length > 0
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
  const [pendingPractice, setPendingPractice] = useState<Practice | null>(null);
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

  // Recommendation derived from current state, history, and user preferences (goals)
  const [recommendation, setRecommendation] = useState<RecommendationResult>(
    () => getFallbackRecommendation(currentState || DEFAULT_INITIAL_STATE, history, preferences)
  );
  const [isRecommendationLoading, setIsRecommendationLoading] = useState<boolean>(false);

  // Sync sound engine
  useEffect(() => {
    soundEngine.setMuted(!preferences.soundEnabled);
  }, [preferences.soundEnabled]);

  // Asynchronously query the Attune AI recommendation engine with state and feedback history
  const refreshLLMRecommendation = async (
    stateToUse: EmotionalState = currentState || DEFAULT_INITIAL_STATE,
    historyToUse: CheckInRecord[] = history
  ) => {
    setIsRecommendationLoading(true);
    try {
      const rec = await getLLMRecommendation(stateToUse, historyToUse, preferences);
      setRecommendation(rec);
    } catch (err) {
      console.error('Failed to get LLM recommendation:', err);
    } finally {
      setIsRecommendationLoading(false);
    }
  };

  // Recalculate LLM recommendation when currentState or recent history changes
  useEffect(() => {
    let isCancelled = false;
    setIsRecommendationLoading(true);

    getLLMRecommendation(currentState || DEFAULT_INITIAL_STATE, history, preferences)
      .then((rec) => {
        if (!isCancelled) {
          setRecommendation(rec);
          setIsRecommendationLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Error fetching recommendation in effect:', err);
          setIsRecommendationLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    currentState?.energy,
    currentState?.stress,
    currentState?.mood,
    currentState?.desiredState,
    currentState?.whatHappened,
    history.length,
    history[0]?.didHelp,
    history[0]?.wouldDoAgain,
  ]);

  // Reminder ticker: Checks every 30 seconds if preferred reminder time has arrived
  const [lastAlarmTriggeredDate, setLastAlarmTriggeredDate] = useState<string>('');

  useEffect(() => {
    const reminderSettings = preferences.reminderSettings;
    if (!reminderSettings || !reminderSettings.enabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHourMinute = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      const todayDateStr = now.toISOString().split('T')[0];

      if (
        currentHourMinute === reminderSettings.preferredTime &&
        lastAlarmTriggeredDate !== todayDateStr
      ) {
        // If weekly, check day of week (e.g. Monday = 1)
        if (reminderSettings.frequency === 'weekly' && now.getDay() !== 1) {
          return;
        }

        setLastAlarmTriggeredDate(todayDateStr);

        // 1. Play ringing alarm chime if enabled
        if (reminderSettings.alarmSoundEnabled && preferences.soundEnabled) {
          soundEngine.playReminderAlarm();
        }

        // 2. Dispatch browser notification if enabled
        if (reminderSettings.browserNotificationEnabled) {
          triggerBrowserNotification('🌿 Time for your Mindful Check-In', {
            body: `Take 2 minutes to check in with your mood and reflect on your goals (${preferences.goals?.join(', ') || 'Calm'}).`,
            onClick: () => {
              setShowCheckInModal(true);
            },
          });
        }

        // 3. Automatically pop up Check-In modal if app is open
        setShowCheckInModal(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [preferences.reminderSettings, preferences.soundEnabled, preferences.goals, lastAlarmTriggeredDate]);

  // Firebase Google Auth Listener & Firestore Data Hydration
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsSyncing(true);
        try {
          // Attempt to load existing user profile and records from Firestore
          const remoteData = await loadUserDataFromFirestore(user.uid);
          if (remoteData && remoteData.profile) {
            // Restore user profile preferences
            if (remoteData.profile.preferences) {
              const mergedPrefs: UserPreferences = {
                ...remoteData.profile.preferences,
                name: remoteData.profile.preferences.name || user.displayName || 'Friend',
              };
              setPreferences(mergedPrefs);
              storage.savePreferences(mergedPrefs);
            }
            // Restore current emotional state
            if (remoteData.profile.currentState) {
              setCurrentState(remoteData.profile.currentState);
              storage.saveCurrentState(remoteData.profile.currentState);
            }
            // Restore historical check-in records
            if (remoteData.checkIns && remoteData.checkIns.length > 0) {
              setHistory(remoteData.checkIns);
              localStorage.setItem(
                'mindful_companion_checkins_v1',
                JSON.stringify(remoteData.checkIns)
              );
            }
          } else {
            // New user in Firestore: seed initial profile and sync existing local records so work isn't lost
            const initialPrefs: UserPreferences = {
              ...preferences,
              name: user.displayName || preferences.name || 'Friend',
            };
            setPreferences(initialPrefs);
            storage.savePreferences(initialPrefs);

            await syncUserProfile(user, {
              preferences: initialPrefs,
              currentState,
              streakDays,
              lastCheckInDate: new Date().toISOString().split('T')[0],
            });

            // Upload current history to Firestore
            for (const record of history) {
              await saveCheckInToFirestore(user.uid, record);
            }
          }
          setLastSyncedTime(Date.now());
        } catch (err) {
          console.error('Failed to hydrate user data from Firestore:', err);
        } finally {
          setIsSyncing(false);
          setIsAuthLoading(false);
        }
      } else {
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Google Login Handler
  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsSyncing(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err?.code === 'auth/popup-blocked') {
        setAuthError(
          'Sign-in popup was blocked by browser. Please enable popups or open the app in a new tab.'
        );
      } else if (err?.code === 'auth/popup-closed-by-user') {
        // Dismissed by user without completing
      } else {
        setAuthError(err?.message || 'Unable to sign in with Google. Please try again.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Google Logout Handler
  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setLastSyncedTime(null);
      setHasCompletedGuestCycle(false);
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };

  // Manual Trigger to Sync with Cloud
  const handleManualSync = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      await syncUserProfile(currentUser, {
        preferences,
        currentState,
        streakDays,
        lastCheckInDate: new Date().toISOString().split('T')[0],
      });
      setLastSyncedTime(Date.now());
    } catch (err) {
      console.error('Manual sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Save changes to localStorage & Cloud
  const handleUpdatePreferences = (updated: UserPreferences) => {
    setPreferences(updated);
    storage.savePreferences(updated);
    if (currentUser) {
      syncUserProfile(currentUser, { preferences: updated })
        .then(() => setLastSyncedTime(Date.now()))
        .catch(console.error);
    }
  };

  // Google Calendar Sync Handler (with auto-provision or update)
  const handleSyncGoogleCalendar = async (settings: ReminderSettings) => {
    setIsCalendarSyncing(true);
    try {
      let token = getGoogleAccessToken();
      if (!token) {
        const loginRes = await loginWithGoogle();
        token = loginRes.accessToken;
      }
      if (!token) {
        throw new Error('Google authorization token not available. Please sign in with Google to grant Calendar access.');
      }
      const eventResult = await syncMindfulCalendarEvent(token, settings, preferences.goals);
      const updatedReminder: ReminderSettings = {
        ...settings,
        googleCalendarEnabled: true,
        googleCalendarEventId: eventResult.eventId,
        googleCalendarEventLink: eventResult.htmlLink,
        lastCalendarSync: Date.now(),
      };
      const updatedPrefs: UserPreferences = {
        ...preferences,
        reminderSettings: updatedReminder,
      };
      handleUpdatePreferences(updatedPrefs);
    } catch (err: any) {
      console.error('Failed to sync Google Calendar event:', err);
      alert(`Calendar Sync Notice: ${err?.message || 'Unable to sync with Google Calendar'}`);
    } finally {
      setIsCalendarSyncing(false);
    }
  };

  // Google Calendar Removal Handler
  const handleRemoveGoogleCalendar = async () => {
    const eventId = preferences.reminderSettings?.googleCalendarEventId;
    if (!eventId) return;
    setIsCalendarSyncing(true);
    try {
      let token = getGoogleAccessToken();
      if (!token) {
        const loginRes = await loginWithGoogle();
        token = loginRes.accessToken;
      }
      if (token) {
        await removeMindfulCalendarEvent(token, eventId);
      }
      const updatedReminder: ReminderSettings = {
        ...(preferences.reminderSettings || DEFAULT_PREFERENCES.reminderSettings!),
        googleCalendarEnabled: false,
        googleCalendarEventId: undefined,
        googleCalendarEventLink: undefined,
        lastCalendarSync: undefined,
      };
      const updatedPrefs: UserPreferences = {
        ...preferences,
        reminderSettings: updatedReminder,
      };
      handleUpdatePreferences(updatedPrefs);
    } catch (err: any) {
      console.error('Failed to remove Google Calendar event:', err);
      alert(`Calendar Notice: ${err?.message || 'Unable to remove event from Google Calendar'}`);
    } finally {
      setIsCalendarSyncing(false);
    }
  };

  const handleCompleteOnboarding = async (updated: UserPreferences) => {
    setPreferences(updated);
    storage.savePreferences(updated);
    setShowOnboarding(false);

    if (currentUser) {
      syncUserProfile(currentUser, { preferences: updated })
        .then(() => setLastSyncedTime(Date.now()))
        .catch(console.error);

      // If user enabled Google Calendar and has token, schedule event immediately
      if (updated.reminderSettings?.googleCalendarEnabled) {
        const token = getGoogleAccessToken();
        if (token) {
          syncMindfulCalendarEvent(token, updated.reminderSettings, updated.goals)
            .then((result) => {
              const withCal: UserPreferences = {
                ...updated,
                reminderSettings: {
                  ...updated.reminderSettings!,
                  googleCalendarEventId: result.eventId,
                  googleCalendarEventLink: result.htmlLink,
                  lastCalendarSync: Date.now(),
                },
              };
              setPreferences(withCal);
              storage.savePreferences(withCal);
              syncUserProfile(currentUser, { preferences: withCal });
            })
            .catch(console.error);
        }
      }
    }
  };

  // Open standard daily check-in
  const handleOpenDailyCheckIn = () => {
    setPendingPractice(null);
    setShowCheckInModal(true);
  };

  // Close check-in modal and cancel pending practice
  const handleCloseCheckInModal = () => {
    setShowCheckInModal(false);
    setPendingPractice(null);
  };

  // Handle Check In completion (for daily check-in or pre-practice check-in)
  const handleCheckInComplete = (newState: EmotionalState) => {
    setCurrentState(newState);
    storage.saveCurrentState(newState);
    setShowCheckInModal(false);

    // If starting a practice session: start practice immediately with fresh baseline
    if (pendingPractice) {
      const practiceToStart = pendingPractice;
      setPendingPractice(null);
      setStateBeforePractice(newState);
      setActivePractice(practiceToStart);

      // Record pre-practice check-in in history
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

      // Persist to Firebase if logged in
      if (currentUser) {
        saveCheckInToFirestore(currentUser.uid, newRecord).catch(console.error);
        syncUserProfile(currentUser, {
          currentState: newState,
          streakDays,
          lastCheckInDate: new Date().toISOString().split('T')[0],
        })
          .then(() => setLastSyncedTime(Date.now()))
          .catch(console.error);
      }
      return;
    }

    // Daily Check-In completion
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

    // Persist to Firebase if logged in
    if (currentUser) {
      saveCheckInToFirestore(currentUser.uid, newRecord).catch(console.error);
      syncUserProfile(currentUser, {
        currentState: newState,
        streakDays,
        lastCheckInDate: new Date().toISOString().split('T')[0],
      })
        .then(() => setLastSyncedTime(Date.now()))
        .catch(console.error);
    }

    if (newState.wantsToAct) {
      const instantRec = getFallbackRecommendation(newState, updatedHistory, preferences);
      setRecommendation(instantRec);

      refreshLLMRecommendation(newState, updatedHistory);

      // If user consistently dislikes meditation, open Alternatives directly
      if (instantRec.suggestExploreFirst) {
        setShowAlternativesModal(true);
      }
    }
  };

  // Start Practice: Prompt mandatory check-in first, then launch practice
  const handleStartPractice = (practice: Practice) => {
    setPendingPractice(practice);
    setShowCheckInModal(true);
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

      if (currentUser) {
        saveCheckInToFirestore(currentUser.uid, record).catch(console.error);
      }
      setShowPostFeedback(false);
      refreshLLMRecommendation(currentState, updatedHistory);
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

    // Persist to Firebase if logged in
    if (currentUser) {
      saveCheckInToFirestore(currentUser.uid, record).catch(console.error);
      syncUserProfile(currentUser, {
        currentState: updatedState,
      })
        .then(() => setLastSyncedTime(Date.now()))
        .catch(console.error);
    }

    setShowPostFeedback(false);

    // Promptly re-query LLM with updated feedback history so the learning loop reflects immediately
    refreshLLMRecommendation(updatedState, updatedHistory);
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
    if (currentUser) {
      syncUserProfile(currentUser, {
        currentState: DEFAULT_INITIAL_STATE,
      }).catch(console.error);
    }
    alert('Loaded 6-day sample mindful journey with before & after ratings!');
  };

  const handleClearAll = () => {
    storage.resetAllData();
    setPreferences(DEFAULT_PREFERENCES);
    setCurrentState(DEFAULT_INITIAL_STATE);
    setHistory([]);
    setShowOnboarding(true);
    if (currentUser) {
      clearUserCheckInsInFirestore(currentUser.uid).catch(console.error);
      syncUserProfile(currentUser, {
        preferences: DEFAULT_PREFERENCES,
        currentState: DEFAULT_INITIAL_STATE,
        streakDays: 1,
      }).catch(console.error);
    }
  };

  const isGuestFirstTime = !currentUser && !hasCompletedGuestCycle && history.length === 0;

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#2D2D2D] flex flex-col justify-between selection:bg-[#E8E2D9] selection:text-[#4A5D4A]">
      {/* Top Mobile-First App Wrapper */}
      <main className="flex-1 w-full max-w-2xl mx-auto pt-4 px-3 sm:px-4">
        {isGuestFirstTime ? (
          <FirstTimeCheckInFlow
            onGoogleSignIn={handleGoogleLogin}
            onCompleteAsGuest={(record, updatedState) => {
              const updatedHistory = [record, ...history];
              setHistory(updatedHistory);
              setCurrentState(updatedState);
              storage.saveCheckIn(record);
              storage.saveCurrentState(updatedState);
              const updatedPrefs = { ...preferences, onboarded: true };
              setPreferences(updatedPrefs);
              storage.savePreferences(updatedPrefs);
              setHasCompletedGuestCycle(true);
              setShowOnboarding(false);
              refreshLLMRecommendation(updatedState, updatedHistory);
            }}
            isSyncing={isSyncing}
            authError={authError}
          />
        ) : (
          <>
            {currentTab === 'home' && (
              <HomeDashboard
                preferences={preferences}
                currentState={currentState}
                recommendation={recommendation}
                streakDays={streakDays}
                onOpenCheckIn={handleOpenDailyCheckIn}
                onStartPractice={handleStartPractice}
                onNotWhatINeed={() => setShowAlternativesModal(true)}
                onGoToExplore={() => setCurrentTab('explore')}
                currentUser={currentUser}
                onGoogleLogin={handleGoogleLogin}
                isSyncing={isSyncing}
                history={history}
                isRecommendationLoading={isRecommendationLoading}
                onRefreshRecommendation={() => refreshLLMRecommendation()}
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
                currentUser={currentUser}
                onGoogleLogin={handleGoogleLogin}
                onLogout={handleLogout}
                isSyncing={isSyncing}
                lastSyncedTime={lastSyncedTime}
                authError={authError}
                onManualSync={handleManualSync}
                onSyncGoogleCalendar={handleSyncGoogleCalendar}
                onRemoveGoogleCalendar={handleRemoveGoogleCalendar}
                isCalendarSyncing={isCalendarSyncing}
              />
            )}
          </>
        )}
      </main>

      {/* Persistent Bottom Navigation - hidden during guest first-time check-in */}
      {!isGuestFirstTime && (
        <Navigation
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenCheckIn={handleOpenDailyCheckIn}
        />
      )}

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

      {/* Check-In Modal Flow (Daily or Pre-Practice) */}
      {showCheckInModal && (
        <DailyCheckInModal
          isOpen={showCheckInModal}
          onClose={handleCloseCheckInModal}
          onComplete={handleCheckInComplete}
          targetPractice={pendingPractice}
          initialState={currentState}
          userGoals={preferences.goals}
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
      {showOnboarding && !isGuestFirstTime && (
        <OnboardingModal
          initialPreferences={preferences}
          onComplete={handleCompleteOnboarding}
          currentUser={currentUser}
          onGoogleLogin={handleGoogleLogin}
        />
      )}

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}
