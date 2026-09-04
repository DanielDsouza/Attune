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
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  currentState,
  onStartPractice,
  onNotWhatINeed,
  onCheckInAgain,
}) => {
  const { practice, reason, contextSummary } = recommendation;
  const [showVideoGuide, setShowVideoGuide] = useState<boolean>(false);

  return (
    <div
      id="personalized-recommendation-card"
      className="w-full bg-white rounded-[32px] border border-[#F0EDE8] shadow-sm overflow-hidden transition-all duration-300"
    >
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
        {/* State Badge Summary */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F2ED] text-xs text-[#7E7468] font-medium border border-[#F0EDE8]">
          <span className="w-2 h-2 rounded-full bg-[#5A6E5A]" />
          <span>{contextSummary}</span>
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-[#7E7468] leading-relaxed">
          {practice.subtitle}
        </p>

        {/* Why this practice was selected */}
        <div className="p-3.5 rounded-2xl bg-[#FBF9F6] border border-[#F0EDE8] relative space-y-1">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#A69D91]">
            Why this was selected for you
          </div>
          <p className="text-xs text-[#7E7468] leading-relaxed italic">
            "{reason}"
          </p>
        </div>

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
            {showVideoGuide ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#5A6E5A]">Video Guide</span>
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
                  titlePrefix="Companion Practice Guide"
                  defaultPlaying={true}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowVideoGuide(true)}
                className="w-full py-2 px-3.5 rounded-xl bg-[#F5F2ED] hover:bg-[#E8E2D9] border border-[#F0EDE8] text-[#5A6E5A] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Youtube className="w-4 h-4 text-[#5A6E5A]" />
                <span>Watch Technique Video Guide</span>
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
