import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  deleteDoc,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, UserInteraction, TrackComment } from '../types';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: The app will break without specifying databaseId if configured
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Operation Types for error logging
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on boot
export async function testConnection(): Promise<boolean> {
  const path = 'test/connection';
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase: client is offline or network is unreachable.');
    } else {
      console.log('Firebase test connection ping completed.');
    }
    return false;
  }
}

// Test connection on module load
testConnection().catch(() => {});

// Authentication Services
export class FirebaseAuthService {
  public static async loginWithGoogle(): Promise<FirebaseUser | null> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google Sign In Error:', error);
      throw error;
    }
  }

  public static async logout(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign Out Error:', error);
      throw error;
    }
  }

  public static onAuthChange(callback: (user: FirebaseUser | null) => void): Unsubscribe {
    return onAuthStateChanged(auth, callback);
  }
}

// Firestore Database Services
export class FirestoreDataService {
  /**
   * Fetch User Profile from Firestore
   */
  public static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const path = `users/${userId}`;
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  }

  /**
   * Save or Update User Profile in Firestore
   */
  public static async saveUserProfile(profile: UserProfile): Promise<void> {
    const path = `users/${profile.id}`;
    try {
      const cleanData: Record<string, any> = {
        id: profile.id,
        nickname: profile.nickname || '음악 러버',
        handle: profile.handle || '@music_vibe',
        avatar: profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        bio: profile.bio || '10대 음악 취향 탐색 중 🎧',
        ageBadge: profile.ageBadge || '18세 High',
        favoriteGenres: profile.favoriteGenres || [],
        likedTrackIds: profile.likedTrackIds || [],
        savedTrackIds: profile.savedTrackIds || [],
        followedArtistIds: profile.followedArtistIds || [],
        totalListenTimeSec: profile.totalListenTimeSec || 0,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', profile.id), cleanData, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Record User Interaction (Telemetry)
   */
  public static async recordInteraction(
    userId: string,
    interaction: UserInteraction
  ): Promise<void> {
    const path = `users/${userId}/interactions/${interaction.trackId}_${interaction.timestamp}`;
    try {
      const interactionDoc = doc(
        db,
        'users',
        userId,
        'interactions',
        `${interaction.trackId}_${interaction.timestamp}`
      );
      await setDoc(interactionDoc, {
        ...interaction,
        userId,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Real-time listener for comments on a track
   */
  public static subscribeTrackComments(
    trackId: string,
    onUpdate: (comments: TrackComment[]) => void
  ): Unsubscribe {
    const path = `tracks/${trackId}/comments`;
    const commentsQuery = query(
      collection(db, 'tracks', trackId, 'comments'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(
      commentsQuery,
      (snapshot) => {
        const comments: TrackComment[] = [];
        snapshot.forEach((docSnap) => {
          comments.push(docSnap.data() as TrackComment);
        });
        onUpdate(comments);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  }

  /**
   * Add a new comment to a track
   */
  public static async addTrackComment(
    trackId: string,
    comment: TrackComment
  ): Promise<void> {
    const path = `tracks/${trackId}/comments/${comment.id}`;
    try {
      await setDoc(doc(db, 'tracks', trackId, 'comments', comment.id), {
        id: comment.id,
        trackId,
        userId: comment.userId,
        userName: comment.userName,
        userAvatar: comment.userAvatar,
        content: comment.content,
        timestamp: comment.timestamp,
        createdAt: Date.now(),
        likeCount: comment.likeCount || 0,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Delete a comment
   */
  public static async deleteTrackComment(trackId: string, commentId: string): Promise<void> {
    const path = `tracks/${trackId}/comments/${commentId}`;
    try {
      await deleteDoc(doc(db, 'tracks', trackId, 'comments', commentId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}
