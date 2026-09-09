import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Sparkles, Battery, Zap, AlertCircle, Smile, Check, Play, Target } from 'lucide-react';
import { EmotionalState, DesiredState, Practice, GoalReflection } from '../types';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (state: EmotionalState) => void;
  targetPractice?: Practice | null;
  initialState?: EmotionalState | null;
  userGoals?: string[];
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  targetPractice,
  initialState,
  userGoals = [],
}) => {
  const [step, setStep] = useState<number>(1);
  const [energy, setEnergy] = useState<number>(() => initialState?.energy ?? 2);
  const [stress, setStress] = useState<number>(() => initialState?.stress ?? 4);
  const [stressRating10, setStressRating10] = useState<number>(() =>
    initialState?.stressRating10 ?? (initialState?.stress ? initialState.stress * 2 : 6)
  );
  const [mood, setMood] = useState<number>(() => initialState?.mood ?? 2);
  const [whatHappened, setWhatHappened] = useState<string>(() => initialState?.whatHappened ?? '');
  const [desiredState, setDesiredState] = useState<DesiredState>(() => initialState?.desiredState ?? 'Relaxed');
  const [wantsToAct, setWantsToAct] = useState<boolean>(true);

  // Goal reflection state
  const defaultGoal = userGoals.length > 0 ? userGoals[0] : 'Calm & Balance';
  const [selectedGoal, setSelectedGoal] = useState<string>(
    initialState?.goalReflection?.primaryGoal || defaultGoal
  );
  const [goalStatus, setGoalStatus] = useState<GoalReflection['status']>(
    initialState?.goalReflection?.status || 'progressing'
  );
  const [goalNote, setGoalNote] = useState<string>(
    initialState?.goalReflection?.note || ''
  );

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (initialState) {
        setEnergy(initialState.energy ?? 2);
        setStress(initialState.stress ?? 4);
        setStressRating10(
          initialState.stressRating10 ?? (initialState.stress ? initialState.stress * 2 : 6)
        );
        setMood(initialState.mood ?? 2);
        setWhatHappened(initialState.whatHappened ?? '');
        setDesiredState(initialState.desiredState ?? 'Relaxed');
        if (initialState.goalReflection) {
          setSelectedGoal(initialState.goalReflection.primaryGoal);
          setGoalStatus(initialState.goalReflection.status);
          setGoalNote(initialState.goalReflection.note || '');
        }
      }
    }
  }, [isOpen, targetPractice]);

  if (!isOpen) return null;

  const moodLabels: Record<number, { label: string; emoji: string; desc: string }> = {
    1: { label: 'Drained / Low', emoji: '🌧️', desc: 'Feeling overwhelmed, heavy, or down' },
    2: { label: 'Tense / Anxious', emoji: '⚡', desc: 'Racing thoughts, friction, or restlessness' },
    3: { label: 'Steady / Neutral', emoji: '🍃', desc: 'In between, neither high nor low' },
    4: { label: 'Content / Good', emoji: '☀️', desc: 'Comfortable, at ease, and capable' },
    5: { label: 'Vibrant / Joyful', emoji: '✨', desc: 'High vitality, optimism, and flow' },
  };

  const energyLabels: Record<number, string> = {
    1: 'Empty',
    2: 'Low',
    3: 'Moderate',
    4: 'High',
    5: 'Surging',
  };

  const stressLabels: Record<number, string> = {
    1: 'Peaceful',
    2: 'Mild',
    3: 'Moderate',
    4: 'High',
    5: 'Overwhelmed',
  };

  const quickTriggers = [
    'Heavy meetings & deadlines',
    'Poor sleep last night',
    'Too much screen time',
    'Rushing around',
    'Physical body fatigue',
    'Good productive flow',
    'Uncertain news or worry',
  ];

  const desiredStateOptions: { title: DesiredState; desc: string; icon: string }[] = [
    { title: 'Calm', desc: 'Quiet the mental noise and slow down', icon: '🕊️' },
    { title: 'Relaxed', desc: 'Soften physical and muscular tension', icon: '🌿' },
    { title: 'Energised', desc: 'Boost alertness and physical vitality', icon: '⚡' },
    { title: 'Focused', desc: 'Sharpen attention for what matters', icon: '🎯' },
    { title: 'Grounded', desc: 'Anchor back into the present moment', icon: '⛰️' },
    { title: 'Positive', desc: 'Cultivate gratitude and uplifting perspective', icon: '✨' },
    { title: 'Sleepy / ready for rest', desc: 'Wind down for deep restorative sleep', icon: '🌙' },
  ];

  const handleFinish = (proceedWithAction: boolean) => {
    const defaultNote = targetPractice
      ? `Pre-practice check-in before ${targetPractice.title}`
      : 'Daily check-in';

    const finalState: EmotionalState = {
      energy,
      stress,
      stressRating10,
      mood,
      moodLabel: moodLabels[mood]?.label || 'Neutral',
      whatHappened: whatHappened.trim() || defaultNote,
      desiredState,
      wantsToAct: proceedWithAction,
      goalReflection: {
        primaryGoal: selectedGoal,
        status: goalStatus,
        note: goalNote.trim() || undefined,
      },
      timestamp: Date.now(),
    };
    onComplete(finalState);
  };

  return (
    <div
      id="daily-checkin-modal-backdrop"
      className="fixed inset-0 z-50 bg-[#2D2D2D]/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      <div
        id="daily-checkin-modal-container"
        className="w-full max-w-lg bg-[#FBF9F6] rounded-t-[36px] sm:rounded-[36px] shadow-2xl border border-[#F0EDE8] overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#F0EDE8]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5A6E5A] animate-pulse" />
            <span className="text-[10px] font-semibold text-[#5A6E5A] tracking-[0.2em] uppercase">
              {targetPractice ? 'Pre-Practice Check-In' : 'Daily Check-In'}
            </span>
          </div>
          <button
            id="checkin-btn-close"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F2ED] text-[#7E7468] hover:text-[#2D2D2D] flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step progress & practice context subheader */}
        <div
          className={`px-6 py-2.5 border-b flex items-center justify-between text-xs transition-colors ${
            targetPractice ? 'bg-[#E8F0E8] border-[#C8DACB]' : 'bg-[#F5F2ED] border-[#F0EDE8]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {targetPractice ? (
              <>
                <div className="w-5 h-5 rounded-full bg-[#5A6E5A] text-white flex items-center justify-center flex-shrink-0">
                  <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
                </div>
                <span className="text-[11px] font-semibold text-[#4A5D4A] truncate">
                  Starting: {targetPractice.title} ({targetPractice.durationMinutes} min)
                </span>
              </>
            ) : (
              <span className="text-[11px] font-medium text-[#7E7468]">
                Mindful Reflection & State Calibration
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-[#5A6E5A] uppercase tracking-wider bg-white/90 px-2 py-0.5 rounded-full border border-black/5 flex-shrink-0 ml-2">
            Step {step} of 3
          </span>
        </div>

        {/* Content Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: How are you feeling right now? */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-serif font-light text-[#4A5D4A]">
                  How are you feeling right now?
                </h3>
                <p className="text-xs sm:text-sm text-[#7E7468] mt-1">
                  {targetPractice
                    ? `Take a breath and check in with your baseline before starting ${targetPractice.title}.`
                    : 'Take a breath and check in with your current state. No judgment.'}
                </p>
              </div>

              {/* Energy Level Slider / Stepper */}
              <div className="p-4 rounded-2xl bg-white border border-[#F0EDE8] shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-[#5A6E5A]" />
                    <span className="text-sm font-semibold text-[#2D2D2D]">Energy Level</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E8F0E8] text-[#5A6E5A]">
                    {energy} / 5 · {energyLabels[energy]}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEnergy(lvl)}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        energy === lvl
                          ? 'bg-[#5A6E5A] text-white shadow-sm'
                          : 'bg-[#F5F2ED] text-[#7E7468] hover:bg-[#E8E2D9]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stress Level (1 to 10 Scale) */}
              <div className="p-4 rounded-2xl bg-white border border-[#F0EDE8] shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#A69D91]" />
                    <span className="text-sm font-semibold text-[#2D2D2D]">Stress & Tension (1 to 10)</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F5F2ED] text-[#7E7468]">
                    {stressRating10} / 10
                  </span>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        setStressRating10(lvl);
                        setStress(Math.ceil(lvl / 2));
                      }}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        stressRating10 === lvl
                          ? 'bg-[#5A6E5A] text-white shadow-sm'
                          : 'bg-[#F5F2ED] text-[#7E7468] hover:bg-[#E8E2D9]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-[#A69D91]">
                  <span>1 = Peaceful</span>
                  <span>5 = Moderate</span>
                  <span>10 = Overwhelmed</span>
                </div>
              </div>

              {/* Overall Mood Rating */}
              <div className="p-4 rounded-2xl bg-white border border-[#F0EDE8] shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smile className="w-4 h-4 text-[#5A6E5A]" />
                    <span className="text-sm font-semibold text-[#2D2D2D]">General Mood</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E8F0E8] text-[#5A6E5A]">
                    {moodLabels[mood]?.emoji} {moodLabels[mood]?.label}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setMood(lvl)}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        mood === lvl
                          ? 'bg-[#5A6E5A] text-white shadow-sm'
                          : 'bg-[#F5F2ED] text-[#7E7468] hover:bg-[#E8E2D9]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#A69D91] italic text-center">
                  "{moodLabels[mood]?.desc}"
                </p>
              </div>

              <button
                id="checkin-btn-step1-next"
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-4 px-6 rounded-2xl bg-[#5A6E5A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#4A5D4A] active:scale-[0.99] transition-all shadow-md shadow-[#5A6E5A]/25 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: What happened today? & Desired state */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-2xl font-serif font-light text-[#4A5D4A]">
                  {targetPractice ? "What's on your mind right now?" : 'What happened today?'}
                </h3>
                <p className="text-xs sm:text-sm text-[#7E7468] mt-1">
                  {targetPractice
                    ? 'Briefly capture any thoughts, physical sensations, or context you bring to this session.'
                    : 'Briefly capture anything that influenced your mood or energy.'}
                </p>
              </div>

              <div>
                <textarea
                  id="checkin-input-whathappened"
                  rows={3}
                  value={whatHappened}
                  onChange={(e) => setWhatHappened(e.target.value)}
                  placeholder={
                    targetPractice
                      ? `e.g., Feeling shoulder tension, need to reset after back-to-back tasks...`
                      : 'e.g., Long afternoon meeting, caught in rain, felt rushed...'
                  }
                  className="w-full p-4 rounded-2xl bg-white border border-[#F0EDE8] text-[#2D2D2D] placeholder-[#A69D91] focus:outline-none focus:ring-2 focus:ring-[#5A6E5A]/30 focus:border-[#5A6E5A] text-sm resize-none"
                />

                {/* Quick Prompts */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {quickTriggers.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setWhatHappened((prev) => (prev ? `${prev}, ${item}` : item))
                      }
                      className="px-2.5 py-1 rounded-full text-xs bg-[#F5F2ED] text-[#7E7468] hover:bg-[#E8E2D9] border border-[#F0EDE8] transition-all cursor-pointer"
                    >
                      + {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal Check-In Reflection Section */}
              <div className="p-4 rounded-2xl bg-white border border-[#F0EDE8] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#5A6E5A]" />
                    <span className="text-sm font-semibold text-[#2D2D2D]">Check-In on Your Goal</span>
                  </div>
                  {userGoals.length > 1 ? (
                    <select
                      value={selectedGoal}
                      onChange={(e) => setSelectedGoal(e.target.value)}
                      className="text-xs font-semibold px-2 py-1 rounded-xl bg-[#F5F2ED] text-[#5A6E5A] border border-[#E8E2D9] focus:outline-none"
                    >
                      {userGoals.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E8F0E8] text-[#5A6E5A]">
                      {selectedGoal}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#7E7468]">
                  How aligned do you feel with your focus area today?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'progressing', label: 'Progressing well', icon: '🌿' },
                    { id: 'need_support', label: 'Need gentle support', icon: '🤝' },
                    { id: 'distracted', label: 'Feeling distracted', icon: '🌪️' },
                    { id: 'breakthrough', label: 'Had a breakthrough', icon: '💡' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setGoalStatus(opt.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        goalStatus === opt.id
                          ? 'bg-[#5A6E5A] text-white border-[#5A6E5A] shadow-xs'
                          : 'bg-[#FBF9F6] text-[#7E7468] border-[#F0EDE8] hover:bg-[#F5F2ED]'
                      }`}
                    >
                      <span>{opt.icon}</span>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-sm font-semibold text-[#2D2D2D] mb-1">
                  How would you like to feel?
                </h4>
                <p className="text-xs text-[#7E7468] mb-3">
                  {targetPractice
                    ? 'Confirm your intended state for this practice session.'
                    : 'Choose the state you want to invite in right now.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {desiredStateOptions.map((opt) => {
                    const selected = desiredState === opt.title;
                    return (
                      <button
                        key={opt.title}
                        type="button"
                        onClick={() => setDesiredState(opt.title)}
                        className={`p-3.5 rounded-2xl text-left border flex items-start justify-between transition-all cursor-pointer ${
                          selected
                            ? 'bg-[#5A6E5A] text-white border-[#5A6E5A] shadow-sm'
                            : 'bg-white text-[#2D2D2D] border-[#F0EDE8] hover:bg-[#F5F2ED]'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            <span>{opt.icon}</span>
                            <span>{opt.title}</span>
                          </div>
                          <div
                            className={`text-[11px] mt-0.5 ${
                              selected ? 'text-[#E8F0E8]' : 'text-[#7E7468]'
                            }`}
                          >
                            {opt.desc}
                          </div>
                        </div>
                        {selected && (
                          <Check className="w-4 h-4 text-[#E8F0E8] flex-shrink-0 ml-1.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3.5 px-5 rounded-2xl border border-[#F0EDE8] bg-white text-[#7E7468] text-sm font-medium hover:bg-[#F5F2ED] transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  id="checkin-btn-step2-next"
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-[#5A6E5A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#4A5D4A] active:scale-[0.99] transition-all shadow-md shadow-[#5A6E5A]/25 cursor-pointer"
                >
                  <span>{targetPractice ? 'Review & Begin' : 'Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Final confirmation */}
          {step === 3 && (
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-[#E8F0E8] text-[#5A6E5A] flex items-center justify-center mx-auto shadow-inner">
                {targetPractice ? (
                  <Play className="w-7 h-7 fill-[#5A6E5A] text-[#5A6E5A] ml-1" />
                ) : (
                  <Sparkles className="w-8 h-8 text-[#5A6E5A]" />
                )}
              </div>

              <div>
                <h3 className="text-2xl font-serif font-light text-[#4A5D4A]">
                  {targetPractice
                    ? 'Ready to begin your practice?'
                    : 'Do you want to do something for yourself right now?'}
                </h3>
                <p className="text-xs sm:text-sm text-[#7E7468] max-w-sm mx-auto mt-2 leading-relaxed">
                  {targetPractice ? (
                    <>
                      We've captured your starting baseline (Energy {energy}/5, Stress {stress}/5, Mood: {moodLabels[mood]?.label}). Let's start <strong>{targetPractice.title}</strong> ({targetPractice.durationMinutes} min).
                    </>
                  ) : (
                    <>
                      We’ve analyzed your current state (Energy {energy}/5, Stress {stress}/5) and your goal to feel <strong>{desiredState}</strong>.
                    </>
                  )}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#F0EDE8] text-left max-w-sm mx-auto space-y-1 text-xs text-[#7E7468]">
                <div className="font-semibold text-[#2D2D2D]">
                  {targetPractice ? 'Pre-Practice Baseline:' : 'Summary of your check-in:'}
                </div>
                <div>• Current State: Energy {energy}/5 · Stress {stress}/5 · Mood: {moodLabels[mood]?.label}</div>
                <div>• Session Goal: {desiredState}</div>
                {whatHappened && <div>• Reflection: "{whatHappened}"</div>}
              </div>

              <div className="space-y-3 pt-2">
                {targetPractice ? (
                  <>
                    <button
                      id="checkin-btn-start-practice"
                      type="button"
                      onClick={() => handleFinish(true)}
                      className="w-full py-4 px-6 rounded-2xl bg-[#5A6E5A] text-white font-medium text-base flex items-center justify-center gap-2 hover:bg-[#4A5D4A] active:scale-[0.99] transition-all shadow-lg shadow-[#5A6E5A]/25 cursor-pointer"
                    >
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                      <span>Start Practice ({targetPractice.durationMinutes} min)</span>
                    </button>

                    <button
                      id="checkin-btn-cancel-practice"
                      type="button"
                      onClick={onClose}
                      className="w-full py-3 px-6 rounded-2xl bg-transparent text-[#7E7468] hover:text-[#2D2D2D] border border-[#F0EDE8] hover:bg-[#F5F2ED] font-medium text-sm transition-all cursor-pointer"
                    >
                      Cancel session
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      id="checkin-btn-yes-act"
                      type="button"
                      onClick={() => handleFinish(true)}
                      className="w-full py-4 px-6 rounded-2xl bg-[#5A6E5A] text-white font-medium text-base flex items-center justify-center gap-2 hover:bg-[#4A5D4A] active:scale-[0.99] transition-all shadow-lg shadow-[#5A6E5A]/25 cursor-pointer"
                    >
                      <Sparkles className="w-5 h-5 text-[#E8F0E8]" />
                      <span>Yes, show my recommendation</span>
                    </button>

                    <button
                      id="checkin-btn-not-now"
                      type="button"
                      onClick={() => handleFinish(false)}
                      className="w-full py-3.5 px-6 rounded-2xl bg-transparent text-[#7E7468] hover:text-[#2D2D2D] border border-[#F0EDE8] hover:bg-[#F5F2ED] font-medium text-sm transition-all cursor-pointer"
                    >
                      Not now, just save my check-in
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
