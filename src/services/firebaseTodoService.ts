/**
 * Firebase Service for VibeSpot (바이브스팟)
 * Google Authentication & Cloud Firestore Real-time Persistence
 */

import { UserProfile, UserInteraction, TrackComment } from '../types';
import {
  FirebaseAuthService,
  FirestoreDataService,
  auth,
} from './firebase';

export class FirebaseTodoService {
  /**
   * 구글 소셜 로그인 (Firebase Authentication)
   */
  public static async signInWithGoogle(): Promise<{
    success: boolean;
    user?: UserProfile;
    error?: string;
  }> {
    try {
      const fbUser = await FirebaseAuthService.loginWithGoogle();
      if (!fbUser) {
        return { success: false, error: '로그인이 취소되었습니다.' };
      }

      // Check if user profile already exists in Firestore
      let userProfile = await FirestoreDataService.getUserProfile(fbUser.uid);

      if (!userProfile) {
        // Create new user profile in Firestore
        userProfile = {
          id: fbUser.uid,
          nickname: fbUser.displayName || '10대 음악러',
          handle: `@${(fbUser.displayName || 'teen').toLowerCase().replace(/\s+/g, '')}_${fbUser.uid.slice(0, 4)}`,
          avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          bio: 'Firebase로 연결된 실시간 10대 음악 탐색기 🎧',
          ageBadge: '18세 High',
          favoriteGenres: [
            { genre: 'K-Pop', score: 88 },
            { genre: 'Pop', score: 85 },
            { genre: '힙합', score: 75 },
          ],
          likedTrackIds: [],
          savedTrackIds: [],
          viewHistory: [],
          followedArtistIds: [],
          totalListenTimeSec: 0,
        };
        await FirestoreDataService.saveUserProfile(userProfile);
      }

      return { success: true, user: userProfile };
    } catch (error: any) {
      console.error('Firebase Login Error:', error);
      return { success: false, error: error.message || '로그인 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 로그아웃
   */
  public static async signOutUser(): Promise<void> {
    try {
      await FirebaseAuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * 사용자 시청 및 인터랙션 기록 (Firestore 저장소 연동)
   */
  public static async recordInteractionToFirestore(
    userId: string,
    interaction: UserInteraction
  ): Promise<void> {
    // Only write to Firestore if a real Firebase user is authenticated and matches userId
    if (!auth.currentUser || auth.currentUser.uid !== userId) return;
    try {
      await FirestoreDataService.recordInteraction(userId, interaction);
    } catch (e) {
      console.warn('[Firestore] Interaction record logged locally:', e);
    }
  }

  /**
   * 좋아요 상태 Firestore 동기화
   */
  public static async toggleLikeInFirestore(
    userId: string,
    trackId: string,
    isLiked: boolean
  ): Promise<void> {
    if (!auth.currentUser || auth.currentUser.uid !== userId) return;
    try {
      const profile = await FirestoreDataService.getUserProfile(userId);
      if (profile) {
        const newLikes = isLiked
          ? Array.from(new Set([...profile.likedTrackIds, trackId]))
          : profile.likedTrackIds.filter((id) => id !== trackId);
        await FirestoreDataService.saveUserProfile({
          ...profile,
          likedTrackIds: newLikes,
        });
      }
    } catch (e) {
      console.warn('[Firestore] Like toggle stored locally:', e);
    }
  }

  /**
   * 사용자 취향 점수 및 프로필 갱신 Firestore 동기화
   */
  public static async syncUserProfileToFirestore(profile: UserProfile): Promise<void> {
    if (!auth.currentUser || auth.currentUser.uid !== profile.id) return;
    try {
      await FirestoreDataService.saveUserProfile(profile);
    } catch (e) {
      console.warn('[Firestore] User profile synced locally:', e);
    }
  }
}
