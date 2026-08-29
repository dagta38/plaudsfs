import React from 'react';
import { Track, ThemeMode } from '../types';
import { X, Mic2, Sparkles } from 'lucide-react';

interface LyricsModalProps {
  track: Track;
  themeMode: ThemeMode;
  currentPlaybackTime: number;
  onClose: () => void;
  onSeek: (seconds: number) => void;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  track,
  themeMode,
  currentPlaybackTime,
  onClose,
  onSeek,
}) => {
  const isDark = themeMode === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-lg animate-in fade-in duration-200">
      <div
        id="lyrics-modal-card"
        className={`w-full max-w-lg max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border ${
          isDark
            ? 'bg-neutral-900/95 border-neutral-800 text-neutral-100'
            : 'bg-white/95 border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic2 className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">가사 & 파트 분석</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {track.title} · {track.artist}
              </p>
            </div>
          </div>
          <button
            id="btn-close-lyrics"
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Synced Lyrics Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-center no-scrollbar">
          <div className="text-xs text-neutral-400 font-medium">
            가사를 탭하여 해당 구간으로 이동할 수 있습니다 🎵
          </div>

          <div className="space-y-6">
            {track.lyricsSnippet.map((line, idx) => {
              const isCurrent =
                currentPlaybackTime >= line.time &&
                (idx === track.lyricsSnippet.length - 1 ||
                  currentPlaybackTime < track.lyricsSnippet[idx + 1].time);

              return (
                <div
                  key={idx}
                  onClick={() => onSeek(line.time)}
                  className={`cursor-pointer transition-all duration-300 p-3 rounded-2xl ${
                    isCurrent
                      ? isDark
                        ? 'bg-neutral-800 scale-105 shadow-lg border border-rose-500/30'
                        : 'bg-neutral-100 scale-105 shadow-md border border-rose-400/40'
                      : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1.5">
                    {line.isFeatPart ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        피쳐링 [{line.singer}] 파트
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-neutral-400">
                        [{line.singer}]
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-base sm:text-lg font-bold leading-relaxed tracking-tight ${
                      isCurrent
                        ? line.isFeatPart
                          ? 'text-rose-500'
                          : isDark
                          ? 'text-white'
                          : 'text-neutral-950'
                        : ''
                    }`}
                  >
                    {line.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-neutral-500/10 text-center text-xs text-neutral-400">
          피쳐링 보컬/래퍼 파트는 하이라이트 배지로 실시간 표시됩니다.
        </div>
      </div>
    </div>
  );
};
