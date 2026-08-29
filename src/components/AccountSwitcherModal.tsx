import React, { useState } from 'react';
import { UserProfile, ThemeMode } from '../types';
import { MOCK_USER_ACCOUNTS } from '../data/mockTracks';
import { X, UserCheck, Shield, Sparkles, LogIn, Database, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { FirebaseTodoService } from '../services/firebaseTodoService';
import { auth } from '../services/firebase';

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
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const isDark = themeMode === 'dark';
  const isFirebaseAuthenticated = !!auth.currentUser;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await FirebaseTodoService.signInWithGoogle();
      if (res.success && res.user) {
        onSelectUser(res.user);
        onClose();
      } else if (res.error) {
        setAuthError(res.error);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    setIsLoading(true);
    try {
      await FirebaseTodoService.signOutUser();
      onSelectUser(MOCK_USER_ACCOUNTS[0]);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
              <h3 className="font-bold text-base sm:text-lg">계정 관리 & Firebase 클라우드 동기화</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                <Database className="w-3 h-3" />
                Firestore 활성화
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              실제 Google 계정으로 로그인하거나 10대 프리셋 프로필로 추천 알고리즘을 테스트할 수 있습니다.
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

        {/* Real Firebase Auth Section */}
        <div className="p-4 sm:p-5 border-b border-neutral-500/10 bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                G
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold">
                  {isFirebaseAuthenticated ? 'Firebase Google 계정 로그인됨' : 'Google 계정으로 연동하기'}
                </h4>
                <p className="text-[11px] text-neutral-400">
                  {isFirebaseAuthenticated
                    ? `${auth.currentUser?.email} (${auth.currentUser?.displayName})`
                    : '시청 기록, 좋아요 및 댓글이 Firebase Firestore에 영구 저장됩니다.'}
                </p>
              </div>
            </div>

            {isFirebaseAuthenticated ? (
              <button
                id="btn-google-logout"
                onClick={handleGoogleLogout}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-rose-400 flex items-center gap-1 border border-neutral-700 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                로그아웃
              </button>
            ) : (
              <button
                id="btn-google-login"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-1.5 shadow-md shadow-rose-500/25 transition-all active:scale-95 disabled:opacity-50"
              >
                <LogIn className="w-3.5 h-3.5" />
                {isLoading ? '로그인 중...' : 'Google 로그인'}
              </button>
            )}
          </div>

          {authError && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 mt-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}
        </div>

        {/* List of 10s Personas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 no-scrollbar">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              10대 취향 프리셋 페르소나
            </span>
            <span className="text-[11px] text-purple-400 font-medium">즉시 알고리즘 전환</span>
          </div>

          {MOCK_USER_ACCOUNTS.map((account) => {
            const isSelected = account.id === currentUser.id && !isFirebaseAuthenticated;

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
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-neutral-500/10 text-center text-xs text-neutral-400 flex items-center justify-between px-5">
          <span>
            현재 프로필: <strong className="text-rose-500">{currentUser.nickname}</strong> ({currentUser.handle})
          </span>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Cloud Firestore 동기화 준비 완료
          </span>
        </div>
      </div>
    </div>
  );
};
