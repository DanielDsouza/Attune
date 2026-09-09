import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowRight, CheckCircle2, ThumbsUp, ThumbsDown, HelpCircle, Star } from 'lucide-react';
import { EmotionalState, Practice } from '../types';

interface PostPracticeFeedbackProps {
  practice: Practice;
  stateBefore: EmotionalState;
  onSaveFeedback: (feedback: {
    stateAfter: { energy: number; stress: number; mood: number };
    didHelp: 'yes' | 'little' | 'not_really';
    wouldDoAgain: 'yes' | 'maybe' | 'no';
    notes?: string;
  }) => void;
  onOpenAlternatives: () => void;
}

export const PostPracticeFeedback: React.FC<PostPracticeFeedbackProps> = ({
  practice,
  stateBefore,
  onSaveFeedback,
  onOpenAlternatives,
}) => {
  const safeStateBefore = stateBefore || {
    energy: 2,
    stress: 4,
    mood: 2,
    desiredState: 'Calm' as const,
    timestamp: Date.now(),
  };

  const [energyAfter, setEnergyAfter] = useState<number>(
    Math.min(5, Math.max(1, (safeStateBefore.energy ?? 2) + 1))
  );
  const [stressAfter, setStressAfter] = useState<number>(
    Math.max(1, (safeStateBefore.stress ?? 4) - 2)
  );
  const [moodAfter, setMoodAfter] = useState<number>(
    Math.min(5, Math.max(1, (safeStateBefore.mood ?? 2) + 1))
  );

  const [didHelp, setDidHelp] = useState<'yes' | 'little' | 'not_really'>('yes');
  const [wouldDoAgain, setWouldDoAgain] = useState<'yes' | 'maybe' | 'no'>('yes');
  const [notes, setNotes] = useState<string>('');
  const [step, setStep] = useState<number>(1); // 1: Post Ratings & Comparison, 2: Did it help & save

  useEffect(() => {
    // Gentle celebration burst
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2D4A3E', '#A66E38', '#E4D5B7', '#564F8A'],
        disableForReducedMotion: true,
      });
    } catch {
      // Ignore
    }
  }, []);

  const renderStars = (count: number, max: number = 5, color: string = 'text-[#A66E38]') => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className={`text-sm ${
              i < count ? color : 'text-[#D1C6B4]'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const handleFinish = () => {
    onSaveFeedback({
      stateAfter: {
        energy: energyAfter,
        stress: stressAfter,
        mood: moodAfter,
      },
      didHelp,
      wouldDoAgain,
      notes,
    });

    if (didHelp === 'not_really') {
      onOpenAlternatives();
    }
  };

  return (
    <div
      id="post-practice-feedback-modal"
      className="fixed inset-0 z-50 bg-[#2D2D2D]/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      <div
        id="post-practice-card"
        className="w-full max-w-lg bg-[#FBF9F6] rounded-t-[36px] sm:rounded-[36px] shadow-2xl border border-[#F0EDE8] overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-[#F0EDE8] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6E5A]">
            <CheckCircle2 className="w-4 h-4 text-[#5A6E5A]" />
            <span>Practice Completed: {practice.title}</span>
          </div>
          <span className="text-[10px] text-[#A69D91] font-semibold uppercase tracking-wider">Reflect & Learn</span>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-serif font-light text-[#4A5D4A]">
                  How do you feel now?
                </h3>
                <p className="text-xs sm:text-sm text-[#7E7468] mt-1">
                  Notice any shifts in your body, breath, or mental clarity.
                </p>
              </div>

              {/* Interactive Post-Ratings */}
              <div className="space-y-3">
                {/* Energy */}
                <div className="p-4 rounded-2xl bg-white border border-[#F0EDE8] shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#2D2D2D]">Energy Now</span>
                    <span className="text-xs font-bold text-[#5A6E5A]">Level {energyAfter} / 5</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setEnergyAfter(lvl)}
                        className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                          energyAfter === lvl
                            ? 'bg-[#5A6E5A] text-white shadow-sm'
                            : 'bg-[#F5F2ED] text-[#7E7468] hover:bg-[#E8E2D9]'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stress */}
                <div className="p-4 rounded-2xl bg-white border border-[#F0EDE8] shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#2D2D2D]">Stress & Tension Now</span>
                    <span className="text-xs font-bold text-[#A69D91]">Level {stressAfter} / 5</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setStressAfter(lvl)}
                        className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                          stressAfter === lvl
                            ? 'bg-[#5A6E5A] text-white shadow-sm'
                            : 'bg-[#F5F2ED] text-[#7E7468] hover:bg-[#E8E2D9]'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood */}
                <div className="p-4 rounded-2xl bg-white border border-[#F0EDE8] shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#2D2D2D]">Mood Now</span>
                    <span className="text-xs font-bold text-[#5A6E5A]">Level {moodAfter} / 5</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setMoodAfter(lvl)}
                        className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                          moodAfter === lvl
                            ? 'bg-[#5A6E5A] text-white shadow-sm'
                            : 'bg-[#F5F2ED] text-[#7E7468] hover:bg-[#E8E2D9]'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Before vs After Comparison Card */}
              <div className="p-4 rounded-2xl bg-white border border-[#F0EDE8] shadow-sm space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#A69D91]">
                  Your Before & After Comparison
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1.5 p-3 rounded-xl bg-[#FBF9F6] border border-[#F0EDE8]">
                    <div className="font-semibold text-[#2D2D2D]">Energy Shift</div>
                    <div className="text-[#7E7468]">Before: {renderStars(safeStateBefore.energy ?? 2)}</div>
                    <div className="text-[#2D2D2D] font-medium">
                      After: {renderStars(energyAfter)}
                    </div>
                    <div className="text-[11px] text-[#5A6E5A] font-semibold">
                      {energyAfter > (safeStateBefore.energy ?? 2)
                        ? `+${energyAfter - (safeStateBefore.energy ?? 2)} Energy boost`
                        : energyAfter < (safeStateBefore.energy ?? 2)
                        ? 'Settled & calmed down'
                        : 'Maintained steady'}
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-xl bg-[#FBF9F6] border border-[#F0EDE8]">
                    <div className="font-semibold text-[#2D2D2D]">Stress Relief</div>
                    <div className="text-[#7E7468]">Before: {renderStars(safeStateBefore.stress ?? 4)}</div>
                    <div className="text-[#2D2D2D] font-medium">
                      After: {renderStars(stressAfter)}
                    </div>
                    <div className="text-[11px] text-[#5A6E5A] font-semibold">
                      {stressAfter < (safeStateBefore.stress ?? 4)
                        ? `-${(safeStateBefore.stress ?? 4) - stressAfter} Reduced tension`
                        : stressAfter > (safeStateBefore.stress ?? 4)
                        ? 'Slight elevation'
                        : 'Unchanged'}
                    </div>
                  </div>
                </div>
              </div>

              <button
                id="feedback-btn-step1-next"
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-4 px-6 rounded-2xl bg-[#5A6E5A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#4A5D4A] active:scale-[0.99] transition-all shadow-md shadow-[#5A6E5A]/25"
              >
                <span>Continue to Feedback</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-serif font-light text-[#4A5D4A]">
                  Did this help?
                </h3>
                <p className="text-xs sm:text-sm text-[#7E7468] mt-1">
                  Your honest feedback trains your personal companion to understand what works for you.
                </p>
              </div>

              {/* "Did this help?" Options */}
              <div className="space-y-2.5">
                {(
                  [
                    { id: 'yes', label: 'Yes, I feel better', desc: 'Felt noticeable relief and shift' },
                    { id: 'little', label: 'A little', desc: 'Mild shift, could be better' },
                    { id: 'not_really', label: 'Not really', desc: 'Did not match what my body needed' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDidHelp(opt.id)}
                    className={`w-full p-4 rounded-2xl text-left border transition-all ${
                      didHelp === opt.id
                        ? 'bg-[#5A6E5A] text-white border-[#5A6E5A] shadow-sm'
                        : 'bg-white text-[#2D2D2D] border-[#F0EDE8] hover:bg-[#F5F2ED]'
                    }`}
                  >
                    <div className="text-sm font-semibold">{opt.label}</div>
                    <div
                      className={`text-xs mt-0.5 ${
                        didHelp === opt.id ? 'text-[#E8F0E8]' : 'text-[#7E7468]'
                      }`}
                    >
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>

              {/* "Would you do this again?" Options */}
              <div className="pt-2">
                <div className="text-sm font-semibold text-[#2D2D2D] mb-2.5">
                  Would you do this again in similar states?
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'yes', label: 'Yes' },
                      { id: 'maybe', label: 'Maybe' },
                      { id: 'no', label: 'No' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setWouldDoAgain(opt.id)}
                      className={`py-3 px-2 rounded-2xl text-center border text-xs font-semibold transition-all ${
                        wouldDoAgain === opt.id
                          ? 'bg-[#5A6E5A] text-white border-[#5A6E5A]'
                          : 'bg-white text-[#2D2D2D] border-[#F0EDE8] hover:bg-[#F5F2ED]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional brief note */}
              <div>
                <label className="block text-[10px] font-semibold text-[#A69D91] uppercase tracking-wider mb-1.5">
                  Any brief reflection? (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Felt shoulder tension dissolve around minute 4"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-[#F0EDE8] text-[#2D2D2D] placeholder-[#A69D91] text-xs focus:outline-none focus:ring-2 focus:ring-[#5A6E5A]/30"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3.5 px-5 rounded-2xl border border-[#F0EDE8] bg-white text-[#7E7468] text-sm font-medium hover:bg-[#F5F2ED] transition-all"
                >
                  Back
                </button>
                <button
                  id="feedback-btn-finish-save"
                  type="button"
                  onClick={handleFinish}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-[#5A6E5A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#4A5D4A] active:scale-[0.99] transition-all shadow-md shadow-[#5A6E5A]/25"
                >
                  <span>Save Check-In</span>
                  <CheckCircle2 className="w-4 h-4 text-[#E8F0E8]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
