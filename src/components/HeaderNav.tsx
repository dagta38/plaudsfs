import React from 'react';
import { FeedTab, ThemeMode, UserProfile } from '../types';
import {
  Sparkles,
  Flame,
  Users2,
  Bookmark,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  BarChart3,
  Search,
} from 'lucide-react';

interface HeaderNavProps {
  currentTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  currentUser: UserProfile;
  onOpenTasteReport: () => void;
  onOpenAccountModal: () => void;
  onOpenSearchModal: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  onTabChange,
  themeMode,
  onToggleTheme,
  isMuted,
  onToggleMute,
  currentUser,
  onOpenTasteReport,
  onOpenAccountModal,
  onOpenSearchModal,
}) => {
  const isDark = themeMode === 'dark';

  return (
    <header
      id="main-app-header"
      className={`fixed top-0 left-0 right-0 z-40 h-16 px-3 sm:px-6 flex items-center justify-between border-b backdrop-blur-xl transition-colors duration-200 ${
        isDark
          ? 'bg-neutral-950/80 border-neutral-800/80 text-white'
          : 'bg-white/85 border-neutral-200/90 text-neutral-900 shadow-sm'
      }`}
    >
      {/* Brand Logo & Tag */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => onTabChange('forYou')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                VIBESPOT
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                TEEN
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 font-medium hidden sm:inline">
              10대 숏폼 음악 & 피쳐링 탐색
            </span>
          </div>
        </div>
      </div>

      {/* Center Feed Tabs */}
      <nav className="flex items-center gap-1 sm:gap-2">
        <button
          id="tab-for-you"
          onClick={() => onTabChange('forYou')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            currentTab === 'forYou'
              ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30 scale-105'
              : isDark
              ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">맞춤 추천</span>
          <span className="sm:hidden">추천</span>
        </button>

        <button
          id="tab-trending"
          onClick={() => onTabChange('trending')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            currentTab === 'trending'
              ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30 scale-105'
              : isDark
              ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">실시간 핫</span>
          <span className="sm:hidden">핫</span>
        </button>

        <button
          id="tab-feat-explore"
          onClick={() => onTabChange('featuringExplore')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            currentTab === 'featuringExplore'
              ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30 scale-105'
              : isDark
              ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Users2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">피쳐링 탐색</span>
          <span className="sm:hidden">피쳐링</span>
        </button>

        <button
          id="tab-library"
          onClick={() => onTabChange('library')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            currentTab === 'library'
              ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30 scale-105'
              : isDark
              ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">보관함</span>
          <span className="sm:hidden">저장</span>
        </button>
      </nav>

      {/* Right Action Icons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Search */}
        <button
          id="btn-open-search"
          onClick={onOpenSearchModal}
          className={`p-2 rounded-xl transition-colors ${
            isDark ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
          title="검색 & 태그 탐색"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Taste Report */}
        <button
          id="btn-open-taste-report"
          onClick={onOpenTasteReport}
          className={`p-2 rounded-xl transition-colors ${
            isDark ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
          title="10대 맞춤 취향 리포트"
        >
          <BarChart3 className="w-4 h-4 text-purple-400" />
        </button>

        {/* Audio Mute toggle */}
        <button
          id="btn-toggle-sound"
          onClick={onToggleMute}
          className={`p-2 rounded-xl transition-colors ${
            isMuted
              ? 'text-rose-500 bg-rose-500/10'
              : isDark
              ? 'hover:bg-neutral-800 text-neutral-300'
              : 'hover:bg-neutral-100 text-neutral-700'
          }`}
          title={isMuted ? '음소거 해제' : '음소거'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Dark / White Theme Toggle */}
        <button
          id="btn-toggle-theme"
          onClick={onToggleTheme}
          className={`p-2 rounded-xl transition-all ${
            isDark
              ? 'hover:bg-neutral-800 text-amber-400'
              : 'hover:bg-neutral-100 text-neutral-700'
          }`}
          title={isDark ? '화이트 모드로 전환' : '다크 모드로 전환'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Account Profile Trigger */}
        <button
          id="btn-user-profile-trigger"
          onClick={onOpenAccountModal}
          className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full ring-1 ring-neutral-500/20 hover:ring-rose-500/50 transition-all ml-1"
          title="계정 전환 및 취향 테스트"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.nickname}
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="text-xs font-bold max-w-[65px] truncate hidden md:inline">
            {currentUser.nickname}
          </span>
        </button>
      </div>
    </header>
  );
};
