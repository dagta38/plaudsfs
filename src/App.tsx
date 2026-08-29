/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Track,
  UserProfile,
  ThemeMode,
  FeedTab,
  FeaturingArtist,
  UserInteraction,
} from './types';
import { MOCK_TRACKS, MOCK_USER_ACCOUNTS } from './data/mockTracks';
import { RecommendationEngine } from './services/recommendationEngine';
import { FirebaseTodoService } from './services/firebaseTodoService';
import { audioEngine } from './services/audioEngine';

import { HeaderNav } from './components/HeaderNav';
import { ShortsFeed } from './components/ShortsFeed';
import { FeaturingExploreView } from './components/FeaturingExploreView';
import { LibraryView } from './components/LibraryView';
import { FeaturingDetailModal } from './components/FeaturingDetailModal';
import { CommentDrawer } from './components/CommentDrawer';
import { LyricsModal } from './components/LyricsModal';
import { TasteAnalyticsModal } from './components/TasteAnalyticsModal';
import { AccountSwitcherModal } from './components/AccountSwitcherModal';
import { SearchAndExploreModal } from './components/SearchAndExploreModal';

export default function App() {
  // Theme state: dark mode & light mode
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  // Navigation tab: forYou (맞춤 추천), trending (핫), featuringExplore (피쳐링 탐색), library (보관함)
  const [currentTab, setCurrentTab] = useState<FeedTab>('forYou');

  // State for tracks and accounts
  const [tracks, setTracks] = useState<Track[]>(MOCK_TRACKS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USER_ACCOUNTS[0]);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals state
  const [selectedFeatArtist, setSelectedFeatArtist] = useState<{
    artist: FeaturingArtist;
    songTitle: string;
  } | null>(null);
  const [activeCommentTrack, setActiveCommentTrack] = useState<Track | null>(null);
  const [activeLyricsTrack, setActiveLyricsTrack] = useState<Track | null>(null);
  const [showTasteReport, setShowTasteReport] = useState<boolean>(false);
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);

  // Sync theme with body background
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-neutral-950 text-neutral-100 font-sans antialiased overflow-hidden select-none';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-neutral-100 text-neutral-900 font-sans antialiased overflow-hidden select-none';
    }
  }, [themeMode]);

  // Compute feed list according to current tab & recommendation engine
  const activeFeedTracks = useMemo(() => {
    if (currentTab === 'forYou') {
      // 🌟 Personalized recommendation algorithm feed
      const scored = RecommendationEngine.getRecommendedFeed(tracks, currentUser);
      return scored.map((s) => s.track);
    } else if (currentTab === 'trending') {
      // Top trending by like and share count
      return [...tracks].sort((a, b) => b.likeCount + b.shareCount - (a.likeCount + a.shareCount));
    }
    return tracks;
  }, [currentTab, tracks, currentUser]);

  // Handle Theme Toggle
  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Handle Mute Toggle
  const handleToggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  // User Interaction Logger & Realtime Preference Re-calculation
  const handleRecordInteraction = (
    trackId: string,
    watchSec: number,
    completedRate: number,
    loopCount: number,
    skipped: boolean,
    featClicked: boolean
  ) => {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;

    const interaction: UserInteraction = {
      trackId,
      watchDurationSec: watchSec,
      completedRate,
      loopCount,
      liked: currentUser.likedTrackIds.includes(trackId),
      saved: currentUser.savedTrackIds.includes(trackId),
      shared: false,
      skippedEarly: skipped,
      featArtistClicked: featClicked,
      timestamp: Date.now(),
      genreAffinities: track.genres,
    };

    // Update current user history and total listen time
    setCurrentUser((prevUser) => {
      const existingHistory = [...prevUser.viewHistory];
      const existIdx = existingHistory.findIndex((h) => h.trackId === trackId);

      if (existIdx >= 0) {
        existingHistory[existIdx] = {
          ...existingHistory[existIdx],
          watchDurationSec: existingHistory[existIdx].watchDurationSec + watchSec,
          loopCount: Math.max(existingHistory[existIdx].loopCount, loopCount),
          completedRate: Math.max(existingHistory[existIdx].completedRate, completedRate),
          featArtistClicked: existingHistory[existIdx].featArtistClicked || featClicked,
        };
      } else {
        existingHistory.unshift(interaction);
      }

      const updatedUser: UserProfile = {
        ...prevUser,
        totalListenTimeSec: prevUser.totalListenTimeSec + watchSec,
        viewHistory: existingHistory.slice(0, 50),
      };

      // Recalculate genre affinity score
      const reCalced = RecommendationEngine.updateUserGenreAffinity(updatedUser, track, interaction);

      // TODO: Firebase Firestore 동기화 호출
      FirebaseTodoService.recordInteractionToFirestore(reCalced.id, interaction);
      FirebaseTodoService.syncUserProfileToFirestore(reCalced);

      return reCalced;
    });
  };

  // Handle Like Action
  const handleLikeTrack = (trackId: string) => {
    const isCurrentlyLiked = currentUser.likedTrackIds.includes(trackId);
    const targetTrack = tracks.find((t) => t.id === trackId);

    setCurrentUser((prev) => {
      const newLiked = isCurrentlyLiked
        ? prev.likedTrackIds.filter((id) => id !== trackId)
        : [...prev.likedTrackIds, trackId];

      const updated: UserProfile = {
        ...prev,
        likedTrackIds: newLiked,
      };

      // Update genre affinity with like bonus
      if (targetTrack) {
        return RecommendationEngine.updateUserGenreAffinity(updated, targetTrack, {
          liked: !isCurrentlyLiked,
        });
      }
      return updated;
    });

    // Update track like count
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId ? { ...t, likeCount: t.likeCount + (isCurrentlyLiked ? -1 : 1) } : t
      )
    );

    // TODO: Cloud Firestore 좋아요 컬렉션 동기화
    FirebaseTodoService.toggleLikeInFirestore(currentUser.id, trackId, !isCurrentlyLiked);
  };

  // Handle Save / Bookmark Action
  const handleSaveTrack = (trackId: string) => {
    const isCurrentlySaved = currentUser.savedTrackIds.includes(trackId);

    setCurrentUser((prev) => ({
      ...prev,
      savedTrackIds: isCurrentlySaved
        ? prev.savedTrackIds.filter((id) => id !== trackId)
        : [...prev.savedTrackIds, trackId],
    }));

    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId ? { ...t, saveCount: t.saveCount + (isCurrentlySaved ? -1 : 1) } : t
      )
    );
  };

  // Handle Follow Artist
  const handleToggleFollowArtist = (artistId: string) => {
    setCurrentUser((prev) => {
      const isFollowed = prev.followedArtistIds.includes(artistId);
      return {
        ...prev,
        followedArtistIds: isFollowed
          ? prev.followedArtistIds.filter((id) => id !== artistId)
          : [...prev.followedArtistIds, artistId],
      };
    });
  };

  // Handle Add Comment
  const handleAddComment = (commentData: { content: string; timestamp: string }) => {
    if (!activeCommentTrack) return;

    const newComment = {
      id: `c_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.nickname,
      userAvatar: currentUser.avatar,
      content: commentData.content,
      timestamp: commentData.timestamp,
      timeAgo: '방금 전',
      likeCount: 0,
      isLiked: false,
    };

    setTracks((prev) =>
      prev.map((t) =>
        t.id === activeCommentTrack.id
          ? {
              ...t,
              comments: [newComment, ...t.comments],
              commentCount: t.commentCount + 1,
            }
          : t
      )
    );

    setActiveCommentTrack((prev) =>
      prev ? { ...prev, comments: [newComment, ...prev.comments] } : null
    );
  };

  return (
    <div
      id="app-root-container"
      className={`relative w-full h-screen flex flex-col overflow-hidden transition-colors duration-300 ${
        themeMode === 'dark' ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-900'
      }`}
    >
      {/* Top Navigation Bar */}
      <HeaderNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        currentUser={currentUser}
        onOpenTasteReport={() => setShowTasteReport(true)}
        onOpenAccountModal={() => setShowAccountModal(true)}
        onOpenSearchModal={() => setShowSearchModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-16 w-full h-full overflow-hidden relative">
        {/* TAB 1 & 2: Shorts Feed (For You & Trending) */}
        {(currentTab === 'forYou' || currentTab === 'trending') && (
          <ShortsFeed
            key={`${currentTab}_${currentUser.id}`}
            tracks={activeFeedTracks}
            currentUser={currentUser}
            themeMode={themeMode}
            isMuted={isMuted}
            onLikeTrack={handleLikeTrack}
            onSaveTrack={handleSaveTrack}
            onOpenFeaturingModal={(artist, songTitle) =>
              setSelectedFeatArtist({ artist, songTitle })
            }
            onOpenCommentDrawer={(track) => setActiveCommentTrack(track)}
            onOpenLyricsModal={(track) => setActiveLyricsTrack(track)}
            onRecordInteraction={handleRecordInteraction}
            onFollowArtist={handleToggleFollowArtist}
          />
        )}

        {/* TAB 3: Featuring Discovery Hub */}
        {currentTab === 'featuringExplore' && (
          <FeaturingExploreView
            tracks={tracks}
            themeMode={themeMode}
            currentUser={currentUser}
            onOpenFeaturingModal={(artist, songTitle) =>
              setSelectedFeatArtist({ artist, songTitle })
            }
            onPlayTrack={(trackId) => {
              setCurrentTab('forYou');
              const idx = tracks.findIndex((t) => t.id === trackId);
              if (idx >= 0) {
                // Re-order tracks to place selected track first
                const reordered = [tracks[idx], ...tracks.filter((t) => t.id !== trackId)];
                setTracks(reordered);
              }
            }}
            onToggleFollowArtist={handleToggleFollowArtist}
          />
        )}

        {/* TAB 4: My Library & Bookmarks */}
        {currentTab === 'library' && (
          <LibraryView
            tracks={tracks}
            currentUser={currentUser}
            themeMode={themeMode}
            onPlayTrack={(trackId) => {
              setCurrentTab('forYou');
              const idx = tracks.findIndex((t) => t.id === trackId);
              if (idx >= 0) {
                const reordered = [tracks[idx], ...tracks.filter((t) => t.id !== trackId)];
                setTracks(reordered);
              }
            }}
            onUnlikeTrack={handleLikeTrack}
            onUnsaveTrack={handleSaveTrack}
            onOpenFeaturingModal={(artist, songTitle) =>
              setSelectedFeatArtist({ artist, songTitle })
            }
          />
        )}
      </main>

      {/* MODAL 1: Featuring Artist Deep-Dive & Discography Drawer */}
      {selectedFeatArtist && (
        <FeaturingDetailModal
          artist={selectedFeatArtist.artist}
          currentSongTitle={selectedFeatArtist.songTitle}
          themeMode={themeMode}
          isFollowed={currentUser.followedArtistIds.includes(selectedFeatArtist.artist.id)}
          onClose={() => setSelectedFeatArtist(null)}
          onToggleFollow={handleToggleFollowArtist}
          onFilterByArtist={(artistName) => {
            setCurrentTab('forYou');
            const matchingTracks = tracks.filter((t) =>
              t.featuringArtists.some((f) => f.name.includes(artistName))
            );
            if (matchingTracks.length > 0) {
              setTracks([
                ...matchingTracks,
                ...tracks.filter((t) => !matchingTracks.includes(t)),
              ]);
            }
          }}
          onPlayPreviewTrack={(title) => {
            audioEngine.play('preview', 'kpop_dance', 128, 15, 1.0);
          }}
        />
      )}

      {/* MODAL 2: Comments Drawer */}
      {activeCommentTrack && (
        <CommentDrawer
          track={activeCommentTrack}
          themeMode={themeMode}
          currentPlaybackTime={12}
          onClose={() => setActiveCommentTrack(null)}
          onAddComment={handleAddComment}
        />
      )}

      {/* MODAL 3: Synced Lyrics View */}
      {activeLyricsTrack && (
        <LyricsModal
          track={activeLyricsTrack}
          themeMode={themeMode}
          currentPlaybackTime={8}
          onClose={() => setActiveLyricsTrack(null)}
          onSeek={(sec) => {
            audioEngine.seek(sec / (activeLyricsTrack.duration || 25));
          }}
        />
      )}

      {/* MODAL 4: 10s Taste Analytics & Recommendation Report */}
      {showTasteReport && (
        <TasteAnalyticsModal
          user={currentUser}
          allTracks={tracks}
          themeMode={themeMode}
          onClose={() => setShowTasteReport(false)}
          onSelectTrackFromHistory={(trackId) => {
            setCurrentTab('forYou');
            const idx = tracks.findIndex((t) => t.id === trackId);
            if (idx >= 0) {
              setTracks([tracks[idx], ...tracks.filter((t) => t.id !== trackId)]);
            }
          }}
        />
      )}

      {/* MODAL 5: Teen Account Switcher & Firebase Auth TODO Test */}
      {showAccountModal && (
        <AccountSwitcherModal
          currentUser={currentUser}
          themeMode={themeMode}
          onSelectUser={(newUser) => {
            setCurrentUser(newUser);
          }}
          onClose={() => setShowAccountModal(false)}
        />
      )}

      {/* MODAL 6: Search & Tag Exploration */}
      {showSearchModal && (
        <SearchAndExploreModal
          allTracks={tracks}
          themeMode={themeMode}
          onClose={() => setShowSearchModal(false)}
          onSelectTrack={(trackId) => {
            setCurrentTab('forYou');
            const idx = tracks.findIndex((t) => t.id === trackId);
            if (idx >= 0) {
              setTracks([tracks[idx], ...tracks.filter((t) => t.id !== trackId)]);
            }
          }}
          onSelectArtist={(artistName) => {
            const feat = tracks
              .flatMap((t) => t.featuringArtists)
              .find((f) => f.name.includes(artistName));
            if (feat) {
              setSelectedFeatArtist({ artist: feat, songTitle: '대표 수록곡' });
            }
          }}
        />
      )}
    </div>
  );
}
