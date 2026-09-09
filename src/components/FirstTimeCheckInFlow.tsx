import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ThumbsUp,
  Smile,
  AlertCircle,
  Play,
  RotateCcw,
  LogIn,
  Heart,
  ShieldCheck,
  Brain,
  Wind,
  Clock,
  ChevronRight,
  TrendingDown,
  UserX,
  Youtube,
} from 'lucide-react';
import { Practice, AICheckInAnalysis, AIRecommendationOption, CheckInRecord, EmotionalState } from '../types';
import { analyzeCheckInWithAttune } from '../services/recommendationEngine';
import { PracticePlayer } from './PracticePlayer';
import { MiniVideoEmbed } from './MiniVideoEmbed';
import { soundEngine } from '../services/soundEngine';

interface FirstTimeCheckInFlowProps {
  onGoogleSignIn: () => Promise<void>;
  onCompleteAsGuest: (record: CheckInRecord, currentState: EmotionalState) => void;
  isSyncing?: boolean;
  authError?: string | null;
}

type FlowStep =
  | 'welcome_and_questions'
  | 'analyzing'
  | 'recommendations_ready'
  | 'practicing'
  | 'post_practice_checkin'
  | 'value_and_account_prompt';

export const FirstTimeCheckInFlow: React.FC<FirstTimeCheckInFlowProps> = ({
  onGoogleSignIn,
  onCompleteAsGuest,
  isSyncing = false,
  authError = null,
}) => {
  const [step, setStep] = useState<FlowStep>('welcome_and_questions');

  // Question 1: How are you feeling?
  const [userMessage, setUserMessage] = useState<string>('');
  const [selectedFeelingTags, setSelectedFeelingTags] = useState<string[]>([]);

  // Question 2: Stress rating (1 to 10 scale)
  const [stressRating10, setStressRating10] = useState<number>(6);

  // Question 3: Desired outcome
  const [desiredOutcome, setDesiredOutcome] = useState<string>('Calm & unwind');

  // AI Analysis & Recommendations
  const [aiAnalysis, setAiAnalysis] = useState<AICheckInAnalysis | null>(null);
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [expandedVideoIdx, setExpandedVideoIdx] = useState<number | null>(null);

  // Post-Practice State
  const [postStressRating10, setPostStressRating10] = useState<number>(3);
  const [postFeelingMessage, setPostFeelingMessage] = useState<string>('');
  const [didHelp, setDidHelp] = useState<'yes' | 'little' | 'not_really'>('yes');
  const [completedRecord, setCompletedRecord] = useState<CheckInRecord | null>(null);

  const quickFeelings = [
    'Overwhelmed',
    'Exhausted',
    'Restless',
    'Tense shoulders',
    'Scattered mind',
    'Anxious',
    'Low energy',
    'Rushing',
    'Quietly tired',
  ];

  const desiredOptions = [
    { label: 'Calm & unwind', icon: '🕊️', desc: 'Slow down mental chatter and breathing' },
    { label: 'Release tension', icon: '🌿', desc: 'Soften tight muscles in neck, jaw, and back' },
    { label: 'Quick reset', icon: '⚡', desc: 'Shake off fatigue and regain alertness' },
    { label: 'Sharpen focus', icon: '🎯', desc: 'Steady single-point cognitive clarity' },
    { label: 'Wind down', icon: '🌙', desc: 'Prepare body and mind for deep restful sleep' },
  ];

  const getStressLabel = (val: number) => {
    if (val <= 2) return { text: 'Deeply Calm & Peaceful', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (val <= 4) return { text: 'Low Stress / Manageable', color: 'text-teal-700 bg-teal-50 border-teal-200' };
    if (val <= 6) return { text: 'Moderate Tension / Strain', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (val <= 8) return { text: 'High Stress / Feeling Pressured', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { text: 'Severe Overwhelm / Burnout', color: 'text-red-700 bg-red-50 border-red-200' };
  };

  const toggleFeelingTag = (tag: string) => {
    if (selectedFeelingTags.includes(tag)) {
      setSelectedFeelingTags(selectedFeelingTags.filter((t) => t !== tag));
    } else {
      setSelectedFeelingTags([...selectedFeelingTags, tag]);
    }
  };

  // Step 1 -> Analyze with Attune AI
  const handleStartAnalysis = async () => {
    setStep('analyzing');
    soundEngine.playChime();

    // Call Attune AI endpoint
    const result = await analyzeCheckInWithAttune({
      message: userMessage.trim(),
      stressRating10,
      desiredOutcome,
      feelingTags: selectedFeelingTags,
    });

    setAiAnalysis(result);
    // Initialize post-practice stress rating to be lower for convenience
    setPostStressRating10(Math.max(1, Math.round(stressRating10 * 0.5)));
    setStep('recommendations_ready');
  };

  // User chooses ANY ONE recommendation
  const handleSelectPractice = (practice: Practice) => {
    setSelectedPractice(practice);
    setStep('practicing');
  };

  // Practice finishes -> Post-Practice Check-in
  const handlePracticeComplete = () => {
    setStep('post_practice_checkin');
    soundEngine.playBell();
  };

  // Submit Post-Practice Feedback
  const handleSavePostPractice = () => {
    if (!selectedPractice) return;

    const initialEmotionalState: EmotionalState = {
      energy: stressRating10 >= 7 ? 2 : 3,
      stress: Math.ceil(stressRating10 / 2),
      stressRating10,
      mood: stressRating10 >= 7 ? 2 : 3,
      moodLabel: selectedFeelingTags[0] || 'Checked In',
      whatHappened: userMessage,
      desiredState: desiredOutcome as any,
      wantsToAct: true,
      timestamp: Date.now() - (selectedPractice.durationMinutes * 60000),
    };

    const record: CheckInRecord = {
      id: `checkin-${Date.now()}`,
      dateStr: new Date().toISOString().split('T')[0],
      timeOfDay: new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening',
      stateBefore: initialEmotionalState,
      stressRating10Before: stressRating10,
      stressRating10After: postStressRating10,
      userMessage,
      stateAfter: {
        energy: Math.min(5, initialEmotionalState.energy + 1),
        stress: Math.ceil(postStressRating10 / 2),
        mood: didHelp === 'yes' ? 4 : 3,
      },
      practiceId: selectedPractice.id,
      practiceTitle: selectedPractice.title,
      didHelp,
      wouldDoAgain: didHelp === 'yes' ? 'yes' : 'maybe',
      notes: postFeelingMessage,
      completedAt: Date.now(),
      timestamp: Date.now(),
    };

    setCompletedRecord(record);
    setStep('value_and_account_prompt');
  };

  // User decides to continue as guest
  const handleProceedAsGuest = () => {
    if (completedRecord) {
      const currentState: EmotionalState = {
        ...completedRecord.stateBefore,
        stress: Math.ceil(postStressRating10 / 2),
        stressRating10: postStressRating10,
        energy: completedRecord.stateAfter?.energy ?? 3,
        mood: completedRecord.stateAfter?.mood ?? 4,
        moodLabel: didHelp === 'yes' ? 'Grounded & Relieved' : 'Steady',
        timestamp: Date.now(),
      };
      onCompleteAsGuest(completedRecord, currentState);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Top Banner: Status Header explicitly stating Not Logged In */}
      <div className="flex items-center justify-between bg-white border border-[#E6DFD5] rounded-xl px-5 py-3 shadow-xs mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <div className="flex items-center gap-1.5 text-sm font-medium text-[#4A5D4E]">
            <UserX className="w-4 h-4 text-amber-600" />
            <span>Not logged in</span>
          </div>
          <span className="text-xs text-[#7D7566] hidden sm:inline">
            · First-time visitor mode
          </span>
        </div>

        <button
          onClick={onGoogleSignIn}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#2D4A3E] bg-[#F4EFE6] hover:bg-[#EAE2D5] border border-[#DCD3C5] transition-colors"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>{isSyncing ? 'Signing in...' : 'Sign in with Google'}</span>
        </button>
      </div>

      {authError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Authentication Notice</p>
            <p className="text-xs mt-0.5">{authError}</p>
          </div>
        </div>
      )}

      {/* STEP 1: WELCOME & INITIAL QUESTIONS */}
      {step === 'welcome_and_questions' && (
        <div className="space-y-8 animate-fade-in">
          {/* Welcome Message */}
          <div className="bg-white border border-[#E6DFD5] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2EE] text-[#2D4A3E] text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#2D4A3E]" />
              <span>Welcome to Attune</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#1C2826] font-normal leading-snug">
              Let&apos;s start with how you are feeling right now.
            </h1>
            <p className="text-sm sm:text-base text-[#685F50] mt-2.5 leading-relaxed max-w-xl">
              Take a quiet pause. Because you are new here, we do not have any pre-existing data about you.
              Answer a couple of quick questions, and our Attune AI companion will thoroughly analyze your check-in to provide personalized recommendations.
            </p>
          </div>

          {/* Question 1: How are you feeling? */}
          <div className="bg-white border border-[#E6DFD5] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#2D4A3E] uppercase tracking-wider">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#2D4A3E] text-white text-xs">
                1
              </span>
              <span>How are you feeling today?</span>
            </div>

            <p className="text-sm text-[#7D7566]">
              Share what is on your mind, what happened during your day, or how your physical body feels:
            </p>

            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="e.g. Back-to-back meetings all day, tight neck muscles, and feeling drained by constant screen time..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#DCD3C5] bg-[#FDFBF7] text-[#2D4A3E] placeholder-[#A89E90] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#2D4A3E] focus:border-transparent transition-all"
            />

            <div>
              <p className="text-xs text-[#8E8575] font-medium mb-2">Or tap feelings that resonate:</p>
              <div className="flex flex-wrap gap-2">
                {quickFeelings.map((tag) => {
                  const isSelected = selectedFeelingTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleFeelingTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-[#2D4A3E] text-white border-[#2D4A3E]'
                          : 'bg-[#F9F7F2] text-[#554E41] border-[#E6DFD5] hover:bg-[#F2EFE8]'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Question 2: Stress Level (1 to 10 Scale) */}
          <div className="bg-white border border-[#E6DFD5] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#2D4A3E] uppercase tracking-wider">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#2D4A3E] text-white text-xs">
                  2
                </span>
                <span>Rate your stress level today (1 to 10)</span>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  getStressLabel(stressRating10).color
                }`}
              >
                {stressRating10} / 10 · {getStressLabel(stressRating10).text}
              </div>
            </div>

            <p className="text-sm text-[#7D7566]">
              Select a number on the scale below representing your overall stress or strain:
            </p>

            {/* 1-10 Button Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = stressRating10 === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setStressRating10(num);
                      soundEngine.playClick();
                    }}
                    className={`h-12 rounded-xl flex flex-col items-center justify-center font-semibold text-sm border transition-all ${
                      isSelected
                        ? 'bg-[#2D4A3E] text-white border-[#2D4A3E] shadow-sm scale-105'
                        : 'bg-[#FDFBF7] text-[#4A5D4E] border-[#E0D7C9] hover:bg-[#F4EFE6]'
                    }`}
                  >
                    <span>{num}</span>
                    <span className="text-[10px] opacity-70 font-normal">
                      {num === 1 ? 'Calm' : num === 5 ? 'Mid' : num === 10 ? 'High' : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between text-xs text-[#8E8575] px-1">
              <span>1 = Completely peaceful & relaxed</span>
              <span>10 = Severe overload & burnout</span>
            </div>
          </div>

          {/* Question 3: Desired Outcome */}
          <div className="bg-white border border-[#E6DFD5] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#2D4A3E] uppercase tracking-wider">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#2D4A3E] text-white text-xs">
                3
              </span>
              <span>What would support you best right now?</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {desiredOptions.map((opt) => {
                const isSelected = desiredOutcome === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      setDesiredOutcome(opt.label);
                      soundEngine.playClick();
                    }}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'bg-[#EBF2EE] border-[#2D4A3E] ring-1 ring-[#2D4A3E]'
                        : 'bg-[#FDFBF7] border-[#E6DFD5] hover:bg-[#F7F3EC]'
                    }`}
                  >
                    <span className="text-xl mt-0.5">{opt.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-[#2D4A3E]">{opt.label}</p>
                      <p className="text-xs text-[#7D7566] mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit / Analyze Button */}
          <div className="pt-2">
            <button
              onClick={handleStartAnalysis}
              className="w-full py-4 px-6 rounded-xl font-semibold text-base text-white bg-[#2D4A3E] hover:bg-[#233A31] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Analyze with Attune AI</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <p className="text-center text-xs text-[#8E8575] mt-3">
              Attune thoroughly evaluates your message and stress rating to generate personalized recommendations.
            </p>
          </div>
        </div>
      )}

      {/* STEP 2: ANALYZING STATE */}
      {step === 'analyzing' && (
        <div className="bg-white border border-[#E6DFD5] rounded-2xl p-12 text-center shadow-xs space-y-6 animate-fade-in my-8">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#EBF2EE] animate-ping opacity-60" />
            <div className="relative w-16 h-16 rounded-full bg-[#2D4A3E] flex items-center justify-center text-white shadow-md">
              <Brain className="w-8 h-8 text-amber-300 animate-pulse" />
            </div>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-serif text-[#1C2826]">
              Attune AI is analyzing your check-in...
            </h2>
            <p className="text-sm text-[#685F50] leading-relaxed">
              Synthesizing your message, 1–10 stress score ({stressRating10}/10), and nervous system signals to formulate tailored recommendations.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4EFE6] text-xs font-medium text-[#7D7566]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Evaluating personalized mindfulness & video techniques</span>
          </div>
        </div>
      )}

      {/* STEP 3: RECOMMENDATIONS READY */}
      {step === 'recommendations_ready' && aiAnalysis && (
        <div className="space-y-8 animate-fade-in">
          {/* AI Emotional Analysis Card */}
          <div className="bg-white border border-[#E6DFD5] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2EE] text-[#2D4A3E] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Attune Emotional & Stress Analysis</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#F4EFE6] text-[#554E41] border border-[#E0D7C9]">
                {aiAnalysis.stressAssessment}
              </span>
            </div>

            <p className="text-sm sm:text-base text-[#2D4A3E] leading-relaxed italic bg-[#FAF7F2] p-4 rounded-xl border border-[#EAE2D5]">
              &ldquo;{aiAnalysis.emotionalReflection}&rdquo;
            </p>

            <div className="flex items-center gap-2 text-xs text-[#7D7566] pt-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{aiAnalysis.keyTakeaway}</span>
            </div>
          </div>

          {/* Curated Recommendations Set */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif text-[#1C2826]">
                  Tailored Recommendations for You
                </h3>
                <p className="text-xs text-[#7D7566] mt-0.5">
                  Try any one of these practices designed specifically for your current stress level:
                </p>
              </div>
              <span className="text-xs font-medium text-[#2D4A3E] bg-[#EBF2EE] px-2.5 py-1 rounded-full">
                {aiAnalysis.recommendations.length} Options
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {aiAnalysis.recommendations.map((rec: AIRecommendationOption, idx: number) => {
                const video = rec.practice.videoGuide || rec.videoGuide;
                const isVideoExpanded = expandedVideoIdx === idx;
                const videoReason = rec.videoRecommendationReason || video?.recommendationReason;

                return (
                  <div
                    key={rec.practiceId + idx}
                    className="bg-white border border-[#E6DFD5] hover:border-[#2D4A3E] rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2.5 max-w-xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAE2D5] text-[#4A4031]">
                            {rec.tag}
                          </span>
                          <span className="text-xs font-medium text-[#7D7566] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {rec.practice.durationMinutes} min
                          </span>
                          <span className="text-xs text-[#7D7566] capitalize">
                            · {rec.practice.category.replace('_', ' ')}
                          </span>
                          {rec.practice.isPersonalizedAI && (
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                              Attune Synthesized
                            </span>
                          )}
                        </div>

                        <h4 className="text-lg font-semibold text-[#1C2826]">
                          {rec.practice.title}
                        </h4>

                        <p className="text-xs text-[#685F50]">
                          {rec.practice.subtitle}
                        </p>

                        <div className="p-3 rounded-xl bg-[#FBF9F5] border border-[#EFE9DF] text-xs text-[#2D4A3E] leading-relaxed">
                          <span className="font-semibold">Why Attune recommends this: </span>
                          <span>{rec.reason}</span>
                        </div>

                        {videoReason && (
                          <div className="p-2.5 rounded-xl bg-[#F0EDE8]/70 border border-[#E6DFD5] text-xs text-[#4A5D4E] flex items-start gap-2">
                            <Youtube className="w-4 h-4 text-[#5A6E5A] shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-[#2D4A3E]">Recommended Technique Video: </span>
                              <span>{videoReason}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        <button
                          onClick={() => handleSelectPractice(rec.practice)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-[#2D4A3E] hover:bg-[#233A31] active:scale-95 transition-all shadow-sm cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>Try Interactive Practice</span>
                        </button>

                        {video && (
                          <button
                            type="button"
                            onClick={() => setExpandedVideoIdx(isVideoExpanded ? null : idx)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#5A6E5A] bg-[#F5F2ED] hover:bg-[#E8E2D9] border border-[#E6DFD5] transition-colors cursor-pointer"
                          >
                            <Youtube className="w-3.5 h-3.5 text-[#5A6E5A]" />
                            <span>{isVideoExpanded ? 'Hide Video Guide' : `Watch Video Guide (${video.duration || '5m'})`}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline Embedded Video Guide */}
                    {video && isVideoExpanded && (
                      <div className="mt-2 pt-4 border-t border-[#F0EDE8] space-y-2 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#2D4A3E]">
                            Attune Video Guide: {video.title} ({video.channelName})
                          </span>
                          <button
                            type="button"
                            onClick={() => setExpandedVideoIdx(null)}
                            className="text-xs text-[#7D7566] hover:text-[#2D4A3E] underline"
                          >
                            Close video
                          </button>
                        </div>
                        <MiniVideoEmbed
                          videoGuide={video}
                          titlePrefix="Attune Video Guide"
                          defaultPlaying={true}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => setStep('welcome_and_questions')}
                className="inline-flex items-center gap-1.5 text-xs text-[#7D7566] hover:text-[#2D4A3E] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Adjust my check-in answers</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: ACTIVE PRACTICE PLAYER */}
      {step === 'practicing' && selectedPractice && (
        <div className="animate-fade-in">
          <div className="mb-4">
            <button
              onClick={() => setStep('recommendations_ready')}
              className="inline-flex items-center gap-1.5 text-xs text-[#7D7566] hover:text-[#2D4A3E] transition-colors"
            >
              ← Back to recommendations
            </button>
          </div>

          <PracticePlayer
            practice={selectedPractice}
            onComplete={handlePracticeComplete}
            onCancel={() => setStep('recommendations_ready')}
          />
        </div>
      )}

      {/* STEP 5: POST-PRACTICE CHECK-IN */}
      {step === 'post_practice_checkin' && selectedPractice && (
        <div className="bg-white border border-[#E6DFD5] rounded-2xl p-6 sm:p-8 shadow-xs space-y-7 animate-fade-in">
          <div className="text-center max-w-md mx-auto space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#EBF2EE] text-[#2D4A3E] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif text-[#1C2826]">
              How are you feeling now?
            </h2>
            <p className="text-sm text-[#685F50]">
              You just finished &ldquo;{selectedPractice.title}&rdquo;. Let&apos;s check in with your mind and body again.
            </p>
          </div>

          {/* Re-Rate Stress Level on 1 to 10 scale */}
          <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#EAE2D5] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#2D4A3E]">
                Update your stress level (1 to 10):
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#7D7566]">Before: {stressRating10}/10</span>
                <ArrowRight className="w-3 h-3 text-[#A89E90]" />
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Now: {postStressRating10}/10
                </span>
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = postStressRating10 === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setPostStressRating10(num);
                      soundEngine.playClick();
                    }}
                    className={`h-11 rounded-lg flex items-center justify-center font-semibold text-xs border transition-all ${
                      isSelected
                        ? 'bg-[#2D4A3E] text-white border-[#2D4A3E] shadow-sm'
                        : 'bg-white text-[#4A5D4E] border-[#E0D7C9] hover:bg-[#F4EFE6]'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {postStressRating10 < stressRating10 && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                <span>
                  That is a {stressRating10 - postStressRating10}-point reduction in your reported stress level!
                </span>
              </div>
            )}
          </div>

          {/* Did this session help? */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#2D4A3E] block">
              Did this practice help?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'yes', label: 'Yes, definitely', icon: '✨' },
                { id: 'little', label: 'A little bit', icon: '🍃' },
                { id: 'not_really', label: 'Not really', icon: '🌧️' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDidHelp(opt.id as any)}
                  className={`p-3 rounded-xl border text-center font-medium text-xs transition-all ${
                    didHelp === opt.id
                      ? 'bg-[#EBF2EE] border-[#2D4A3E] text-[#2D4A3E] font-bold ring-1 ring-[#2D4A3E]'
                      : 'bg-[#FDFBF7] border-[#E6DFD5] text-[#685F50] hover:bg-[#F7F3EC]'
                  }`}
                >
                  <div className="text-lg mb-1">{opt.icon}</div>
                  <div>{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional notes */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#7D7566] block">
              Optional: Any quick thoughts or shifts you noticed?
            </label>
            <input
              type="text"
              value={postFeelingMessage}
              onChange={(e) => setPostFeelingMessage(e.target.value)}
              placeholder="e.g. My shoulders dropped, mind feels quieter..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD3C5] bg-[#FDFBF7] text-sm text-[#2D4A3E] focus:ring-2 focus:ring-[#2D4A3E] focus:outline-hidden"
            />
          </div>

          <button
            onClick={handleSavePostPractice}
            className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white bg-[#2D4A3E] hover:bg-[#233A31] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>See My Session Summary</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 6: VALUE REALIZED & PROMPT TO SIGN IN / CREATE ACCOUNT */}
      {step === 'value_and_account_prompt' && completedRecord && selectedPractice && (
        <div className="bg-white border border-[#E6DFD5] rounded-2xl p-6 sm:p-10 shadow-xs space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center max-w-lg mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Initial Mindful Cycle Completed</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#1C2826]">
              You found value in this practice!
            </h2>
            <p className="text-sm text-[#685F50] leading-relaxed">
              You checked in with yourself, followed an AI-recommended practice, and experienced a tangible shift.
            </p>
          </div>

          {/* Value Summary Card */}
          <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#EAE2D5] space-y-4">
            <h3 className="text-xs font-semibold text-[#8E8575] uppercase tracking-wider">
              Your Session Results
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-[#EAE2D5] space-y-1">
                <span className="text-[11px] text-[#7D7566]">Practice Completed</span>
                <p className="text-sm font-semibold text-[#2D4A3E] truncate">
                  {selectedPractice.title}
                </p>
                <span className="text-[10px] text-[#8E8575]">
                  {selectedPractice.durationMinutes} minutes
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#EAE2D5] space-y-1">
                <span className="text-[11px] text-[#7D7566]">Stress Shift</span>
                <p className="text-sm font-semibold text-[#2D4A3E] flex items-center gap-1.5">
                  <span className="text-orange-700">{stressRating10}/10</span>
                  <ArrowRight className="w-3 h-3 text-[#A89E90]" />
                  <span className="text-emerald-700 font-bold">{postStressRating10}/10</span>
                </p>
                <span className="text-[10px] text-emerald-700 font-medium">
                  {stressRating10 > postStressRating10
                    ? `-${stressRating10 - postStressRating10} points relief`
                    : 'Balanced & steady'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#EAE2D5] space-y-1">
                <span className="text-[11px] text-[#7D7566]">Session Helpfulness</span>
                <p className="text-sm font-semibold text-[#2D4A3E] capitalize">
                  {didHelp === 'yes' ? 'Very Helpful' : didHelp === 'little' ? 'Somewhat Helpful' : 'Recorded'}
                </p>
                <span className="text-[10px] text-[#8E8575]">Feedback captured</span>
              </div>
            </div>

            {userMessage && (
              <div className="text-xs text-[#685F50] border-t border-[#EAE2D5] pt-3">
                <span className="font-medium text-[#4A4031]">Initial check-in note: </span>
                <span className="italic">&ldquo;{userMessage}&rdquo;</span>
              </div>
            )}
          </div>

          {/* Core Prompt to Create an Account / Sign In with Google */}
          <div className="p-6 rounded-2xl bg-[#EBF2EE] border border-[#2D4A3E]/30 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2D4A3E] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-semibold text-[#2D4A3E]">
                  Create an account to store all your details
                </h4>
                <p className="text-xs sm:text-sm text-[#4A5D4E] leading-relaxed">
                  Sign in with Google to save this check-in session, unlock continuous tracking of your daily stress patterns, and allow Attune to adapt future recommendations from your ratings.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onGoogleSignIn}
                disabled={isSyncing}
                className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm text-white bg-[#2D4A3E] hover:bg-[#233A31] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .5 4.1 1.5l3.1-3.1C17.3 1.6 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z"
                  />
                </svg>
                <span>{isSyncing ? 'Connecting...' : 'Sign in with Google to Save Everything'}</span>
              </button>

              <button
                onClick={handleProceedAsGuest}
                className="w-full sm:w-auto py-3.5 px-5 rounded-xl font-medium text-xs text-[#685F50] hover:text-[#2D4A3E] bg-white hover:bg-[#F2ECE1] border border-[#DCD3C5] transition-colors"
              >
                Continue to Dashboard as Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
