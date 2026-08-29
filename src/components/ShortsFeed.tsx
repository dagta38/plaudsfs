import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Track,
  UserProfile,
  ThemeMode,
  AudioSpeed,
  FeaturingArtist,
  EmbedProvider,
} from '../types';
import { audioEngine } from '../services/audioEngine';
import { AudioVisualizer } from './AudioVisualizer';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Mic2,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  Disc3,
  Flame,
  Zap,
  Moon,
  Music2,
  CheckCircle2,
  ExternalLink,
  Code,
  Copy,
  Check,
  X,
  Volume2,
} from 'lucide-react';

interface ShortsFeedProps {
  tracks: Track[];
  currentUser: UserProfile;
  themeMode: ThemeMode;
  isMuted: boolean;
  onLikeTrack: (trackId: string) => void;
  onSaveTrack: (trackId: string) => void;
  onOpenFeaturingModal: (artist: FeaturingArtist, songTitle: string) => void;
  onOpenCommentDrawer: (track: Track) => void;
  onOpenLyricsModal: (track: Track) => void;
  onRecordInteraction: (
    trackId: string,
    watchSec: number,
    completedRate: number,
    loopCount: number,
    skipped: boolean,
    featClicked: boolean
  ) => void;
  onFollowArtist: (artistId: string) => void;
}

