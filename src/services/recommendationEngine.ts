import { Track, UserProfile, UserInteraction } from '../types';

export interface ScoredTrack {
  track: Track;
  score: number;
  reason: string;
  reasonTag: string;
}

export class RecommendationEngine {
  /**
   * Generates a ranked list of recommended tracks for the given user profile.
   */
  public static getRecommendedFeed(allTracks: Track[], user: UserProfile): ScoredTrack[] {
    const scoredList = allTracks.map((track) => {
      let score = 50; // base score
      let primaryReason = '🔥 지금 10대 사이에서 가장 핫한 트랙';
      let reasonTag = '트렌딩';

      // 1. Check history with this specific track
      const historyItem = user.viewHistory.find((h) => h.trackId === track.id);
      const isLiked = user.likedTrackIds.includes(track.id);
      const isSaved = user.savedTrackIds.includes(track.id);

      if (isLiked) {
        score += 45;
        primaryReason = '💖 내가 좋아요를 누른 맞춤 취향 트랙';
        reasonTag = '좋아요 기반';
      }

      if (isSaved) {
        score += 35;
        primaryReason = '💾 보관함에 저장된 인생곡';
        reasonTag = '보관함';
      }

      if (historyItem) {
        // High completion rate (looped)
        if (historyItem.completedRate >= 1.5 || historyItem.loopCount >= 2) {
          score += 30;
          primaryReason = `🔁 ${historyItem.loopCount || 2}회 이상 무한반복 청취한 취향 저격 비트`;
          reasonTag = '반복 청취';
        } else if (historyItem.completedRate >= 0.8) {
          score += 15;
        }

        // Early skip penalty
        if (historyItem.skippedEarly) {
          score -= 35;
        }
      }

      // 2. Genre Affinity Score
      let genreMatchBonus = 0;
      let matchedGenre = '';
      for (const g of track.genres) {
        const pref = user.favoriteGenres.find(
          (fg) => fg.genre.toLowerCase() === g.toLowerCase() || g.includes(fg.genre)
        );
        if (pref) {
          const bonus = (pref.score / 100) * 40;
          if (bonus > genreMatchBonus) {
            genreMatchBonus = bonus;
            matchedGenre = g;
          }
        }
      }
      score += genreMatchBonus;
      if (genreMatchBonus >= 25 && !isLiked) {
        primaryReason = `🎧 '${matchedGenre}' 장르 애호가를 위한 정밀 추천`;
        reasonTag = '장르 매칭';
      }

      // 3. Featuring Artist Affinity
      const hasFollowedFeat = track.featuringArtists.some((feat) =>
        user.followedArtistIds.includes(feat.id)
      );
      if (hasFollowedFeat) {
        const featName = track.featuringArtists[0]?.name || '아티스트';
        score += 55;
        primaryReason = `✨ 팔로우한 피쳐링 아티스트 '${featName}' 참여 음원`;
        reasonTag = '피쳐링 아티스트';
      } else {
        // Check if user has high watch rate on tracks featuring this artist
        for (const feat of track.featuringArtists) {
          const pastFeatWatch = user.viewHistory.some(
            (h) => h.featArtistClicked && allTracks.find((t) => t.id === h.trackId)?.featuringArtists.some((f) => f.id === feat.id)
          );
          if (pastFeatWatch) {
            score += 35;
            primaryReason = `🎤 관심있게 탐색한 피쳐링 '${feat.name}'의 킬링 파트`;
            reasonTag = '피쳐링 관심';
            break;
          }
        }
      }

      // 4. Teen popularity bonus (likes & saves)
      score += Math.min(20, (track.likeCount / 10000) * 3);

      return {
        track: {
          ...track,
          recommendationReason: primaryReason,
        },
        score: Math.round(score),
        reason: primaryReason,
        reasonTag,
      };
    });

    // Sort descending by score
    return scoredList.sort((a, b) => b.score - a.score);
  }

  /**
   * Recalculates user favorite genre scores after an interaction
   */
  public static updateUserGenreAffinity(
    user: UserProfile,
    track: Track,
    interaction: Partial<UserInteraction>
  ): UserProfile {
    const updated = { ...user };
    const genreDelta = (interaction.liked ? 15 : 0) +
      (interaction.saved ? 10 : 0) +
      (interaction.completedRate && interaction.completedRate > 1 ? 12 : 0) -
      (interaction.skippedEarly ? 8 : 0);

    const favGenres = [...user.favoriteGenres];

    track.genres.forEach((g) => {
      const idx = favGenres.findIndex((item) => item.genre === g);
      if (idx >= 0) {
        favGenres[idx] = {
          ...favGenres[idx],
          score: Math.max(5, Math.min(100, favGenres[idx].score + genreDelta)),
        };
      } else if (genreDelta > 0) {
        favGenres.push({ genre: g, score: Math.min(100, 50 + genreDelta) });
      }
    });

    updated.favoriteGenres = favGenres.sort((a, b) => b.score - a.score);
    return updated;
  }
}
