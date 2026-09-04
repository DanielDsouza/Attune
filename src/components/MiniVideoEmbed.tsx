import React, { useState } from 'react';
import { Play, Youtube, ThumbsUp, RotateCcw, Sparkles } from 'lucide-react';
import { VideoGuide } from '../types';

interface MiniVideoEmbedProps {
  videoGuide: VideoGuide;
  titlePrefix?: string;
  className?: string;
  defaultPlaying?: boolean;
}

export const MiniVideoEmbed: React.FC<MiniVideoEmbedProps> = ({
  videoGuide,
  titlePrefix = 'Mini Video Guide',
  className = '',
  defaultPlaying = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(defaultPlaying);

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoGuide.youtubeId}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoGuide.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  return (
    <div
      id={`video-guide-${videoGuide.youtubeId}`}
      className={`rounded-2xl overflow-hidden border border-[#F0EDE8] bg-white shadow-sm transition-all ${className}`}
    >
      {/* Video Header Banner */}
      <div className="px-3.5 py-2.5 bg-[#FBF9F6] border-b border-[#F0EDE8] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-full bg-[#E8F0E8] text-[#5A6E5A] flex items-center justify-center flex-shrink-0">
            <Youtube className="w-3 h-3 text-[#5A6E5A]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A6E5A]">
                {titlePrefix}
              </span>
              {videoGuide.likesOrRating && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-[#7E7468] bg-[#F0EDE8] px-1.5 py-0.2 rounded-full">
                  <ThumbsUp className="w-2.5 h-2.5 text-[#5A6E5A]" />
                  <span>{videoGuide.likesOrRating}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {isPlaying && (
          <button
            type="button"
            onClick={() => setIsPlaying(false)}
            className="text-[10px] text-[#7E7468] hover:text-[#2D2D2D] flex items-center gap-1 hover:underline transition-colors px-1.5 py-0.5"
            title="Reset video"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Video Container (16:9 Aspect Ratio) */}
      <div className="relative w-full aspect-video bg-[#2D2D2D] overflow-hidden">
        {isPlaying ? (
          <iframe
            src={embedUrl}
            title={videoGuide.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <div
            onClick={() => setIsPlaying(true)}
            className="relative w-full h-full cursor-pointer group select-none"
            role="button"
            tabIndex={0}
            aria-label={`Play video: ${videoGuide.title}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setIsPlaying(true);
              }
            }}
          >
            {/* Thumbnail Image */}
            <img
              src={thumbnailUrl}
              alt={videoGuide.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out brightness-95 group-hover:brightness-90"
              loading="lazy"
            />

            {/* Gradient Scrim for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

            {/* Centered Play Button Orb */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/95 text-[#5A6E5A] shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-[#5A6E5A] group-hover:text-white transition-all duration-300">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>

            {/* Duration Tag if available */}
            {videoGuide.duration && (
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-medium text-white shadow-sm">
                {videoGuide.duration}
              </div>
            )}

            {/* Bottom Title & Channel Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <div className="text-xs font-medium line-clamp-1 text-white/95 group-hover:text-white transition-colors">
                {videoGuide.title}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-white/75 mt-0.5">
                <span>By {videoGuide.channelName}</span>
                <span>•</span>
                <span className="text-[#E8F0E8] font-medium">Click to watch embedded</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
