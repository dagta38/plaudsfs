import React, { useState } from 'react';
import { Track, UserProfile, ThemeMode, FeaturingArtist } from '../types';
import {
  Bookmark,
  Heart,
  Music2,
  Play,
  Sparkles,
  Users2,
  Trash2,
  Database,
} from 'lucide-react';

interface LibraryViewProps {
  tracks: Track[];
  currentUser: UserProfile;
  themeMode: ThemeMode;
  onPlayTrack: (trackId: string) => void;
  onUnlikeTrack: (trackId: string) => void;
  onUnsaveTrack: (trackId: string) => void;
  onOpenFeaturingModal: (artist: FeaturingArtist, songTitle: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  tracks,
  currentUser,
  themeMode,
  onPlayTrack,
  onUnlikeTrack,
  onUnsaveTrack,
  onOpenFeaturingModal,
}) => {
  const [activeTab, setActiveTab] = useState<'liked' | 'saved' | 'artists'>('liked');
  const isDark = themeMode === 'dark';

  const likedTracks = tracks.filter((t) => currentUser.likedTrackIds.includes(t.id));
  const savedTracks = tracks.filter((t) => currentUser.savedTrackIds.includes(t.id));

  // Followed artists
  const allFeaturingArtists = tracks.flatMap((t) => t.featuringArtists);
  const followedArtists = allFeaturingArtists.filter((a, idx, self) =>
    currentUser.followedArtistIds.includes(a.id) && self.findIndex((x) => x.id === a.id) === idx
  );

  return (
    <div
      id="library-view-container"
      className={`w-full max-w-4xl mx-auto h-[calc(100vh-4rem)] p-4 sm:p-6 overflow-y-auto no-scrollbar ${
        isDark ? 'text-neutral-100' : 'text-neutral-900'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">내 음악 보관함</h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            {currentUser.nickname}님이 수집한 숏폼 플레이리스트
          </p>
        </div>

        {/* Firebase Firestore Tag */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Database className="w-3.5 h-3.5" />
          Firestore 저장소 동기화 대기
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-500/10 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('liked')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'liked'
              ? 'bg-rose-500 text-white shadow-sm'
              : isDark
              ? 'bg-neutral-800 text-neutral-400 hover:text-white'
              : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          좋아요한 음원 ({likedTracks.length})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'saved'
              ? 'bg-purple-600 text-white shadow-sm'
              : isDark
              ? 'bg-neutral-800 text-neutral-400 hover:text-white'
              : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 fill-current" />
          저장된 북마크 ({savedTracks.length})
        </button>

        <button
          onClick={() => setActiveTab('artists')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'artists'
              ? 'bg-blue-600 text-white shadow-sm'
              : isDark
              ? 'bg-neutral-800 text-neutral-400 hover:text-white'
              : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Users2 className="w-3.5 h-3.5" />
          팔로우한 아티스트 ({followedArtists.length})
        </button>
      </div>

      {/* Tab Contents: Liked */}
      {activeTab === 'liked' && (
        <div className="space-y-3 pb-12">
          {likedTracks.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 text-sm">
              좋아요를 누른 트랙이 없습니다. 피드에서 마음에 드는 음원에 하트를 눌러보세요! 💖
            </div>
          ) : (
            likedTracks.map((track) => (
              <div
                key={track.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all hover:scale-[1.01] ${
                  isDark
                    ? 'bg-neutral-900/70 border-neutral-800/80 hover:bg-neutral-900'
                    : 'bg-white border-neutral-200 hover:bg-neutral-50 shadow-sm'
                }`}
              >
                <div
                  onClick={() => onPlayTrack(track.id)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <img
                    src={track.albumCover}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover shadow-sm flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold truncate">{track.title}</h4>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">
                      {track.artist}
                      {track.featuringArtists[0] && (
                        <span className="text-rose-500 font-semibold ml-1">
                          (Feat. {track.featuringArtists[0].name})
                        </span>
                      )}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {track.genres.map((g) => (
                        <span
                          key={g}
                          className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-500/10 text-neutral-400"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUnlikeTrack(track.id)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="좋아요 취소"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    onClick={() => onPlayTrack(track.id)}
                    className="p-2.5 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-md shadow-rose-500/20"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Contents: Saved */}
      {activeTab === 'saved' && (
        <div className="space-y-3 pb-12">
          {savedTracks.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 text-sm">
              보관함에 저장된 트랙이 없습니다. 북마크 아이콘을 눌러 저장해보세요! 💾
            </div>
          ) : (
            savedTracks.map((track) => (
              <div
                key={track.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all hover:scale-[1.01] ${
                  isDark
                    ? 'bg-neutral-900/70 border-neutral-800/80 hover:bg-neutral-900'
                    : 'bg-white border-neutral-200 hover:bg-neutral-50 shadow-sm'
                }`}
              >
                <div
                  onClick={() => onPlayTrack(track.id)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <img
                    src={track.albumCover}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover shadow-sm flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold truncate">{track.title}</h4>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">
                      {track.artist} · {track.album}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUnsaveTrack(track.id)}
                    className="p-2 rounded-xl text-purple-400 hover:bg-purple-500/10 transition-colors"
                    title="보관함에서 제거"
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    onClick={() => onPlayTrack(track.id)}
                    className="p-2.5 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-md shadow-purple-500/20"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Contents: Followed Artists */}
      {activeTab === 'artists' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-12">
          {followedArtists.length === 0 ? (
            <div className="col-span-2 text-center py-16 text-neutral-400 text-sm">
              팔로우한 피쳐링 아티스트가 없습니다. 피드나 피쳐링 탐색 탭에서 아티스트를 팔로우해보세요! 🎤
            </div>
          ) : (
            followedArtists.map((artist) => (
              <div
                key={artist.id}
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isDark
                    ? 'bg-neutral-900/70 border-neutral-800/80'
                    : 'bg-white border-neutral-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-500/30"
                  />
                  <div>
                    <h4 className="text-sm font-bold">{artist.name}</h4>
                    <p className="text-xs text-rose-500 font-semibold">{artist.role}</p>
                    <span className="text-[10px] text-neutral-400">
                      앨범 {artist.otherAlbums.length}개 · {artist.followerCount}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenFeaturingModal(artist, '대표 수록곡')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                >
                  앨범 보기
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
