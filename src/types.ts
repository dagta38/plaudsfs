/**
 * Data structures for VibeSpot (바이브스팟)
 * 10s Music Short-Form & Featuring Discovery Platform
 */

export type ThemeMode = 'dark' | 'light';

export type FeedTab = 'forYou' | 'trending' | 'featuringExplore' | 'library';

export type AudioSpeed = 0.85 | 1.0 | 1.25;

export type EmbedProvider = 'spotify' | 'appleMusic' | 'interactive';

export interface FeaturingArtist {
  id: string;
  name: string;
  role: '피쳐링 (보컬)' | '피쳐링 (랩)' | '프로듀서' | '작곡' | '코러스';
  avatar: string;
  verified: boolean;
  followerCount: string;
  partTimestamp: string;
  partDescription: string;
  bio: string;
  instagramHandle: string;
  spotifyLink?: string;
  appleMusicLink?: string;
  spotifyEmbedUrl?: string;
  appleMusicEmbedUrl?: string;
  otherAlbums: AlbumSummary[];
  otherCollabs: CollabSummary[];
  topTracks: TrackSummary[];
}

export interface AlbumSummary {
  id: string;
  title: string;
  coverUrl: string;
  releaseYear: string;
  trackCount: number;
  genre: string;
  hitSong: string;
  description: string;
  spotifyEmbedUrl?: string;
  appleMusicEmbedUrl?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
}

export interface CollabSummary {
  id: string;
  title: string;
  mainArtist: string;
  featArtist: string;
  year: string;
  coverUrl: string;
  genre: string;
  spotifyEmbedUrl?: string;
  appleMusicEmbedUrl?: string;
  spotifyTrackId?: string;
}

export interface TrackSummary {
  id: string;
  title: string;
  artist: string;
  playCount: string;
  coverUrl: string;
  feat?: string;
  spotifyTrackId?: string;
  spotifyEmbedUrl?: string;
  appleMusicEmbedUrl?: string;
}

export interface TrackComment {
  id: string;
  trackId?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string; // e.g. "0:14"
  timeAgo: string;
  createdAt?: number;
  likeCount: number;
  isLiked?: boolean;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  artistAvatar: string;
  featuringArtists: FeaturingArtist[];
  producer?: string;
  album: string;
  albumCover: string;
  duration: number; // in seconds (e.g. 24s hook)
  bpm: number;
  key: string;
  genres: string[];
  tags: string[];
  lyricsSnippet: { time: number; text: string; isFeatPart?: boolean; singer?: string }[];
  hookStartTime: number;
  hookEndTime: number;
  releaseDate: string;
  mood: string;
  recommendationReason?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  saveCount: number;
  // Real platform embeds & links
  spotifyTrackId: string;
  spotifyEmbedUrl: string;
  spotifyTrackUrl: string;
  appleMusicEmbedUrl: string;
  appleMusicTrackUrl: string;
  visualTheme: {
    bgGradient: string;
    accentColor: string;
    particleColor: string;
    moodEmoji: string;
    waveformColor: string;
  };
  comments: TrackComment[];
  audioSynthType: 'hyperpop' | 'trap_808' | 'kpop_dance' | 'lofi_chill' | 'indie_band' | 'rnb_smooth' | 'synthwave';
}

export interface UserInteraction {
  trackId: string;
  watchDurationSec: number;
  completedRate: number; // 0.0 ~ 1.0+ (can be > 1 if looped)
  loopCount: number;
  liked: boolean;
  saved: boolean;
  shared: boolean;
  skippedEarly: boolean; // skipped within 3 seconds
  featArtistClicked: boolean;
  timestamp: number;
  genreAffinities: string[];
}

export interface UserProfile {
  id: string;
  nickname: string;
  handle: string;
  avatar: string;
  bio: string;
  ageBadge: string;
  favoriteGenres: { genre: string; score: number }[];
  likedTrackIds: string[];
  savedTrackIds: string[];
  viewHistory: UserInteraction[];
  followedArtistIds: string[];
  totalListenTimeSec: number;
}
