import React from 'react';
import { UserProfile, Track, ThemeMode } from '../types';
import {
  X,
  Sparkles,
  BarChart3,
  Flame,
  Heart,
  Clock,
  Repeat,
  CheckCircle2,
  TrendingUp,
  Sliders,
  Play,
} from 'lucide-react';

interface TasteAnalyticsModalProps {
  user: UserProfile;
  allTracks: Track[];
  themeMode: ThemeMode;
  onClose: () => void;
  onSelectTrackFromHistory?: (trackId: string) => void;
}

export const TasteAnalyticsModal: React.FC<TasteAnalyticsModalProps> = ({
  user,
  allTracks,
  themeMode,
  onClose,
  onSelectTrackFromHistory,
}) => {
  const isDark = themeMode === 'dark';

  const formatMinutes = (sec: number) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}분 ${s}초`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-lg animate-in fade-in duration-200">
      <div
        id="taste-analytics-modal-card"
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border ${
          isDark
            ? 'bg-neutral-900/95 border-neutral-800 text-neutral-100'
            : 'bg-white/95 border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 text-white shadow-md">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight">10대 음악 취향 분석 리포트</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-500">
                  AI 알고리즘 분석
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {user.nickname}님의 시청 기록 & 좋아요 데이터를 종합한 맞춤 결과
              </p>
            </div>
          </div>
          <button
            id="btn-close-taste-modal"
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 no-scrollbar">
          {/* Top summary card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className={`p-3.5 rounded-2xl border text-center ${
                isDark ? 'bg-neutral-800/60 border-neutral-700/60' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <span className="text-xs text-neutral-400 block mb-1">총 음악 청취 시간</span>
              <span className="text-base sm:text-lg font-extrabold text-rose-500">
                {formatMinutes(user.totalListenTimeSec)}
              </span>
            </div>
            <div
              className={`p-3.5 rounded-2xl border text-center ${
                isDark ? 'bg-neutral-800/60 border-neutral-700/60' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <span className="text-xs text-neutral-400 block mb-1">좋아요 누른 트랙</span>
              <span className="text-base sm:text-lg font-extrabold text-purple-500">
                {user.likedTrackIds.length}곡
              </span>
            </div>
            <div
              className={`p-3.5 rounded-2xl border text-center ${
                isDark ? 'bg-neutral-800/60 border-neutral-700/60' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <span className="text-xs text-neutral-400 block mb-1">팔로우한 피쳐링</span>
              <span className="text-base sm:text-lg font-extrabold text-blue-500">
                {user.followedArtistIds.length}명
              </span>
            </div>
            <div
              className={`p-3.5 rounded-2xl border text-center ${
                isDark ? 'bg-neutral-800/60 border-neutral-700/60' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <span className="text-xs text-neutral-400 block mb-1">시청 기록 데이터</span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-500">
                {user.viewHistory.length}회 수집
              </span>
            </div>
          </div>

          {/* Genre Preferences Chart */}
          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-neutral-800/40 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-500" />
                장르별 취향 친밀도 (Algorithm Affinity)
              </h4>
              <span className="text-xs text-neutral-400">실시간 가중치 반영</span>
            </div>

            <div className="space-y-3.5">
              {user.favoriteGenres.map((item, index) => {
                const colors = [
                  'from-rose-500 to-pink-500',
                  'from-purple-500 to-indigo-500',
                  'from-blue-500 to-cyan-500',
                  'from-emerald-500 to-teal-500',
                ];
                const color = colors[index % colors.length];

                return (
                  <div key={item.genre} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{item.genre}</span>
                      <span className="font-mono text-rose-500">{item.score}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-neutral-500/20 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Algorithm Engine Mechanics Explanation */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark
                ? 'bg-purple-950/20 border-purple-800/30 text-neutral-300'
                : 'bg-purple-50 border-purple-200 text-neutral-700'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 mb-2">
              <Sliders className="w-4 h-4" />
              추천 피드(For You)는 어떻게 구성되나요?
            </div>
            <p className="text-xs leading-relaxed">
              바이브스팟 알고리즘은 <strong>음악 완주율 & 무한 루프 횟수</strong>(+30점),{' '}
              <strong>좋아요 및 보관</strong>(+45점), <strong>피쳐링 가수 상세 탐색</strong>(+35점)을 종합해
              사용자 계정별로 가장 취향에 맞는 숏폼 음원을 첫 순위로 자동 배치합니다. (3초 이내 스킵 시 가중치 감소)
            </p>
          </div>

          {/* View History Timeline */}
          <div>
            <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-neutral-400" />
              최근 시청 및 인터랙션 로그
            </h4>

            <div className="space-y-2">
              {user.viewHistory.length === 0 ? (
                <div className="text-xs text-neutral-400 text-center py-4">
                  아직 시청 기록이 없습니다.
                </div>
              ) : (
                user.viewHistory.map((history, idx) => {
                  const track = allTracks.find((t) => t.id === history.trackId);
                  if (!track) return null;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isDark
                          ? 'bg-neutral-800/50 border-neutral-700/50'
                          : 'bg-neutral-50 border-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={track.albumCover}
                          alt={track.title}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-lg object-cover"
                        />
                        <div>
                          <h5 className="text-xs font-bold">{track.title}</h5>
                          <p className="text-[11px] text-neutral-400">
                            {track.artist} {track.featuringArtists[0] ? `(Feat. ${track.featuringArtists[0].name})` : ''}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {history.loopCount > 1 && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-purple-500/20 text-purple-400 flex items-center gap-0.5">
                                <Repeat className="w-2.5 h-2.5" />
                                {history.loopCount}회 반복
                              </span>
                            )}
                            {history.liked && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-500/20 text-rose-400 flex items-center gap-0.5">
                                <Heart className="w-2.5 h-2.5 fill-current" />
                                좋아요
                              </span>
                            )}
                            {history.featArtistClicked && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-blue-500/20 text-blue-400 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" />
                                피쳐링 탐색
                              </span>
                            )}
                            {history.skippedEarly && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-neutral-500/20 text-neutral-400">
                                3초 스킵
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {onSelectTrackFromHistory && (
                        <button
                          onClick={() => {
                            onSelectTrackFromHistory(track.id);
                            onClose();
                          }}
                          className="p-2 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-500/10 text-center text-xs text-neutral-400">
          // TODO: Cloud Firestore를 통해 사용자 시청 기록 및 실시간 선호도 벡터가 자동 동기화됩니다.
        </div>
      </div>
    </div>
  );
};