export const ShortsFeed: React.FC<ShortsFeedProps> = ({
  tracks,
  currentUser,
  themeMode,
  isMuted,
  onLikeTrack,
  onSaveTrack,
  onOpenFeaturingModal,
  onOpenCommentDrawer,
  onOpenLyricsModal,
  onRecordInteraction,
  onFollowArtist,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [progressRatio, setProgressRatio] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState<AudioSpeed>(1.0);
  const [showPlayStateIcon, setShowPlayStateIcon] = useState<boolean | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const [embedMode, setEmbedMode] = useState<EmbedProvider>('interactive');
  const [showEmbedCodeModal, setShowEmbedCodeModal] = useState(false);
  const [copiedCodeType, setCopiedCodeType] = useState<'spotify' | 'appleMusic' | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const watchStartTimeRef = useRef<number>(Date.now());
  const loopCountRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const startYRef = useRef<number>(0);

  const currentTrack = tracks[currentIndex] || tracks[0];
  const isDark = themeMode === 'dark';

  // Handle Audio playback on track index change or speed change
  useEffect(() => {
    if (!currentTrack) return;

    watchStartTimeRef.current = Date.now();
    loopCountRef.current = 0;
    setCurrentPlaybackTime(0);
    setProgressRatio(0);

    if (embedMode === 'interactive') {
      audioEngine.setOnTimeUpdate((time, progress) => {
        setCurrentPlaybackTime(time);
        setProgressRatio(progress);

        if (progress >= 0.98) {
          loopCountRef.current += 1;
        }
      });

      audioEngine.play(
        currentTrack.id,
        currentTrack.audioSynthType,
        currentTrack.bpm,
        currentTrack.duration,
        audioSpeed
      );
      setIsPlaying(true);
    } else {
      // In embed iframe mode, pause local synth audio
      audioEngine.stop();
      setIsPlaying(false);
    }

    return () => {
      const elapsedSec = (Date.now() - watchStartTimeRef.current) / 1000;
      const completedRate = elapsedSec / (currentTrack.duration || 25);
      const skipped = elapsedSec < 3.5;

      onRecordInteraction(
        currentTrack.id,
        Math.round(elapsedSec),
        completedRate,
        loopCountRef.current,
        skipped,
        false
      );
    };
  }, [currentIndex, currentTrack?.id, audioSpeed, embedMode]);

  const goToNextTrack = useCallback(() => {
    if (currentIndex < tracks.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  }, [currentIndex, tracks.length]);

  const goToPrevTrack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        goToNextTrack();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        goToPrevTrack();
      } else if (e.key === ' ') {
        e.preventDefault();
        if (embedMode === 'interactive') {
          handleTogglePlay();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextTrack, goToPrevTrack, embedMode]);

  const handleTogglePlay = () => {
    if (!currentTrack) return;
    if (embedMode !== 'interactive') {
      // Switch back to interactive mode if user taps play
      setEmbedMode('interactive');
      return;
    }
    const playing = audioEngine.togglePlay(
      currentTrack.id,
      currentTrack.audioSynthType,
      currentTrack.bpm,
      currentTrack.duration,
      audioSpeed
    );
    setIsPlaying(playing);
    setShowPlayStateIcon(playing);
    setTimeout(() => setShowPlayStateIcon(null), 800);
  };

  const handleSeekChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (embedMode !== 'interactive') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    audioEngine.seek(ratio);
    setProgressRatio(ratio);
  };

  const cycleSpeed = () => {
    const speeds: AudioSpeed[] = [1.0, 1.25, 0.85];
    const nextIdx = (speeds.indexOf(audioSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setAudioSpeed(nextSpeed);
    audioEngine.setSpeed(nextSpeed);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleCopyEmbedCode = (type: 'spotify' | 'appleMusic') => {
    if (!currentTrack) return;
    let code = '';
    if (type === 'spotify') {
      code = `<iframe style="border-radius:12px" src="${currentTrack.spotifyEmbedUrl}" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    } else {
      code = `<iframe allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write" frameborder="0" height="175" style="width:100%;max-width:660px;overflow:hidden;border-radius:10px;" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" src="${currentTrack.appleMusicEmbedUrl}"></iframe>`;
    }
    navigator.clipboard?.writeText(code);
    setCopiedCodeType(type);
    setTimeout(() => setCopiedCodeType(null), 2500);
  };

  // Touch Swipe Gesture handler
  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    isDraggingRef.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const endY = e.changedTouches[0].clientY;
    const diff = startYRef.current - endY;

    if (diff > 50) {
      goToNextTrack();
    } else if (diff < -50) {
      goToPrevTrack();
    }
  };

  // Mouse wheel handler
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > 40) {
      if (e.deltaY > 0) {
        goToNextTrack();
      } else {
        goToPrevTrack();
      }
    }
  };

  if (!currentTrack) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
        재생할 음원이 없습니다.
      </div>
    );
  }

  const isLiked = currentUser.likedTrackIds.includes(currentTrack.id);
  const isSaved = currentUser.savedTrackIds.includes(currentTrack.id);
  const mainFeat = currentTrack.featuringArtists[0];

  const activeLyric = currentTrack.lyricsSnippet.slice().reverse().find(
    (l) => currentPlaybackTime >= l.time
  ) || currentTrack.lyricsSnippet[0];

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      id="shorts-feed-container"
      className="relative w-full h-[calc(100vh-4rem)] max-w-lg mx-auto flex flex-col justify-center items-center select-none overflow-hidden"
    >
      {/* 9:16 Vertical Card */}
      <div
        id="current-music-card"
        className={`relative w-full h-full max-h-[860px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between border transition-all duration-300 ${
          isDark
            ? 'bg-neutral-950 border-neutral-800'
            : 'bg-neutral-900 border-neutral-700 text-white'
        }`}
      >
        {/* Ambient Video/Cover Background with Pulse */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={currentTrack.albumCover}
            alt={currentTrack.title}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover blur-2xl scale-125 opacity-40 transition-transform duration-700 ${
              isPlaying ? 'scale-130' : 'scale-110'
            }`}
          />
          {/* Vibrant Tint Gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-b ${currentTrack.visualTheme.bgGradient} mix-blend-multiply opacity-85`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />
        </div>

        {/* TOP OVERLAY: Recommendation Reason & Provider Selector */}
        <div className="relative z-10 p-3.5 sm:p-4 pt-4 sm:pt-5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            {/* Personalized Algorithm Badge */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-black/50 backdrop-blur-md border border-white/15 text-white shadow-sm truncate max-w-full">
                <Sparkles className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 animate-pulse" />
                <span className="truncate">
                  {currentTrack.recommendationReason || '10대 실시간 맞춤 피드'}
                </span>
              </div>
            </div>

            {/* Embed Code Modal Trigger */}
            <button
              id="btn-open-embed-modal"
              onClick={() => setShowEmbedCodeModal(true)}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white flex items-center gap-1 transition-all"
              title="스포티파이 / 애플뮤직 임베드 코드 보기"
            >
              <Code className="w-3 h-3 text-emerald-400" />
              <span>임베드 코드</span>
            </button>
          </div>

          {/* Player Mode Switcher: [✨ 숏폼 모드] [🟢 Spotify] [🍎 Apple Music] */}
          <div className="flex items-center justify-between gap-1 p-1 bg-black/60 backdrop-blur-md rounded-2xl border border-white/15 shadow-inner">
            <button
              id="btn-mode-interactive"
              onClick={() => setEmbedMode('interactive')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                embedMode === 'interactive'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-[1.02]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>숏폼 비주얼</span>
            </button>

            <button
              id="btn-mode-spotify"
              onClick={() => {
                setEmbedMode('spotify');
                audioEngine.stop();
                setIsPlaying(false);
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                embedMode === 'spotify'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-[1.02]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-0.5 hidden sm:inline" />
              <span>🟢 Spotify</span>
            </button>

            <button
              id="btn-mode-applemusic"
              onClick={() => {
                setEmbedMode('appleMusic');
                audioEngine.stop();
                setIsPlaying(false);
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                embedMode === 'appleMusic'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-[1.02]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🍎 Apple Music</span>
            </button>
          </div>
        </div>

        {/* CENTER CONTENT AREA */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 overflow-hidden">
          {/* MODE 1: Interactive Short-form Synth & Visualizer */}
          {embedMode === 'interactive' && (
            <div
              onClick={handleTogglePlay}
              className="w-full flex-1 flex flex-col items-center justify-center cursor-pointer group"
            >
              {/* Speed / Mode Switcher Pill */}
              <div className="mb-3">
                <button
                  id="btn-speed-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleSpeed();
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-md border shadow ${
                    audioSpeed === 1.25
                      ? 'bg-rose-500 text-white border-rose-400 neon-glow-pink scale-105'
                      : audioSpeed === 0.85
                      ? 'bg-purple-600 text-white border-purple-400 neon-glow-purple scale-105'
                      : 'bg-black/50 text-neutral-200 border-white/20 hover:bg-black/70'
                  }`}
                  title="재생 배속 및 무드 변경 (스피드업 / 슬로우 & 리버브)"
                >
                  {audioSpeed === 1.25 ? (
                    <>
                      <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                      <span>1.25x 스피드업</span>
                    </>
                  ) : audioSpeed === 0.85 ? (
                    <>
                      <Moon className="w-3 h-3 text-purple-200" />
                      <span>0.85x 슬로우감성</span>
                    </>
                  ) : (
                    <>
                      <span>1.0x 정속 비트</span>
                    </>
                  )}
                </button>
              </div>

              {/* Animated Center Album Artwork with Floating Ring */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl overflow-hidden shadow-2xl transition-transform duration-500 ring-4 ${
                    isPlaying
                      ? 'scale-105 ring-rose-500/60 shadow-rose-500/20'
                      : 'scale-95 ring-neutral-700/50'
                  }`}
                >
                  <img
                    src={currentTrack.albumCover}
                    alt={currentTrack.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />

                  {/* Central play state indicator on tap */}
                  {showPlayStateIcon !== null && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in zoom-in-50 duration-200">
                      {showPlayStateIcon ? (
                        <Play className="w-16 h-16 text-white fill-white" />
                      ) : (
                        <Pause className="w-16 h-16 text-white fill-white" />
                      )}
                    </div>
                  )}
                </div>

                {/* Audio Spectrum Bars Reacting to Beat */}
                <div className="mt-3 flex items-center justify-center gap-2">
                  <AudioVisualizer
                    isPlaying={isPlaying}
                    color={currentTrack.visualTheme.accentColor}
                    themeMode={themeMode}
                    variant="bars"
                  />
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: Real Spotify Embed Iframe */}
          {embedMode === 'spotify' && (
            <div className="w-full flex-1 flex flex-col items-center justify-center py-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/30 bg-black/80 p-2 backdrop-blur-xl">
                <div className="flex items-center justify-between px-2 py-1.5 text-xs text-emerald-400 font-bold border-b border-white/10 mb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Spotify 공식 음원 스트리밍 임베드
                  </span>
                  <a
                    href={currentTrack.spotifyTrackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-neutral-300 hover:text-white flex items-center gap-1"
                  >
                    앱에서 열기
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="w-full rounded-xl overflow-hidden bg-black/90">
                  <iframe
                    title={`Spotify Player - ${currentTrack.title}`}
                    src={currentTrack.spotifyEmbedUrl}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-xl shadow-lg border-0"
                  />
                </div>

                <div className="mt-2.5 px-2 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>실제 Spotify 라이센스 트랙 재생</span>
                  <button
                    onClick={() => handleCopyEmbedCode('spotify')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedCodeType === 'spotify' ? '임베드 코드 복사됨!' : 'HTML 임베드 복사'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: Real Apple Music Embed Iframe */}
          {embedMode === 'appleMusic' && (
            <div className="w-full flex-1 flex flex-col items-center justify-center py-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-rose-500/30 bg-black/80 p-2 backdrop-blur-xl">
                <div className="flex items-center justify-between px-2 py-1.5 text-xs text-rose-400 font-bold border-b border-white/10 mb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    Apple Music 공식 플레이어 임베드
                  </span>
                  <a
                    href={currentTrack.appleMusicTrackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-neutral-300 hover:text-white flex items-center gap-1"
                  >
                    앱에서 열기
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="w-full rounded-xl overflow-hidden bg-black/90">
                  <iframe
                    title={`Apple Music Player - ${currentTrack.title}`}
                    src={currentTrack.appleMusicEmbedUrl}
                    width="100%"
                    height="175"
                    frameBorder="0"
                    allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                    sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                    className="rounded-xl shadow-lg border-0"
                  />
                </div>

                <div className="mt-2.5 px-2 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Apple Music 고음질 음원 스트리밍</span>
                  <button
                    onClick={() => handleCopyEmbedCode('appleMusic')}
                    className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedCodeType === 'appleMusic' ? '임베드 코드 복사됨!' : 'HTML 임베드 복사'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM METADATA & RIGHT ACTION BAR */}
        <div className="relative z-10 p-3.5 sm:p-4 flex items-end justify-between gap-3">
          {/* Left Metadata: Title, Artist, Featuring Discovery Pill, Lyrics Ticker */}
          <div className="flex-1 min-w-0 space-y-2 pb-1">
            {/* Song Title & Album */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-md truncate">
                  {currentTrack.title}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-white/20 text-neutral-100 backdrop-blur-sm flex-shrink-0">
                  {currentTrack.bpm} BPM
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-neutral-300 mt-0.5 drop-shadow flex items-center gap-1.5 truncate">
                <span>{currentTrack.artist}</span>
                <span className="text-neutral-500">·</span>
                <span className="text-neutral-400 text-xs font-normal truncate">{currentTrack.album}</span>
              </p>
            </div>

            {/* 🌟 KEY FEATURE: Featuring Artist Interactive Spotlight Pill */}
            {mainFeat && (
              <div
                id="btn-featuring-spotlight"
                onClick={(e) => {
                  e.stopPropagation();
                  onRecordInteraction(currentTrack.id, 10, 0.5, 0, false, true);
                  onOpenFeaturingModal(mainFeat, currentTrack.title);
                }}
                className="inline-flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-gradient-to-r from-rose-500/30 via-purple-500/20 to-neutral-900/60 border border-rose-400/40 backdrop-blur-md cursor-pointer hover:border-rose-400 transition-all hover:scale-[1.02] shadow-lg group max-w-full"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={mainFeat.avatar}
                    alt={mainFeat.name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-rose-400"
                  />
                  <div className="absolute -top-1 -right-1 bg-rose-500 rounded-full p-0.5 text-white">
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                </div>

                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-extrabold text-rose-400 group-hover:text-rose-300 truncate">
                      Feat. {mainFeat.name}
                    </span>
                    {mainFeat.verified && (
                      <CheckCircle2 className="w-3 h-3 text-blue-400 fill-blue-400/20 flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-300 flex items-center gap-1 truncate">
                    킬링 파트 ({mainFeat.partTimestamp}) · 앨범 탐색 ➔
                  </span>
                </div>
              </div>
            )}

            {/* Live Synced Lyric Ticker */}
            {activeLyric && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLyricsModal(currentTrack);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-neutral-200 text-xs font-medium cursor-pointer hover:bg-black/60 transition-colors"
              >
                <Mic2 className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span className="truncate">
                  {activeLyric.isFeatPart && (
                    <strong className="text-rose-400 mr-1">[{activeLyric.singer}]</strong>
                  )}
                  {activeLyric.text}
                </span>
              </div>
            )}

            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {currentTrack.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right Action Icons Column */}
          <div className="flex flex-col items-center gap-3 pl-1">
            {/* Artist Avatar with Follow Badge */}
            <div className="relative">
              <img
                src={currentTrack.artistAvatar}
                alt={currentTrack.artist}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
              />
              <button
                id="btn-follow-artist-icon"
                onClick={() => onFollowArtist(currentTrack.artistId)}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shadow"
              >
                +
              </button>
            </div>

            {/* Like Button */}
            <div className="flex flex-col items-center">
              <button
                id="btn-like-track"
                onClick={() => onLikeTrack(currentTrack.id)}
                className={`p-2.5 sm:p-3 rounded-full backdrop-blur-md transition-transform active:scale-125 ${
                  isLiked
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40'
                    : 'bg-black/40 hover:bg-black/60 text-white border border-white/10'
                }`}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow">
                {currentTrack.likeCount + (isLiked ? 1 : 0)}
              </span>
            </div>

            {/* Comment Button */}
            <div className="flex flex-col items-center">
              <button
                id="btn-open-comments"
                onClick={() => onOpenCommentDrawer(currentTrack)}
                className="p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/10 backdrop-blur-md transition-transform active:scale-110"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow">
                {currentTrack.comments.length}
              </span>
            </div>

            {/* Save / Bookmark */}
            <div className="flex flex-col items-center">
              <button
                id="btn-save-track"
                onClick={() => onSaveTrack(currentTrack.id)}
                className={`p-2.5 sm:p-3 rounded-full backdrop-blur-md transition-transform active:scale-110 ${
                  isSaved
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40'
                    : 'bg-black/40 hover:bg-black/60 text-white border border-white/10'
                }`}
              >
                <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow">
                {currentTrack.saveCount + (isSaved ? 1 : 0)}
              </span>
            </div>

            {/* Lyrics View Button */}
            <button
              id="btn-open-lyrics"
              onClick={() => onOpenLyricsModal(currentTrack)}
              className="p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/10 backdrop-blur-md"
              title="가사 보기"
            >
              <Mic2 className="w-4 h-4 text-rose-400" />
            </button>

            {/* Share */}
            <button
              id="btn-share-track"
              onClick={handleShare}
              className="p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/10 backdrop-blur-md"
              title="음원 공유하기"
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* BOTTOM TIMELINE PROGRESS BAR */}
        <div
          id="audio-progress-bar-container"
          onClick={handleSeekChange}
          className="relative z-20 w-full h-2 bg-white/20 hover:h-3 transition-all cursor-pointer group"
        >
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 relative transition-all duration-75"
            style={{ width: `${progressRatio * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      {/* Floating Vertical Navigation Arrows (Desktop / Tablet friendly) */}
      <div className="hidden lg:flex flex-col gap-2 absolute right-[-54px] top-1/2 -translate-y-1/2">
        <button
          id="btn-nav-prev"
          onClick={goToPrevTrack}
          disabled={currentIndex === 0}
          className={`p-3 rounded-2xl border backdrop-blur-md transition-all ${
            currentIndex === 0
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:scale-110 active:scale-95'
          } ${
            isDark
              ? 'bg-neutral-800/80 border-neutral-700 text-white hover:bg-neutral-700'
              : 'bg-white/90 border-neutral-300 text-neutral-800 hover:bg-neutral-100 shadow'
          }`}
          title="이전 음원 (위쪽 화살표)"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        <div className="text-center text-[10px] font-mono font-bold text-neutral-400 py-1">
          {currentIndex + 1} / {tracks.length}
        </div>

        <button
          id="btn-nav-next"
          onClick={goToNextTrack}
          className={`p-3 rounded-2xl border backdrop-blur-md transition-all hover:scale-110 active:scale-95 ${
            isDark
              ? 'bg-neutral-800/80 border-neutral-700 text-white hover:bg-neutral-700'
              : 'bg-white/90 border-neutral-300 text-neutral-800 hover:bg-neutral-100 shadow'
          }`}
          title="다음 음원 (아래쪽 화살표)"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Toast notification */}
      {copiedToast && (
        <div className="absolute top-20 z-50 px-4 py-2 rounded-2xl bg-emerald-500 text-white text-xs font-bold shadow-xl animate-in fade-in slide-in-from-top-2">
          음원 링크가 클립보드에 복사되었습니다! 🎉
        </div>
      )}

      {/* EMBED CODE MODAL */}
      {showEmbedCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
                : 'bg-white border-neutral-200 text-neutral-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">공식 음원 임베드 코드 (Embed)</h3>
                  <p className="text-xs text-neutral-400">{currentTrack.title} - {currentTrack.artist}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmbedCodeModal(false)}
                className="p-2 rounded-full hover:bg-neutral-800/50 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Spotify Embed Section */}
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Spotify iframe 임베드 코드
                  </span>
                  <button
                    onClick={() => handleCopyEmbedCode('spotify')}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1 transition-all"
                  >
                    {copiedCodeType === 'spotify' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCodeType === 'spotify' ? '복사됨!' : '코드 복사'}
                  </button>
                </div>
                <pre className="p-2.5 rounded-xl bg-black/70 text-[11px] font-mono text-emerald-300/90 overflow-x-auto select-all">
                  {`<iframe style="border-radius:12px" src="${currentTrack.spotifyEmbedUrl}" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`}
                </pre>
              </div>

              {/* Apple Music Embed Section */}
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Apple Music iframe 임베드 코드
                  </span>
                  <button
                    onClick={() => handleCopyEmbedCode('appleMusic')}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-1 transition-all"
                  >
                    {copiedCodeType === 'appleMusic' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCodeType === 'appleMusic' ? '복사됨!' : '코드 복사'}
                  </button>
                </div>
                <pre className="p-2.5 rounded-xl bg-black/70 text-[11px] font-mono text-rose-300/90 overflow-x-auto select-all">
                  {`<iframe allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write" frameborder="0" height="175" style="width:100%;max-width:660px;overflow:hidden;border-radius:10px;" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" src="${currentTrack.appleMusicEmbedUrl}"></iframe>`}
                </pre>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowEmbedCodeModal(false)}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
