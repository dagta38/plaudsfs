import React, { useState } from 'react';
import { FeaturingArtist, ThemeMode } from '../types';
import {
  X,
  Sparkles,
  Disc3,
  Users,
  Play,
  Heart,
  ExternalLink,
  Flame,
  Music2,
  CheckCircle2,
  Share2,
  Code,
  Copy,
  Check,
} from 'lucide-react';

interface FeaturingDetailModalProps {
  artist: FeaturingArtist | null;
  currentSongTitle: string;
  themeMode: ThemeMode;
  isFollowed: boolean;
  onClose: () => void;
  onToggleFollow: (artistId: string) => void;
  onFilterByArtist?: (artistName: string) => void;
  onPlayPreviewTrack?: (title: string) => void;
}

export const FeaturingDetailModal: React.FC<FeaturingDetailModalProps> = ({
  artist,
  currentSongTitle,
  themeMode,
  isFollowed,
  onClose,
  onToggleFollow,
  onFilterByArtist,
  onPlayPreviewTrack,
}) => {
  const [activeTab, setActiveTab] = useState<'albums' | 'collabs' | 'hits'>('albums');
  const [activeEmbedIframe, setActiveEmbedIframe] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!artist) return null;

  const isDark = themeMode === 'dark';

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
      <div
        id="featuring-modal-card"
        className={`w-full max-w-xl max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border ${
          isDark
            ? 'bg-neutral-900/95 border-neutral-800 text-neutral-100'
            : 'bg-white/95 border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="relative p-5 pb-4 border-b border-neutral-500/10 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={artist.avatar}
                alt={artist.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover ring-2 ring-rose-500/50 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 bg-rose-500 text-white p-1 rounded-full text-xs shadow">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xl font-bold tracking-tight">{artist.name}</h3>
                {artist.verified && (
                  <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                )}
              </div>
              <p className="text-xs text-rose-500 font-semibold tracking-wide flex items-center gap-1 mt-0.5">
                <Music2 className="w-3 h-3" />
                {artist.role} · 팔로워 {artist.followerCount}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {artist.spotifyLink && (
                  <a
                    href={artist.spotifyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full"
                  >
                    <span>🟢 Spotify 프로필</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
                {artist.appleMusicLink && (
                  <a
                    href={artist.appleMusicLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded-full"
                  >
                    <span>🍎 Apple Music</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-close-feat-modal"
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
          {/* Featuring Highlight Point Card */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark
                ? 'bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-neutral-800/40 border-rose-500/30'
                : 'bg-gradient-to-r from-rose-50 via-purple-50 to-neutral-50 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white flex items-center gap-1">
                <Flame className="w-3 h-3" />
                킬링 파트 ({artist.partTimestamp})
              </span>
              <span className="text-xs text-neutral-400 font-medium">
                in <strong className="text-rose-500">{currentSongTitle}</strong>
              </span>
            </div>
            <p className="text-sm font-medium leading-relaxed">{artist.partDescription}</p>
            <p className="text-xs text-neutral-400 mt-2 italic font-serif">
              "{artist.bio}"
            </p>
          </div>

          {/* Active Embedded Player preview if selected */}
          {activeEmbedIframe && (
            <div className="p-3 rounded-2xl bg-black/80 border border-emerald-500/40 animate-in fade-in">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold mb-2">
                <span>🟢 Spotify 공식 앨범/음원 임베드 플레이어</span>
                <button
                  onClick={() => setActiveEmbedIframe(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <iframe
                title="Spotify Album Embed"
                src={activeEmbedIframe}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                className="rounded-xl border-0"
              />
            </div>
          )}

          {/* Action buttons (Follow & Feed Filter) */}
          <div className="flex gap-2">
            <button
              id="btn-toggle-follow-artist"
              onClick={() => onToggleFollow(artist.id)}
              className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                isFollowed
                  ? isDark
                    ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                    : 'bg-neutral-200 text-neutral-700'
                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFollowed ? 'fill-rose-500 text-rose-500' : ''}`} />
              {isFollowed ? '팔로잉 중 ✓' : '아티스트 팔로우'}
            </button>

            {onFilterByArtist && (
              <button
                id="btn-filter-feed-by-artist"
                onClick={() => {
                  onFilterByArtist(artist.name);
                  onClose();
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  isDark
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                }`}
              >
                <Disc3 className="w-4 h-4 text-purple-500 animate-spin-slow" />
                이 가수의 곡만 피드 탐색
              </button>
            )}

            <button
              id="btn-share-artist"
              onClick={handleShare}
              className={`p-2.5 rounded-xl transition-colors ${
                isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
              title="공유하기"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {copiedNotification && (
            <div className="text-center py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg">
              링크가 클립보드에 복사되었습니다! 🎉
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-neutral-500/10">
            <button
              id="tab-feat-albums"
              onClick={() => setActiveTab('albums')}
              className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === 'albums'
                  ? 'border-rose-500 text-rose-500'
                  : 'border-transparent text-neutral-400 hover:text-neutral-300'
              }`}
            >
              <Disc3 className="w-3.5 h-3.5" />
              추천 앨범 디스코그래피 ({artist.otherAlbums.length})
            </button>
            <button
              id="tab-feat-collabs"
              onClick={() => setActiveTab('collabs')}
              className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === 'collabs'
                  ? 'border-rose-500 text-rose-500'
                  : 'border-transparent text-neutral-400 hover:text-neutral-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              다른 레전드 피쳐링 ({artist.otherCollabs.length})
            </button>
            <button
              id="tab-feat-hits"
              onClick={() => setActiveTab('hits')}
              className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === 'hits'
                  ? 'border-rose-500 text-rose-500'
                  : 'border-transparent text-neutral-400 hover:text-neutral-300'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              인기 TOP 곡
            </button>
          </div>

          {/* Tab 1: Other Albums */}
          {activeTab === 'albums' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  {artist.name}의 대표 앨범 & 수록곡
                </h4>
                <span className="text-[11px] text-rose-500 font-medium">10대 추천도 98%</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {artist.otherAlbums.map((album) => (
                  <div
                    key={album.id}
                    className={`p-3 rounded-2xl border transition-all hover:scale-[1.01] ${
                      isDark
                        ? 'bg-neutral-800/60 border-neutral-700/60 hover:border-neutral-600'
                        : 'bg-neutral-50 border-neutral-200/80 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover shadow-sm flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-neutral-500/20 text-neutral-400">
                            {album.releaseYear}
                          </span>
                          <span className="text-[10px] text-rose-500 font-semibold truncate">
                            {album.genre}
                          </span>
                        </div>
                        <h5 className="text-sm font-bold truncate mt-0.5">{album.title}</h5>
                        <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                          대표곡: <span className="font-semibold text-neutral-200">{album.hitSong}</span>
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-2.5 line-clamp-2 leading-relaxed">
                      {album.description}
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-neutral-500/10 flex items-center justify-between">
                      <span className="text-[11px] text-neutral-400">총 {album.trackCount}곡 수록</span>
                      {album.spotifyEmbedUrl ? (
                        <button
                          onClick={() => setActiveEmbedIframe(album.spotifyEmbedUrl || null)}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg"
                        >
                          <span>🟢 Spotify 임베드</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onPlayPreviewTrack && onPlayPreviewTrack(album.hitSong)}
                          className="text-[11px] text-rose-500 hover:text-rose-400 font-semibold flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-rose-500" />
                          미리듣기
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Other Collabs */}
          {activeTab === 'collabs' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                {artist.name}의 또 다른 특급 피쳐링 음원
              </h4>
              <div className="space-y-2">
                {artist.otherCollabs.map((collab) => (
                  <div
                    key={collab.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isDark
                        ? 'bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-800'
                        : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={collab.coverUrl}
                        alt={collab.title}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h5 className="text-xs font-bold">{collab.title}</h5>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          {collab.mainArtist} · {collab.genre}
                        </p>
                        <span className="inline-block mt-0.5 text-[10px] text-rose-500 font-semibold">
                          Feat. {collab.featArtist}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {collab.spotifyEmbedUrl && (
                        <button
                          onClick={() => setActiveEmbedIframe(collab.spotifyEmbedUrl || null)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white text-[11px] font-bold transition-colors flex items-center gap-1"
                        >
                          <span>🟢 Spotify 듣기</span>
                        </button>
                      )}
                      <button
                        onClick={() => onPlayPreviewTrack && onPlayPreviewTrack(collab.title)}
                        className="p-2 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Top Hit Tracks */}
          {activeTab === 'hits' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                스트리밍 차트 상위 인기곡
              </h4>
              <div className="space-y-2">
                {artist.topTracks.map((track, idx) => (
                  <div
                    key={track.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isDark
                        ? 'bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-800'
                        : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center font-bold text-sm text-neutral-400">
                        {idx + 1}
                      </span>
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-lg object-cover"
                      />
                      <div>
                        <h5 className="text-xs font-bold">{track.title}</h5>
                        <p className="text-[11px] text-neutral-400">{track.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400">{track.playCount}회</span>
                      {track.spotifyTrackId && (
                        <button
                          onClick={() => setActiveEmbedIframe(`https://open.spotify.com/embed/track/${track.spotifyTrackId}?utm_source=generator`)}
                          className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white text-[11px] font-bold"
                        >
                          🟢 듣기
                        </button>
                      )}
                      <button
                        onClick={() => onPlayPreviewTrack && onPlayPreviewTrack(track.title)}
                        className="p-2 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-500/10 flex items-center justify-between text-xs text-neutral-400">
          <span>VibeSpot Spotify & Apple Music 디스커버리</span>
          <a
            href="https://open.spotify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-emerald-400 transition-colors font-semibold"
          >
            Spotify 공식 앱에서 더 많은 곡 듣기
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
