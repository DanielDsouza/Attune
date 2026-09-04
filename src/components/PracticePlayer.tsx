import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, Volume2, VolumeX, SkipForward, ArrowLeft, CheckCircle, Youtube } from 'lucide-react';
import { Practice, GuidanceStep } from '../types';
import { soundEngine } from '../services/soundEngine';
import { MiniVideoEmbed } from './MiniVideoEmbed';

interface PracticePlayerProps {
  practice: Practice;
  onComplete: () => void;
  onCancel: () => void;
}

export const PracticePlayer: React.FC<PracticePlayerProps> = ({
  practice,
  onComplete,
  onCancel,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [stepSecondsRemaining, setStepSecondsRemaining] = useState<number>(
    practice.guidanceSteps[0]?.seconds || 40
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showVideoGuide, setShowVideoGuide] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep: GuidanceStep =
    practice.guidanceSteps[currentStepIndex] || practice.guidanceSteps[0];
  const totalSteps = practice.guidanceSteps.length;

  // Calculate total seconds and elapsed seconds for overall progress
  const totalDurationSeconds = practice.guidanceSteps.reduce(
    (acc, s) => acc + s.seconds,
    0
  );

  const elapsedBeforeCurrentStep = practice.guidanceSteps
    .slice(0, currentStepIndex)
    .reduce((acc, s) => acc + s.seconds, 0);

  const currentStepElapsed = currentStep.seconds - stepSecondsRemaining;
  const totalElapsed = elapsedBeforeCurrentStep + currentStepElapsed;
  const overallProgressPercent = Math.min(
    100,
    Math.round((totalElapsed / totalDurationSeconds) * 100)
  );

  // Play initial chime on start
  useEffect(() => {
    soundEngine.setMuted(isMuted);
    soundEngine.playSingingBowl(261.63);
  }, []);

  // Timer loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setStepSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Advance to next step or complete
          if (currentStepIndex + 1 < totalSteps) {
            const nextIdx = currentStepIndex + 1;
            setCurrentStepIndex(nextIdx);
            const nextStep = practice.guidanceSteps[nextIdx];

            // Play gentle phase transition cue
            if (nextStep.phase === 'inhale') soundEngine.playBreathCue('inhale');
            else if (nextStep.phase === 'exhale') soundEngine.playBreathCue('exhale');
            else if (nextStep.phase === 'hold') soundEngine.playBreathCue('hold');
            else soundEngine.playSingingBowl(329.63);

            return nextStep.seconds;
          } else {
            // Completed all steps
            if (timerRef.current) clearInterval(timerRef.current);
            soundEngine.playCompletionFanfare();
            onComplete();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, totalSteps, practice, onComplete]);

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  const handleNextStep = () => {
    if (currentStepIndex + 1 < totalSteps) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      setStepSecondsRemaining(practice.guidanceSteps[nextIdx].seconds);
      soundEngine.playSingingBowl(329.63);
    } else {
      soundEngine.playCompletionFanfare();
      onComplete();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      setStepSecondsRemaining(practice.guidanceSteps[prevIdx].seconds);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Dynamic visual styling for breathing orb based on phase
  const getOrbState = () => {
    switch (currentStep.phase) {
      case 'inhale':
        return {
          label: 'Inhale Deeply',
          scaleClass: 'scale-125 transition-transform duration-[4000ms] ease-out',
          color: 'bg-[#E8F0E8] text-[#4A5D4A] border-[#C8DACB]',
          ringColor: 'border-[#5A6E5A]/20',
        };
      case 'hold':
        return {
          label: 'Hold & Notice',
          scaleClass: 'scale-115 transition-transform duration-[2000ms]',
          color: 'bg-[#F5F2ED] text-[#7E7468] border-[#D9CAB3]',
          ringColor: 'border-[#D9CAB3]/40',
        };
      case 'exhale':
        return {
          label: 'Exhale Slowly',
          scaleClass: 'scale-85 transition-transform duration-[6000ms] ease-in-out',
          color: 'bg-[#E8F0E8] text-[#5A6E5A] border-[#D0E2D1]',
          ringColor: 'border-[#5A6E5A]/20',
        };
      case 'focus':
        return {
          label: 'Focus Awareness',
          scaleClass: 'scale-100 animate-gentle-pulse',
          color: 'bg-[#FBF9F6] text-[#4A5D4A] border-[#E8E2D9]',
          ringColor: 'border-[#4A5D4A]/20',
        };
      case 'reflect':
        return {
          label: 'Reflect & Absorb',
          scaleClass: 'scale-100 animate-gentle-pulse',
          color: 'bg-[#F5F2ED] text-[#7E7468] border-[#D9CAB3]',
          ringColor: 'border-[#7E7468]/20',
        };
      default:
        return {
          label: 'Arrive & Settle',
          scaleClass: 'scale-95 animate-gentle-pulse',
          color: 'bg-[#E8F0E8] text-[#4A5D4A] border-[#C8DACB]',
          ringColor: 'border-[#5A6E5A]/20',
        };
    }
  };

  const orb = getOrbState();

  return (
    <div
      id="guided-practice-experience-screen"
      className="fixed inset-0 z-50 bg-[#F5F2ED] text-[#2D2D2D] flex flex-col justify-between p-6 sm:p-8 select-none overflow-hidden"
    >
      {/* Top Controls Bar */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between gap-2">
        <button
          id="practice-btn-cancel"
          type="button"
          onClick={() => setShowExitConfirm(true)}
          className="p-2.5 rounded-full bg-white text-[#7E7468] hover:text-[#2D2D2D] hover:bg-[#E8E2D9] border border-[#F0EDE8] transition-all shadow-sm flex-shrink-0"
          title="End Practice"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center min-w-0">
          <h2 className="text-sm font-serif font-medium tracking-wide text-[#4A5D4A] truncate">
            {practice.title}
          </h2>
          <div className="text-[11px] text-[#A69D91] font-semibold uppercase tracking-wider">
            Step {currentStepIndex + 1} of {totalSteps}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {practice.videoGuide && (
            <button
              id="practice-btn-video-guide"
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setShowVideoGuide(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white text-[#5A6E5A] hover:bg-[#E8F0E8] border border-[#F0EDE8] transition-all shadow-sm text-xs font-medium cursor-pointer"
              title="Watch technique video guide"
            >
              <Youtube className="w-3.5 h-3.5 text-[#5A6E5A]" />
              <span className="hidden sm:inline">Video</span>
            </button>
          )}

          <button
            id="practice-btn-audio-toggle"
            type="button"
            onClick={toggleSound}
            className="p-2.5 rounded-full bg-white text-[#7E7468] hover:text-[#2D2D2D] hover:bg-[#E8E2D9] border border-[#F0EDE8] transition-all shadow-sm"
            title={isMuted ? 'Unmute Chimes' : 'Mute Chimes'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Visualizer Stage */}
      <div className="max-w-md mx-auto w-full my-auto flex flex-col items-center justify-center text-center py-4">
        {/* Animated Breathing Orb */}
        <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72 my-6">
          {/* Subtle Outer Ripples */}
          <div
            className={`absolute inset-0 rounded-full border-2 ${orb.ringColor} transition-all duration-1000 transform ${
              isPlaying ? 'scale-110 opacity-60' : 'scale-100 opacity-20'
            }`}
          />
          <div
            className={`absolute inset-4 rounded-full border ${orb.ringColor} transition-all duration-1000 transform ${
              isPlaying ? 'scale-105 opacity-40' : 'scale-100 opacity-20'
            }`}
          />

          {/* Central Breathing Bubble */}
          <div
            className={`w-44 h-44 sm:w-48 sm:h-48 rounded-full border-2 shadow-xl flex flex-col items-center justify-center p-4 transition-all duration-700 ${orb.color} ${orb.scaleClass}`}
          >
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1">
              {orb.label}
            </span>
            <span className="text-3xl sm:text-4xl font-serif font-medium tracking-tight">
              {formatTime(stepSecondsRemaining)}
            </span>
            <span className="text-[10px] opacity-70 mt-1 font-semibold uppercase tracking-wider">
              {currentStep.phase ? `${currentStep.phase}` : 'BREATHE'}
            </span>
          </div>
        </div>

        {/* Current Instruction Text */}
        <div className="max-w-xs sm:max-w-sm px-4 min-h-[90px] flex flex-col items-center justify-center">
          <h3 className="text-lg sm:text-xl font-serif font-light text-[#4A5D4A] mb-1.5">
            {currentStep.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#7E7468] leading-relaxed">
            {currentStep.instruction}
          </p>
        </div>
      </div>

      {/* Bottom Controls & Progress */}
      <div className="max-w-md mx-auto w-full space-y-5">
        {/* Progress Bar & Timing Summary */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#A69D91] font-semibold">
            <span>Progress</span>
            <span>
              {formatTime(totalElapsed)} / {formatTime(totalDurationSeconds)} ({overallProgressPercent}%)
            </span>
          </div>
          <div className="w-full bg-[#E8E2D9] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#5A6E5A] h-full transition-all duration-500 ease-out"
              style={{ width: `${overallProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className={`p-3 rounded-full border border-[#F0EDE8] bg-white transition-all shadow-sm ${
              currentStepIndex === 0
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-[#F5F2ED] text-[#7E7468]'
            }`}
            title="Previous Step"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Big Play/Pause Toggle */}
          <button
            id="practice-btn-playpause"
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full bg-[#5A6E5A] text-white flex items-center justify-center shadow-xl shadow-[#5A6E5A]/30 hover:bg-[#4A5D4A] active:scale-95 transition-all border-4 border-white"
            title={isPlaying ? 'Pause' : 'Resume'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          {/* Next / Complete Step */}
          <button
            id="practice-btn-next-step"
            type="button"
            onClick={handleNextStep}
            className="p-3 rounded-full border border-[#F0EDE8] bg-white hover:bg-[#F5F2ED] text-[#7E7468] transition-all shadow-sm"
            title={currentStepIndex + 1 === totalSteps ? 'Finish Practice' : 'Next Step'}
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Finish Button */}
        <div className="text-center pt-1">
          <button
            id="practice-btn-quick-complete"
            type="button"
            onClick={() => {
              soundEngine.playCompletionFanfare();
              onComplete();
            }}
            className="text-[11px] font-medium text-[#7E7468] hover:text-[#4A5D4A] underline decoration-dotted transition-all"
          >
            Complete practice & reflect now →
          </button>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div
          id="practice-exit-confirm-modal"
          className="fixed inset-0 z-60 bg-[#2D2D2D]/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-xs bg-[#FBF9F6] rounded-3xl p-6 shadow-2xl border border-[#F0EDE8] text-center space-y-4">
            <h4 className="text-lg font-serif font-light text-[#4A5D4A]">
              End this practice?
            </h4>
            <p className="text-xs text-[#7E7468] leading-relaxed">
              You can pause or step out anytime. Would you like to save your progress or exit now?
            </p>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  onComplete();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#5A6E5A] text-white text-xs font-semibold hover:bg-[#4A5D4A] transition-all"
              >
                Log as completed & check in
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2.5 px-4 rounded-xl border border-[#F0EDE8] bg-white text-[#7E7468] text-xs font-semibold hover:bg-[#F5F2ED] transition-all"
              >
                Exit without saving
              </button>
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-1.5 text-xs text-[#A69D91] hover:text-[#2D2D2D]"
              >
                Resume practice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Guide Modal */}
      {showVideoGuide && practice.videoGuide && (
        <div
          id="practice-video-guide-modal"
          className="fixed inset-0 z-60 bg-[#2D2D2D]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="w-full max-w-md bg-[#FBF9F6] rounded-[32px] p-5 shadow-2xl border border-[#F0EDE8] space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#F0EDE8] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5A6E5A] tracking-wider">
                  Technique Companion
                </span>
                <h4 className="text-base font-serif font-medium text-[#4A5D4A]">
                  {practice.title} Video Guide
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoGuide(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#F0EDE8] text-[#7E7468] hover:text-[#2D2D2D] flex items-center justify-center transition-all shadow-sm"
              >
                ✕
              </button>
            </div>

            <MiniVideoEmbed
              videoGuide={practice.videoGuide}
              titlePrefix="Guided Practice Demonstration"
              defaultPlaying={true}
            />

            <p className="text-xs text-[#7E7468] leading-relaxed">
              {practice.description}
            </p>

            <button
              type="button"
              onClick={() => {
                setShowVideoGuide(false);
                setIsPlaying(true);
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#5A6E5A] text-white text-xs font-semibold hover:bg-[#4A5D4A] transition-all cursor-pointer"
            >
              Resume Practice
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
