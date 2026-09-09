import React, { useState } from 'react';
import { Play, Sparkles, Compass, Clock, ShieldCheck, ArrowRight, Youtube } from 'lucide-react';
import { RecommendationResult, EmotionalState } from '../types';
import { MiniVideoEmbed } from './MiniVideoEmbed';

interface RecommendationCardProps {
  recommendation: RecommendationResult;
  currentState: EmotionalState;
  onStartPractice: () => void;
  onNotWhatINeed: () => void;
  onCheckInAgain?: () => void;
  isLoading?: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  currentState,
  onStartPractice,
  onNotWhatINeed,
  onCheckInAgain,
  isLoading = false,
}) => {
  const { practice, reason, contextSummary } = recommendation;
  const [showVideoGuide, setShowVideoGuide] = useState<boolean>(false);

  return (
    <div
      id="personalized-recommendation-card"
      className="w-full bg-white rounded-[32px] border border-[#F0EDE8] shadow-sm overflow-hidden transition-all duration-300 relative"
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/75 backdrop-blur-xs z-20 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          <div className="w-9 h-9 rounded-full border-2 border-[#5A6E5A] border-t-transparent animate-spin mb-3" />
          <div className="text-xs font-semibold text-[#2D2D2D]">
            Analyzing with Attune AI...
          </div>
          <div className="text-[11px] text-[#7E7468] mt-1 max-w-xs">
            Synthesizing a unique practice personalized to your state and learning from past ratings
          </div>
        </div>
      )}

      {/* Top Visual Practice Banner with Play Orb */}
      <div
        className="relative w-full aspect-[16/9] bg-[#D9CAB3] flex items-center justify-center cursor-pointer group"
        onClick={onStartPractice}
      >
        {/* Organic Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#4A5D4A]/80 via-[#5A6E5A]/50 to-[#D9CAB3]/40" />

        {/* Center Circular Play Button */}
        <div className="relative z-10 w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#5A6E5A] shadow-xl group-hover:scale-105 transition-transform border-2 border-white/80">
          <Play className="w-6 h-6 fill-current ml-0.5" />
        </div>

        {/* Bottom Tag Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#2D2D2D]/80 via-[#2D2D2D]/40 to-transparent text-white z-10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#E8F0E8] bg-white/20 px-2 py-0.5 rounded-full">
              {practice.category}
            </span>
            <span className="text-[11px] font-medium text-white/90">
              {practice.durationMinutes} MIN
            </span>
          </div>
          <h4 className="text-lg font-serif font-medium text-white mt-1">
            {practice.title}
          </h4>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {/* State Badge Summary & AI Tag */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F2ED] text-xs text-[#7E7468] font-medium border border-[#F0EDE8]">
            <span className="w-2 h-2 rounded-full bg-[#5A6E5A]" />
            <span>{contextSummary}</span>
          </div>

          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#4A5D4A] bg-[#E8F0E8] px-2.5 py-1 rounded-full border border-[#D3E4D6]">
            <Sparkles className="w-3 h-3 text-[#5A6E5A]" />
            <span>Attune AI Recommended</span>
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-[#7E7468] leading-relaxed">
          {practice.subtitle}
        </p>

        {/* Feedback Learning Adaptation Callout (Visible proof of learning loop) */}
        {(recommendation.feedbackLearningNote || recommendation.adaptedFromFeedback) && (
          <div className="p-3.5 rounded-2xl bg-[#F2F7F2] border border-[#C5DDC8] space-y-1 animate-in fade-in duration-300">
            <div className="flex items-center gap-1.5 text-[#30553A] font-semibold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#3A6043]" />
              <span>Learned from your recent feedback</span>
            </div>
            <p className="text-xs text-[#3E5242] leading-relaxed font-normal">
              {recommendation.feedbackLearningNote ||
                'Adapted recommendation: shifted away from practices you previously found unhelpful.'}
            </p>
          </div>
        )}

        {/* Goal Alignment Banner */}
        {recommendation.goalAlignmentNote && (
          <div className="p-3 rounded-2xl bg-[#E8F0E8] border border-[#C8DACB] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#5A6E5A] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#4A5D4A] font-medium leading-relaxed">
              {recommendation.goalAlignmentNote}
            </p>
          </div>
        )}

        {/* Why this practice was selected */}
        <div className="p-3.5 rounded-2xl bg-[#FBF9F6] border border-[#F0EDE8] relative space-y-1">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#A69D91]">
            Why this was selected for you
          </div>
          <p className="text-xs text-[#2D2D2D] font-medium leading-relaxed italic">
            "{reason}"
          </p>
        </div>

        {/* Suggested Next Steps based on Mood & Goals */}
        {recommendation.suggestedNextSteps && recommendation.suggestedNextSteps.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-white border border-[#E8E2D9] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#5A6E5A]">
                Suggested Next Steps for You
              </span>
              <span className="text-[10px] text-[#A69D91]">Based on your mood & goals</span>
            </div>
            <ul className="space-y-1.5">
              {recommendation.suggestedNextSteps.map((step, idx) => (
                <li key={idx} className="text-xs text-[#2D2D2D] flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#F5F2ED] text-[#5A6E5A] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {practice.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#E8F0E8] text-[#5A6E5A]"
            >
              {tag}
            </span>
          ))}
          <span className="text-[11px] text-[#A69D91] ml-auto flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3 text-[#5A6E5A]" />
            {practice.guidanceSteps.length} gentle steps
          </span>
        </div>

        {/* Mini YouTube Video Embedded Guide */}
        {practice.videoGuide && (
          <div className="pt-2">
            {practice.videoGuide.recommendationReason && !showVideoGuide && (
              <div className="mb-2 p-2.5 rounded-xl bg-[#F0EDE8]/60 border border-[#E8E2D9] text-[11px] text-[#4A5D4A] flex items-start gap-2">
                <Youtube className="w-3.5 h-3.5 text-[#5A6E5A] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#2D2D2D]">Attune Video Recommendation: </span>
                  <span>{practice.videoGuide.recommendationReason}</span>
                </div>
              </div>
            )}
            {showVideoGuide ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5 text-[#5A6E5A]" />
                    <span className="text-[11px] font-semibold text-[#5A6E5A]">
                      Recommended Technique Guide: {practice.videoGuide.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVideoGuide(false)}
                    className="text-[11px] text-[#7E7468] hover:text-[#2D2D2D] underline"
                  >
                    Hide video
                  </button>
                </div>
                <MiniVideoEmbed
                  videoGuide={practice.videoGuide}
                  titlePrefix="Attune Video Guide"
                  defaultPlaying={true}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowVideoGuide(true)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#F5F2ED] hover:bg-[#E8E2D9] border border-[#F0EDE8] text-[#5A6E5A] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Youtube className="w-4 h-4 text-[#5A6E5A]" />
                <span>Watch Recommended Video Guide ({practice.videoGuide.duration || '5 min'})</span>
              </button>
            )}
          </div>
        )}

        {/* Primary & Secondary Actions */}
        <div className="space-y-2 pt-2">
          <button
            id="recommendation-btn-start"
            type="button"
            onClick={onStartPractice}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#5A6E5A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#4A5D4A] active:scale-[0.99] transition-all shadow-md shadow-[#5A6E5A]/20 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current text-white" />
            <span>Start Practice</span>
          </button>

          <button
            id="recommendation-btn-not-what-i-need"
            type="button"
            onClick={onNotWhatINeed}
            className="w-full py-2.5 px-4 rounded-2xl text-xs font-medium text-[#7E7468] hover:text-[#2D2D2D] hover:bg-[#F5F2ED] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Not what I need right now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
