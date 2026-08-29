import React, { useState } from 'react';
import { Track, ThemeMode } from '../types';
import { Search, X, Hash, Sparkles, Disc3, Flame, Play } from 'lucide-react';

interface SearchAndExploreModalProps {
  allTracks: Track[];
  themeMode: ThemeMode;
  onClose: () => void;
  onSelectTrack: (trackId: string) => void;
  onSelectArtist: (artistName: string) => void;
}

export const SearchAndExploreModal: React.FC<SearchAndExploreModalProps> = ({
  allTracks,
  themeMode,
  onClose,
  onSelectTrack,
  onSelectArtist,
}) => {
  const [query, setQuery] = useState('');
  const isDark = themeMode === 'dark';

  const trendingTags = [
    '#스피드업추천',
    '#챌린지음원',
    '#808베이스',
    '#새벽감성',
    '#피쳐링보컬',
    '#하이퍼팝',
    '#청춘밴드',
    '#중독성훅',
  ];

  const filteredTracks = query.trim()
    ? allTracks.filter((t) => {
        const q = query.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q) ||
          t.genres.some((g) => g.toLowerCase().includes(q)) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.featuringArtists.some((feat) => feat.name.toLowerCase().includes(q))
        );
      })
    : allTracks;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-lg pt-16 sm:pt-4 animate-in fade-in duration-200">
      <div
        id="search-explore-card"
        className={`w-full max-w-xl max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border ${
          isDark
            ? 'bg-neutral-900/95 border-neutral-800 text-neutral-100'
            : 'bg-white/95 border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-neutral-500/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <input
            type="text"
            id="search-input-field"
            placeholder="곡명, 아티스트, 피쳐링 가수(#비비안, #준), 장르 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className={`flex-1 bg-transparent text-sm sm:text-base outline-none font-medium ${
              isDark ? 'text-white placeholder-neutral-500' : 'text-neutral-900 placeholder-neutral-400'
            }`}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-400 hover:text-neutral-200 p-1 text-xs"
            >
              지우기
            </button>
          )}
          <button
            id="btn-close-search"
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Results */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 no-scrollbar">
          {/* Trending Hashtags */}
          {!query && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                <Hash className="w-3.5 h-3.5 text-rose-500" />
                10대 실시간 인기 해시태그
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isDark
                        ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Track Results */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
              <span>{query ? `검색 결과 (${filteredTracks.length}개)` : '인기 추천 음원 목록'}</span>
            </div>

            {filteredTracks.length === 0 ? (
              <div className="text-center py-10 text-neutral-400 text-sm">
                검색된 음원 또는 아티스트가 없습니다 🔍
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTracks.map((track) => (
                  <div
                    key={track.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      isDark
                        ? 'bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-800'
                        : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <div
                      onClick={() => {
                        onSelectTrack(track.id);
                        onClose();
                      }}
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    >
                      <img
                        src={track.albumCover}
                        alt={track.title}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold truncate">{track.title}</h4>
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                          {track.artist}
                          {track.featuringArtists.length > 0 && (
                            <span className="text-rose-500 font-semibold ml-1">
                              (Feat. {track.featuringArtists.map((f) => f.name).join(', ')})
                            </span>
                          )}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {track.tags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-500/10 text-neutral-400"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {track.featuringArtists[0] && (
                        <button
                          onClick={() => {
                            onSelectArtist(track.featuringArtists[0].name);
                            onClose();
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                        >
                          피쳐링 보기
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onSelectTrack(track.id);
                          onClose();
                        }}
                        className="p-2 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
