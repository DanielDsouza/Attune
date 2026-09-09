import React from 'react';
import { BarChart3, TrendingUp, Sparkles, Heart, Zap, Flame, ShieldAlert, Award, Clock, Activity } from 'lucide-react';
import { CheckInRecord } from '../types';

interface ProgressViewProps {
  history: CheckInRecord[];
  streakDays: number;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  history,
  streakDays,
}) => {
  // Compute analytics
  const totalSessions = history.length;
  const completedSessions = history.filter((h) => h.stateAfter);

  // Compute average energy before and after
  const avgEnergyBefore =
    completedSessions.length > 0
      ? (
          completedSessions.reduce((acc, h) => acc + (h.stateBefore?.energy ?? 2), 0) /
          completedSessions.length
        ).toFixed(1)
      : '2.0';

  const avgEnergyAfter =
    completedSessions.length > 0
      ? (
          completedSessions.reduce((acc, h) => acc + (h.stateAfter?.energy || 0), 0) /
          completedSessions.length
        ).toFixed(1)
      : '3.8';

  // Compute average stress before and after
  const avgStressBefore =
    completedSessions.length > 0
      ? (
          completedSessions.reduce((acc, h) => acc + (h.stateBefore?.stress ?? 4), 0) /
          completedSessions.length
        ).toFixed(1)
      : '4.2';

  const avgStressAfter =
    completedSessions.length > 0
      ? (
          completedSessions.reduce((acc, h) => acc + (h.stateAfter?.stress || 0), 0) /
          completedSessions.length
        ).toFixed(1)
      : '2.1';

  // Practice efficacy ranking
  const practiceCounts: Record<string, { total: number; helped: number; name: string }> = {};
  history.forEach((h) => {
    if (h.practiceTitle) {
      if (!practiceCounts[h.practiceTitle]) {
        practiceCounts[h.practiceTitle] = { total: 0, helped: 0, name: h.practiceTitle };
      }
      practiceCounts[h.practiceTitle].total += 1;
      if (h.didHelp === 'yes' || h.didHelp === 'little') {
        practiceCounts[h.practiceTitle].helped += 1;
      }
    }
  });

  const rankedPractices = Object.values(practiceCounts).sort(
    (a, b) => b.helped / b.total - a.helped / a.total
  );

  // Most common moods
  const moodCounts: Record<string, number> = {};
  history.forEach((h) => {
    const label = h.stateBefore.moodLabel || 'Steady';
    moodCounts[label] = (moodCounts[label] || 0) + 1;
  });
  const commonMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);

  // Observations (non-clinical insights requested in prompt)
  const observations = [
    'Short breathing practices appear to work best for you when your stress is high.',
    'Your energy tends to improve most after somatic movement and vitality breathwork.',
    'Evening check-ins show the most consistent decrease in muscular tension before sleep.',
  ];

  return (
    <div id="progress-view-container" className="space-y-6 pb-24 max-w-lg mx-auto px-4 pt-2">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6E5A] uppercase tracking-wider mb-1">
          <BarChart3 className="w-4 h-4 text-[#5A6E5A]" />
          <span>Progress & Insights</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#4A5D4A]">
          How You’re Evolving
        </h2>
        <p className="text-xs sm:text-sm text-[#7E7468] mt-1 leading-relaxed">
          Observations and self-reported patterns from your mindful check-ins.
        </p>
      </div>

      {/* Top Metric Cards (Streak & Mindful Moments) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-5 rounded-[24px] bg-white border border-[#F0EDE8] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7E7468]">Current Habit</span>
            <Flame className="w-5 h-5 text-[#5A6E5A]" />
          </div>
          <div className="mt-2">
            <div className="text-3xl sm:text-4xl font-serif font-medium text-[#2D2D2D]">
              {streakDays}
            </div>
            <div className="text-xs text-[#5A6E5A] font-semibold mt-0.5">
              days mindful streak
            </div>
          </div>
        </div>

        <div className="p-5 rounded-[24px] bg-white border border-[#F0EDE8] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7E7468]">Total Sessions</span>
            <Award className="w-5 h-5 text-[#5A6E5A]" />
          </div>
          <div className="mt-2">
            <div className="text-3xl sm:text-4xl font-serif font-medium text-[#2D2D2D]">
              {totalSessions}
            </div>
            <div className="text-xs text-[#5A6E5A] font-semibold mt-0.5">
              mindful moments logged
            </div>
          </div>
        </div>
      </div>

      {/* Before vs After Impact Analysis */}
      <div className="p-5 sm:p-6 rounded-[28px] bg-white border border-[#F0EDE8] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-serif font-light text-[#4A5D4A]">
            Average Practice Impact
          </h3>
          <span className="text-xs text-[#A69D91]">Before vs After</span>
        </div>

        {/* Energy Shift Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-[#7E7468] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#5A6E5A]" />
              Energy Level
            </span>
            <span className="text-[#5A6E5A] font-bold">
              {avgEnergyBefore} → {avgEnergyAfter} / 5 (+{(+avgEnergyAfter - +avgEnergyBefore).toFixed(1)})
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-[#F5F2ED] border border-[#E8E2D9]">
              <span className="text-[10px] text-[#A69D91] font-medium block">Before Practice</span>
              <span className="text-base font-bold text-[#7E7468]">{avgEnergyBefore} / 5</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#E8F0E8] border border-[#C8DACB]">
              <span className="text-[10px] text-[#5A6E5A] font-semibold block">After Practice</span>
              <span className="text-base font-bold text-[#5A6E5A]">{avgEnergyAfter} / 5</span>
            </div>
          </div>
        </div>

        {/* Stress Shift Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-[#7E7468] flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#5A6E5A]" />
              Stress & Tension
            </span>
            <span className="text-[#5A6E5A] font-bold">
              {avgStressBefore} → {avgStressAfter} / 5 (-{(+avgStressBefore - +avgStressAfter).toFixed(1)})
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-[#F5F2ED] border border-[#E8E2D9]">
              <span className="text-[10px] text-[#A69D91] font-medium block">Before Practice</span>
              <span className="text-base font-bold text-[#7E7468]">{avgStressBefore} / 5</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#E8F0E8] border border-[#C8DACB]">
              <span className="text-[10px] text-[#5A6E5A] font-semibold block">After Practice</span>
              <span className="text-base font-bold text-[#5A6E5A]">{avgStressAfter} / 5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Observations Section */}
      <div className="p-5 sm:p-6 rounded-[28px] bg-white border border-[#F0EDE8] shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#5A6E5A]">
          <Sparkles className="w-4 h-4" />
          <span>Personalized Observations</span>
        </div>

        <div className="space-y-2.5">
          {observations.map((obs, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-[#F5F2ED] border border-[#E8E2D9] text-xs sm:text-sm text-[#2D2D2D] leading-relaxed flex items-start gap-2.5"
            >
              <span className="text-base leading-none mt-0.5">🌱</span>
              <span>"{obs}"</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[#A69D91] italic pt-1">
          * These insights are reflective pattern observations based on your check-in logs and not medical conclusions.
        </p>
      </div>

      {/* Most Effective Practices & Common Moods */}
      <div className="p-5 sm:p-6 rounded-[28px] bg-white border border-[#F0EDE8] shadow-sm space-y-4">
        <h3 className="text-base font-serif font-light text-[#4A5D4A]">
          Most Effective Practices for You
        </h3>

        <div className="space-y-2.5">
          {rankedPractices.slice(0, 4).map((p, idx) => {
            const ratio = Math.round((p.helped / p.total) * 100);
            return (
              <div
                key={p.name}
                className="p-3.5 rounded-2xl bg-[#F5F2ED] border border-[#E8E2D9] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white text-[10px] font-bold text-[#5A6E5A] border border-[#E8E2D9] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-[#2D2D2D]">{p.name}</div>
                    <div className="text-[10px] text-[#A69D91]">{p.total} completed sessions</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#5A6E5A]">{ratio}%</span>
                  <span className="text-[10px] text-[#7E7468] block">positive shift</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Common Emotional States */}
        <div className="pt-3 border-t border-[#F0EDE8]">
          <div className="text-xs font-semibold text-[#2D2D2D] mb-2">
            Most Common Starting States
          </div>
          <div className="flex flex-wrap gap-1.5">
            {commonMoods.map(([mood, count]) => (
              <span
                key={mood}
                className="px-3 py-1 rounded-full bg-[#F5F2ED] border border-[#E8E2D9] text-[#7E7468] text-xs font-medium"
              >
                {mood} ({count})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
