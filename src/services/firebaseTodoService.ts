/**
 * Firebase Integration Placeholder & Storage Service
 *
 * [제약 조건 준수]
 * 파이어베이스 로그인(Firebase Authentication)과
 * 파이어스토어(Cloud Firestore) 저장/동기화가 들어갈 위치를
 * 명확한 TODO 주석 및 규격화된 함수 형태로 제공합니다.
 */

import { UserProfile, UserInteraction } from '../types';

export class FirebaseTodoService {
  /**
   * =========================================================================
   * 1. FIREBASE AUTHENTICATION (로그인 / 회원가입) TODO 연동부
   * =========================================================================
   */

  // TODO: Firebase Authentication 초기화
  // import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
  // const auth = getAuth(firebaseApp);

  /**
   * 구글 소셜 로그인
   */
  public static async signInWithGoogle(): Promise<{ success: boolean; user?: Partial<UserProfile>; error?: string }> {
    // TODO: [Firebase Auth] GoogleAuthProvider를 통한 팝업 로그인 구현 자리
    /*
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;
        // Firestore에서 사용자 프로필 문서 조회 또는 기본 프로필 생성
        // await this.syncUserProfileToFirestore(firebaseUser.uid, ...);
        return { success: true, user: { id: firebaseUser.uid, nickname: firebaseUser.displayName || '10대 음악러' } };
      } catch (error: any) {
        console.error("Firebase Login Error:", error);
        return { success: false, error: error.message };
      }
    */
    console.log('[TODO: Firebase Auth] Google Login requested. (현재 로컬 목업 계정 모드로 작동)');
    return { success: true };
  }

  /**
   * 로그아웃
   */
  public static async signOutUser(): Promise<void> {
    // TODO: [Firebase Auth] signOut(auth) 호출 자리
    /*
      await signOut(auth);
    */
    console.log('[TODO: Firebase Auth] User signed out.');
  }

  /**
   * =========================================================================
   * 2. CLOUD FIRESTORE (시청기록, 좋아요, 취향 데이터 영구저장) TODO 연동부
   * =========================================================================
   */

  // TODO: Cloud Firestore 초기화
  // import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
  // const db = getFirestore(firebaseApp);

  /**
   * 사용자 시청 및 인터랙션 기록 (Firestore 저장소 연동)
   */
  public static async recordInteractionToFirestore(userId: string, interaction: UserInteraction): Promise<void> {
    // TODO: [Cloud Firestore] 컬렉션 경로: users/{userId}/watchHistory/{trackId}
    /*
      try {
        const historyRef = doc(db, 'users', userId, 'watchHistory', `${interaction.trackId}_${Date.now()}`);
        await setDoc(historyRef, {
          trackId: interaction.trackId,
          watchDurationSec: interaction.watchDurationSec,
          completedRate: interaction.completedRate,
          loopCount: interaction.loopCount,
          liked: interaction.liked,
          saved: interaction.saved,
          shared: interaction.shared,
          skippedEarly: interaction.skippedEarly,
          featArtistClicked: interaction.featArtistClicked,
          genreAffinities: interaction.genreAffinities,
          timestamp: serverTimestamp(),
        });
      } catch (e) {
        console.error("[Firestore Error] Failed to write watch history:", e);
      }
    */
    console.log(`[TODO: Firestore] Logged watch history for User: ${userId}, Track: ${interaction.trackId}, Duration: ${interaction.watchDurationSec}s`);
  }

  /**
   * 좋아요 / 저장 상태 Firestore 동기화
   */
  public static async toggleLikeInFirestore(userId: string, trackId: string, isLiked: boolean): Promise<void> {
    // TODO: [Cloud Firestore] 컬렉션 경로: users/{userId}/likedTracks/{trackId}
    /*
      try {
        const likeRef = doc(db, 'users', userId, 'likedTracks', trackId);
        if (isLiked) {
          await setDoc(likeRef, {
            trackId,
            likedAt: serverTimestamp(),
          });
        } else {
          await deleteDoc(likeRef);
        }
      } catch (e) {
        console.error("[Firestore Error] Failed to toggle like:", e);
      }
    */
    console.log(`[TODO: Firestore] Toggled like for track ${trackId} => ${isLiked} (User: ${userId})`);
  }

  /**
   * 사용자 취향 점수 및 프로필 갱신 Firestore 동기화
   */
  public static async syncUserProfileToFirestore(profile: UserProfile): Promise<void> {
    // TODO: [Cloud Firestore] 문서 경로: users/{profile.id}
    /*
      try {
        const userDocRef = doc(db, 'users', profile.id);
        await setDoc(userDocRef, {
          nickname: profile.nickname,
          handle: profile.handle,
          avatar: profile.avatar,
          bio: profile.bio,
          favoriteGenres: profile.favoriteGenres,
          likedTrackIds: profile.likedTrackIds,
          savedTrackIds: profile.savedTrackIds,
          followedArtistIds: profile.followedArtistIds,
          totalListenTimeSec: profile.totalListenTimeSec,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (e) {
        console.error("[Firestore Error] Failed to sync profile:", e);
      }
    */
    console.log(`[TODO: Firestore] Synced user profile for: ${profile.nickname} (${profile.handle})`);
  }
}
