import React, { useState } from 'react';
import { Track, FeaturingArtist, ThemeMode, UserProfile } from '../types';
import {
  Sparkles,
  Search,
  Flame,
  Disc3,
  Heart,
  Play,
  CheckCircle2,
  ExternalLink,
  Users,
} from 'lucide-react';

interface FeaturingExploreViewProps {
  tracks: Track[];
  themeMode: ThemeMode;
  currentUser: UserProfile;
  onOpenFeaturingModal: (artist: FeaturingArtist, songTitle: string) => void;
  onPlayTrack: (trackId: string) => void;
  onToggleFollowArtist: (artistId: string) => void;
}

export const FeaturingExploreView: React.FC<FeaturingExploreViewProps> = ({
  tracks,
  themeMode,
  currentUser,
  onOpenFeaturingModal,
  onPlayTrack,
  onToggleFollowArtist,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const isDark = themeMode === 'dark';

  // Gather all unique featuring artists across tracks
  const allFeatArtistsWithTrack: { artist: FeaturingArtist; track: Track }[] = [];
  const artistIds = new Set<string>();

  tracks.forEach((track) => {
    track.featuringArtists.forEach((feat) => {
      if (!artistIds.has(feat.id)) {
        artistIds.add(feat.id);
        allFeatArtistsWithTrack.push({ artist: feat, track });
      }
    });
  });

  const filteredList = allFeatArtistsWithTrack.filter(({ artist }) => {
    const matchesQuery =
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.otherAlbums.some((alb) => alb.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      roleFilter === 'all' || artist.role.includes(roleFilter);

    return matchesQuery && matchesRole;
  });

  return (
    <div
      id="featuring-explore-container"
      className={`w-full max-w-4xl mx-auto h-[calc(100vh-4rem)] p-4 sm:p-6 overflow-y-auto no-scrollbar ${
        isDark ? 'text-neutral-100' : 'text-neutral-900'
      }`}
    >
      {/* Header Banner */}
      <div
        className={`p-6 rounded-3xl border mb-6 relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-r from-purple-950/60 via-rose-950/40 to-neutral-900 border-purple-800/40'
            : 'bg-gradient-to-r from-purple-100 via-rose-50 to-neutral-50 border-purple-200'
        }`}
      >
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500 text-white mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            피쳐링 디스커버리 허브
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            음악의 맛을 살리는 <span className="text-rose-500">특급 피쳐링 가수</span> 탐색
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 leading-relaxed">
            곡을 듣다가 꽂힌 바로 그 목소리! 피쳐링 아티스트의 킬링 파트, 숨겨진 솔로 앨범, 다른
            레전드 콜라보레이션까지 한 번에 디깅하세요.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div
          className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-white'
              : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
          }`}
        >
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="피쳐링 아티스트 이름, 앨범명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs sm:text-sm outline-none placeholder-neutral-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: '전체', value: 'all' },
            { label: '보컬 피쳐링', value: '보컬' },
            { label: '랩 피쳐링', value: '랩' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setRoleFilter(item.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                roleFilter === item.value
                  ? 'bg-rose-500 text-white shadow-sm'
                  : isDark
                  ? 'bg-neutral-800 text-neutral-400 hover:text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Featuring Artists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
        {filteredList.map(({ artist, track }) => {
          const isFollowed = currentUser.followedArtistIds.includes(artist.id);

          return (
            <div
              key={artist.id}
              className={`p-5 rounded-3xl border transition-all hover:scale-[1.01] ${
                isDark
                  ? 'bg-neutral-900/70 border-neutral-800/80 hover:border-neutral-700'
                  : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-sm'
              }`}
            >
              {/* Artist Card Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={artist.avatar}
                      alt={artist.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-rose-500/30"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-rose-500 text-white p-0.5 rounded-full shadow">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-base">{artist.name}</h3>
                      {artist.verified && (
                        <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-rose-500">
                      {artist.role} · 팔로워 {artist.followerCount}
                    </span>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{artist.instagramHandle}</p>
                  </div>
                </div>

                <button
                  onClick={() => onToggleFollowArtist(artist.id)}
                  className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    isFollowed
                      ? 'bg-rose-500 text-white'
                      : isDark
                      ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFollowed ? 'fill-white' : ''}`} />
                  {isFollowed ? '팔로잉' : '팔로우'}
                </button>
              </div>

              {/* Featuring Song Spotlight Info */}
              <div
                className={`p-3 rounded-2xl border mb-4 ${
                  isDark
                    ? 'bg-neutral-800/40 border-neutral-700/40'
                    : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-neutral-300">
                    참여 트랙: <strong className="text-rose-500">{track.title}</strong>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-rose-500/20 text-rose-400 font-bold">
                    {artist.partTimestamp}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 line-clamp-1">{artist.partDescription}</p>
              </div>

              {/* Discography Preview Carousel */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  <span>대표 앨범 목록</span>
                  <span className="text-rose-500 text-[11px] font-normal">
                    총 {artist.otherAlbums.length}개 앨범
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {artist.otherAlbums.map((album) => (
                    <div
                      key={album.id}
                      onClick={() => onOpenFeaturingModal(artist, track.title)}
                      className={`flex-shrink-0 w-32 p-2 rounded-xl border cursor-pointer hover:scale-105 transition-transform ${
                        isDark
                          ? 'bg-neutral-800/60 border-neutral-700/60'
                          : 'bg-white border-neutral-200 shadow-sm'
                      }`}
                    >
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-20 rounded-lg object-cover mb-1.5 shadow-sm"
                      />
                      <h5 className="text-[11px] font-bold truncate">{album.title}</h5>
                      <p className="text-[10px] text-neutral-400 truncate">{album.hitSong}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Trigger */}
              <div className="flex gap-2">
                <button
                  onClick={() => onOpenFeaturingModal(artist, track.title)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-rose-500/20"
                >
                  <Disc3 className="w-3.5 h-3.5" />
                  전체 앨범 & 수록곡 심층 탐색
                </button>
                <button
                  onClick={() => onPlayTrack(track.id)}
                  className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center ${
                    isDark
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'
                      : 'bg-neutral-100 border-neutral-200 text-neutral-800 hover:bg-neutral-200'
                  }`}
                  title="해당 음원 숏폼 피드로 재생"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
