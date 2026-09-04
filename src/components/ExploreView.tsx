import React, { useState } from 'react';
import {
  Compass,
  Palette,
  Footprints,
  BookOpen,
  Users,
  Coffee,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Play,
  Check,
  Youtube,
  Calendar,
  DollarSign,
  Heart,
} from 'lucide-react';
import { ExploreItem } from '../types';
import { EXPLORE_ITEMS } from '../data/mockExplore';
import { MiniVideoEmbed } from './MiniVideoEmbed';

interface ExploreViewProps {
  onStartDiyPractice: (item: ExploreItem) => void;
  selectedInitialItem?: ExploreItem | null;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  onStartDiyPractice,
  selectedInitialItem,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'diy' | 'local'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeDiyModal, setActiveDiyModal] = useState<ExploreItem | null>(
    selectedInitialItem?.type === 'diy' ? selectedInitialItem : null
  );
  const [activeLocalModal, setActiveLocalModal] = useState<ExploreItem | null>(
    selectedInitialItem?.type === 'local' ? selectedInitialItem : null
  );

  // DIY Active step progress state
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showCompletionMessage, setShowCompletionMessage] = useState<boolean>(false);
  const [rsvpSuccess, setRsvpSuccess] = useState<boolean>(false);

  const categories = ['All', 'Move', 'Create', 'Learn', 'Connect', 'Explore', 'Relax'];

  const filteredItems = EXPLORE_ITEMS.filter((item) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'diy' && item.type === 'diy') ||
      (activeTab === 'local' && item.type === 'local');

    const matchesCategory =
      activeCategory === 'All' || item.category.toLowerCase() === activeCategory.toLowerCase();

    return matchesTab && matchesCategory;
  });

  const diyItems = filteredItems.filter((i) => i.type === 'diy');
  const localItems = filteredItems.filter((i) => i.type === 'local');

  const handleOpenDiy = (item: ExploreItem) => {
    setActiveDiyModal(item);
    setCompletedSteps([]);
    setShowCompletionMessage(false);
  };

  const handleOpenLocal = (item: ExploreItem) => {
    setActiveLocalModal(item);
    setRsvpSuccess(false);
  };

  const handleToggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div id="explore-view-container" className="space-y-6 pb-24 max-w-lg mx-auto px-4 pt-2">
      {/* Header Banner */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6E5A] uppercase tracking-wider mb-1">
          <Compass className="w-4 h-4 text-[#5A6E5A]" />
          <span>Explore Wellbeing</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#4A5D4A]">
          Beyond Meditation
        </h2>
        <p className="text-xs sm:text-sm text-[#7E7468] mt-1 leading-relaxed">
          Discover hands-on creative rituals, somatic movement, and local gatherings with interactive mini video guides.
        </p>
      </div>

      {/* Main Tab Switcher (All / Do It Yourself / Around You) */}
      <div className="flex items-center p-1 rounded-2xl bg-[#E8E2D9]">
        {(
          [
            { id: 'all', label: 'All Activities' },
            { id: 'diy', label: 'Do It Yourself' },
            { id: 'local', label: 'Around You' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-[#2D2D2D] shadow-sm font-semibold'
                : 'text-[#7E7468] hover:text-[#2D2D2D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
              activeCategory === cat
                ? 'bg-[#5A6E5A] text-white border-[#5A6E5A] shadow-sm'
                : 'bg-white text-[#7E7468] border-[#F0EDE8] hover:bg-[#F5F2ED]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* SECTION: Do It Yourself */}
      {(activeTab === 'all' || activeTab === 'diy') && diyItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-light text-[#4A5D4A]">
              Do It Yourself
            </h3>
            <span className="text-xs text-[#A69D91]">
              {diyItems.length} self-paced guides
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {diyItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenDiy(item)}
                className="p-5 rounded-[24px] bg-white border border-[#F0EDE8] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F5F2ED] text-[#7E7468]">
                      {item.category}
                    </span>
                    <span className="text-xs font-medium text-[#A69D91] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.durationOrSchedule}
                    </span>
                  </div>

                  <h4 className="text-base font-serif font-medium text-[#2D2D2D] group-hover:text-[#5A6E5A] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#7E7468] mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Video Indicator pill & Footer */}
                <div className="mt-4 pt-3 border-t border-[#F0EDE8] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.videoGuide && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#5A6E5A] bg-[#E8F0E8] px-2 py-0.5 rounded-full font-medium">
                        <Youtube className="w-3 h-3 text-[#5A6E5A]" />
                        <span>Mini Video Guide</span>
                      </span>
                    )}
                    {item.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] text-[#A69D91] bg-[#F5F2ED] px-2 py-0.5 rounded-md font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-[#5A6E5A] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Open guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: Around You (Local Experiences Prototype Concept) */}
      {(activeTab === 'all' || activeTab === 'local') && localItems.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif font-light text-[#4A5D4A]">
                Around You
              </h3>
              <p className="text-[11px] text-[#A69D91]">
                Local community & wellness marketplace concept
              </p>
            </div>
            <span className="text-xs text-[#A69D91]">
              {localItems.length} nearby
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {localItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenLocal(item)}
                className="p-5 rounded-[24px] bg-white border border-[#F0EDE8] shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8F0E8] text-[#5A6E5A]">
                      {item.category} · {item.durationOrSchedule}
                    </span>
                    <span className="text-xs font-bold text-[#5A6E5A]">
                      {item.cost}
                    </span>
                  </div>

                  <h4 className="text-base font-serif font-medium text-[#2D2D2D] group-hover:text-[#5A6E5A] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#7E7468] mt-1 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-[#7E7468] mt-2.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#5A6E5A]" />
                    <span>{item.location} ({item.distance})</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F0EDE8] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.videoGuide && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#5A6E5A] bg-[#E8F0E8] px-2 py-0.5 rounded-full font-medium">
                        <Youtube className="w-3 h-3 text-[#5A6E5A]" />
                        <span>Mini Video Guide</span>
                      </span>
                    )}
                    {item.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] text-[#A69D91] bg-[#F5F2ED] px-2 py-0.5 rounded-md font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenLocal(item);
                    }}
                    className="py-1.5 px-3 rounded-xl bg-[#F5F2ED] hover:bg-[#E8E2D9] text-[#7E7468] group-hover:text-[#2D2D2D] text-xs font-medium transition-all"
                  >
                    View details
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-[#A69D91] italic text-center pt-2">
            * Events and workshops include embedded video guides so you can preview and learn the technique right away.
          </p>
        </div>
      )}

      {/* Interactive DIY Step Guide Modal */}
      {activeDiyModal && (
        <div
          id="diy-guide-modal-backdrop"
          className="fixed inset-0 z-50 bg-[#2D2D2D]/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
        >
          <div
            id="diy-guide-card"
            className="w-full max-w-lg bg-[#FBF9F6] rounded-t-[36px] sm:rounded-[36px] shadow-2xl border border-[#F0EDE8] overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300"
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-3 border-b border-[#F0EDE8] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5A6E5A]">
                  DIY Guided Practice
                </span>
                <h3 className="text-lg font-serif font-light text-[#4A5D4A]">
                  {activeDiyModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveDiyModal(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#F0EDE8] text-[#7E7468] hover:text-[#2D2D2D] flex items-center justify-center transition-all shadow-sm"
              >
                ✕
              </button>
            </div>

            {/* Steps & Video Guide */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <p className="text-xs text-[#7E7468] leading-relaxed">
                {activeDiyModal.description}
              </p>

              {/* Mini YouTube Video Embedded within the Guide */}
              {activeDiyModal.videoGuide && (
                <div className="pt-1">
                  <MiniVideoEmbed
                    videoGuide={activeDiyModal.videoGuide}
                    titlePrefix="Interactive Video Guide"
                  />
                  <p className="text-[11px] text-[#A69D91] mt-1.5 text-center">
                    Tap to watch directly within your guide without leaving the app.
                  </p>
                </div>
              )}

              {/* Step-by-Step Instructions */}
              <div className="space-y-3 pt-2">
                <div className="text-[11px] uppercase tracking-wider font-bold text-[#A69D91]">
                  Step-by-Step Instructions
                </div>

                {activeDiyModal.diySteps?.map((step, idx) => {
                  const isDone = completedSteps.includes(idx);
                  return (
                    <div
                      key={step.title}
                      onClick={() => handleToggleStep(idx)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isDone
                          ? 'bg-[#E8F0E8] border-[#C8DACB]'
                          : 'bg-white border-[#F0EDE8] hover:bg-[#F5F2ED]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                              isDone
                                ? 'bg-[#5A6E5A] text-white'
                                : 'bg-[#E8E2D9] text-[#7E7468]'
                            }`}
                          >
                            {isDone ? '✓' : idx + 1}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#2D2D2D]">
                              {step.title}
                            </div>
                            <div className="text-xs text-[#7E7468] mt-1 leading-relaxed">
                              {step.detail}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-[#A69D91] whitespace-nowrap ml-2">
                          {step.durationMinutes}m
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Completion Action */}
              <div className="pt-2">
                {showCompletionMessage ? (
                  <div className="p-4 rounded-2xl bg-[#E8F0E8] border border-[#C8DACB] text-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-[#5A6E5A] text-white mx-auto flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-serif font-medium text-[#4A5D4A]">
                      Practice Completed!
                    </div>
                    <p className="text-xs text-[#7E7468]">
                      Logged in your mindful journey. Take a breath and enjoy this renewed focus.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveDiyModal(null)}
                      className="mt-2 py-2 px-5 rounded-xl bg-[#5A6E5A] text-white text-xs font-semibold hover:bg-[#4A5D4A] transition-all"
                    >
                      Return to Explore
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCompletionMessage(true)}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#5A6E5A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#4A5D4A] active:scale-[0.99] transition-all shadow-md shadow-[#5A6E5A]/25 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#E8F0E8]" />
                    <span>Mark Activity Completed</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Around You / Local Activity Modal */}
      {activeLocalModal && (
        <div
          id="local-guide-modal-backdrop"
          className="fixed inset-0 z-50 bg-[#2D2D2D]/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
        >
          <div
            id="local-guide-card"
            className="w-full max-w-lg bg-[#FBF9F6] rounded-t-[36px] sm:rounded-[36px] shadow-2xl border border-[#F0EDE8] overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300"
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-3 border-b border-[#F0EDE8] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5A6E5A]">
                  Local Experience Guide
                </span>
                <h3 className="text-lg font-serif font-light text-[#4A5D4A]">
                  {activeLocalModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveLocalModal(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#F0EDE8] text-[#7E7468] hover:text-[#2D2D2D] flex items-center justify-center transition-all shadow-sm"
              >
                ✕
              </button>
            </div>

            {/* Content & Video */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F2ED] border border-[#F0EDE8] text-xs text-[#7E7468]">
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-[#5A6E5A]" />
                  <span>{activeLocalModal.durationOrSchedule}</span>
                </div>
                <div className="font-bold text-[#5A6E5A]">
                  {activeLocalModal.cost}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#7E7468] font-medium">
                <MapPin className="w-4 h-4 text-[#5A6E5A] flex-shrink-0" />
                <span>{activeLocalModal.location} ({activeLocalModal.distance})</span>
              </div>

              <p className="text-xs text-[#7E7468] leading-relaxed">
                {activeLocalModal.description}
              </p>

              {/* Embedded Mini YouTube Video within the local guide */}
              {activeLocalModal.videoGuide && (
                <div className="pt-1">
                  <MiniVideoEmbed
                    videoGuide={activeLocalModal.videoGuide}
                    titlePrefix="Workshop & Technique Video"
                  />
                  <p className="text-[11px] text-[#A69D91] mt-1.5 text-center">
                    Preview the activity or learn foundational steps through this verified guide.
                  </p>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeLocalModal.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#E8F0E8] text-[#5A6E5A]"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 space-y-2">
                {rsvpSuccess ? (
                  <div className="p-3.5 rounded-2xl bg-[#E8F0E8] text-[#4A5D4A] text-xs text-center font-medium border border-[#C8DACB]">
                    ✓ RSVP Saved to your saved experiences calendar!
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRsvpSuccess(true)}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#5A6E5A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#4A5D4A] active:scale-[0.99] transition-all shadow-md shadow-[#5A6E5A]/25 cursor-pointer"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Save & RSVP Interest</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveLocalModal(null)}
                  className="w-full py-2.5 px-4 rounded-2xl text-xs font-medium text-[#7E7468] hover:text-[#2D2D2D] transition-colors"
                >
                  Close details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
