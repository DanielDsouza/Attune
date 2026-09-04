import React from 'react';
import { X, ArrowRight, Compass, Palette, Footprints, BookOpen, Users, Coffee, Sparkles } from 'lucide-react';
import { EXPLORE_ITEMS } from '../data/mockExplore';
import { ExploreItem } from '../types';

interface AlternativePathsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExploreItem: (item: ExploreItem) => void;
  onGoToExploreTab: () => void;
}

export const AlternativePathsModal: React.FC<AlternativePathsModalProps> = ({
  isOpen,
  onClose,
  onSelectExploreItem,
  onGoToExploreTab,
}) => {
  if (!isOpen) return null;

  const categories = [
    {
      id: 'Move',
      name: 'Move',
      icon: Footprints,
      desc: 'Walking, yoga, dancing, or gentle stretches',
      color: 'bg-white text-[#2D2D2D] border-[#F0EDE8]',
      sampleItem: EXPLORE_ITEMS.find((i) => i.id === 'diy-mindful-walking'),
    },
    {
      id: 'Create',
      name: 'Create',
      icon: Palette,
      desc: 'Mandala art, guitar chords, cooking, or crafts',
      color: 'bg-white text-[#2D2D2D] border-[#F0EDE8]',
      sampleItem: EXPLORE_ITEMS.find((i) => i.id === 'diy-mandala-art'),
    },
    {
      id: 'Learn',
      name: 'Learn',
      icon: BookOpen,
      desc: 'Photography basics, journaling, or new skills',
      color: 'bg-white text-[#2D2D2D] border-[#F0EDE8]',
      sampleItem: EXPLORE_ITEMS.find((i) => i.id === 'diy-photography-basics'),
    },
    {
      id: 'Connect',
      name: 'Connect',
      icon: Users,
      desc: 'Micro-gratitude text, group stroll, or social class',
      color: 'bg-white text-[#2D2D2D] border-[#F0EDE8]',
      sampleItem: EXPLORE_ITEMS.find((i) => i.id === 'diy-connect-gratitude-text'),
    },
    {
      id: 'Explore',
      name: 'Explore',
      icon: Compass,
      desc: 'Discover hands-on workshops and local experiences',
      color: 'bg-white text-[#2D2D2D] border-[#F0EDE8]',
      sampleItem: EXPLORE_ITEMS.find((i) => i.id === 'local-clay-pottery'),
    },
    {
      id: 'Relax',
      name: 'Relax',
      icon: Coffee,
      desc: 'Herbal tea brewing, sound bath, or quiet rest',
      color: 'bg-white text-[#2D2D2D] border-[#F0EDE8]',
      sampleItem: EXPLORE_ITEMS.find((i) => i.id === 'diy-herbal-tea-ritual'),
    },
  ];

  return (
    <div
      id="alternative-paths-modal-backdrop"
      className="fixed inset-0 z-50 bg-[#2D2D2D]/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      <div
        id="alternative-paths-container"
        className="w-full max-w-lg bg-[#FBF9F6] rounded-t-[36px] sm:rounded-[36px] shadow-2xl border border-[#F0EDE8] overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#F0EDE8]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#5A6E5A]" />
            <span className="text-[10px] font-semibold text-[#5A6E5A] tracking-wider uppercase">
              Broader Wellbeing
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#F0EDE8] text-[#7E7468] hover:text-[#2D2D2D] flex items-center justify-center transition-all shadow-sm"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div>
            <h3 className="text-2xl font-serif font-light text-[#4A5D4A]">
              Maybe meditation isn't what you need right now.
            </h3>
            <p className="text-xs sm:text-sm text-[#7E7468] mt-2 leading-relaxed">
              True wellbeing isn't one-size-fits-all. When sitting in silence doesn't match your state, engaging with movement, tactile creation, or curiosity can be far more restorative.
            </p>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#A69D91] mb-3">
              What sounds good instead?
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between hover:shadow-md cursor-pointer hover:border-[#5A6E5A]/40 ${cat.color}`}
                    onClick={() => {
                      if (cat.sampleItem) {
                        onSelectExploreItem(cat.sampleItem);
                      } else {
                        onGoToExploreTab();
                      }
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-base font-serif font-medium text-[#2D2D2D]">{cat.name}</span>
                        <Icon className="w-5 h-5 text-[#5A6E5A]" />
                      </div>
                      <p className="text-xs text-[#7E7468] leading-snug">
                        {cat.desc}
                      </p>
                    </div>

                    {cat.sampleItem && (
                      <div className="mt-3 pt-2.5 border-t border-[#F0EDE8] flex items-center justify-between text-[11px] font-semibold text-[#5A6E5A]">
                        <span>Try: {cat.sampleItem.title}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#F0EDE8] shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#2D2D2D]">Want to browse all activities?</div>
              <div className="text-[11px] text-[#7E7468]">Explore DIY practices & local community classes</div>
            </div>
            <button
              type="button"
              onClick={onGoToExploreTab}
              className="py-2.5 px-4 rounded-xl bg-[#5A6E5A] text-white text-xs font-medium hover:bg-[#4A5D4A] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
