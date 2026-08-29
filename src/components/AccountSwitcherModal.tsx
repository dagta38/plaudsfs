import React from 'react';
import { UserProfile, ThemeMode } from '../types';
import { MOCK_USER_ACCOUNTS } from '../data/mockTracks';
import { X, UserCheck, Shield, Sparkles, LogIn, Database, LogOut } from 'lucide-react';
import { FirebaseTodoService } from '../services/firebaseTodoService';

interface AccountSwitcherModalProps {
  currentUser: UserProfile;
  themeMode: ThemeMode;
  onSelectUser: (user: UserProfile) => void;
  onClose: () => void;
}

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({
  currentUser,
  themeMode,
  onSelectUser,
  onClose,
}) => {
  const isDark = themeMode === 'dark';

  const handleGoogleLoginMock = async () => {
    await FirebaseTodoService.signInWithGoogle();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-lg animate-in fade-in duration-200">
      <div
        id="account-switcher-card"
        className={`w-full max-w-lg max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border ${
          isDark
            ? 'bg-neutral-900/95 border-neutral-800 text-neutral-100'
            : 'bg-white/95 border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-500/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base sm:text-lg">계정 전환 & 취향 알고리즘 테스트</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-400">
                10대 맞춤 프로필
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              계정을 바꾸면 해당 청소년의 시청기록과 좋아요에 맞춰 숏폼 피드가 재정렬됩니다.
            </p>
          </div>
          <button
            id="btn-close-account-modal"
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of profiles */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 no-scrollbar">
          {MOCK_USER_ACCOUNTS.map((account) => {
            const isSelected = account.id === currentUser.id;

            return (
              <div
                key={account.id}
                onClick={() => {
                  onSelectUser(account);
                  onClose();
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? isDark
                      ? 'bg-rose-950/30 border-rose-500/60 ring-1 ring-rose-500'
                      : 'bg-rose-50 border-rose-400 ring-1 ring-rose-400'
                    : isDark
                    ? 'bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-800'
                    : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={account.avatar}
                      alt={account.nickname}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-neutral-500/20"
                    />
                    {isSelected && (
                      <div className="absolute -bottom-1 -right-1 bg-rose-500 text-white p-0.5 rounded-full shadow">
                        <UserCheck className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold">{account.nickname}</h4>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-500/20 text-neutral-400 font-semibold">
                        {account.ageBadge}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{account.bio}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] font-bold text-rose-500">
                        주 선호: {account.favoriteGenres.slice(0, 2).map((g) => g.genre).join(', ')}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        · 좋아요 {account.likedTrackIds.length}개
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-rose-500 text-white'
                      : isDark
                      ? 'bg-neutral-700 text-neutral-300'
                      : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {isSelected ? '선택됨' : '선택'}
                </button>
              </div>
            );
          })}

          {/* Firebase TODO Banner */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark
                ? 'bg-neutral-950/60 border-amber-500/30 text-neutral-300'
                : 'bg-amber-50/70 border-amber-200 text-neutral-700'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500 mb-1">
              <Database className="w-4 h-4" />
              // TODO: Firebase Authentication & Cloud Firestore 안내
            </div>
            <p className="text-xs leading-relaxed text-neutral-400">
              실제 서비스 배포 시 <code>Firebase TodoService</code>의 <code>signInWithGoogle()</code>과{' '}
              <code>syncUserProfileToFirestore()</code>에 Firebase SDK를 연동하여 전 세계 청소년들의
              실시간 시청기록과 좋아요를 클라우드에 영구 보존할 수 있습니다.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleGoogleLoginMock}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-rose-500" />
                Google 로그인 (TODO 연동부 호출)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-neutral-500/10 text-center text-xs text-neutral-400">
          현재 로그인: <strong className="text-rose-500">{currentUser.nickname}</strong> ({currentUser.handle})
        </div>
      </div>
    </div>
  );
};
