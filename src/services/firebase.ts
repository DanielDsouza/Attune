import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { UserPreferences, EmotionalState, CheckInRecord } from '../types';

export interface FirebaseUserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  preferences?: UserPreferences;
  currentState?: EmotionalState;
  streakDays?: number;
  lastCheckInDate?: string;
  updatedAt?: number;
  createdAt?: number;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

// Initialize Firebase App singleton
const firebaseApp = !getApps().length
  ? initializeApp(firebaseConfigData)
  : getApp();

// Initialize Auth
export const auth = getAuth(firebaseApp);

// Initialize Firestore with specific database ID if configured
export const db = (firebaseConfigData as { firestoreDatabaseId?: string }).firestoreDatabaseId
  ? getFirestore(
      firebaseApp,
      (firebaseConfigData as { firestoreDatabaseId?: string }).firestoreDatabaseId
    )
  : getFirestore(firebaseApp);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Cache OAuth access token in-memory and sessionStorage for Google Workspace API calls (e.g. Google Calendar)
let cachedAccessToken: string | null =
  (typeof window !== 'undefined' && sessionStorage.getItem('g_calendar_token')) || null;

export function getGoogleAccessToken(): string | null {
  return (
    cachedAccessToken ||
    (typeof window !== 'undefined' ? sessionStorage.getItem('g_calendar_token') : null)
  );
}

export function setGoogleAccessToken(token: string | null) {
  cachedAccessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('g_calendar_token', token);
    } else {
      sessionStorage.removeItem('g_calendar_token');
    }
  }
}

function handleFirestoreError(
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
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Google Sign-In with popup
export async function loginWithGoogle(): Promise<{ user: FirebaseUser; accessToken: string | null }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || null;
    setGoogleAccessToken(token);
    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

// Sign out
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
    setGoogleAccessToken(null);
  } catch (error) {
    console.error('Sign-Out Error:', error);
    throw error;
  }
}

// Listen to auth state changes
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Synchronize User Document
export async function syncUserProfile(
  user: FirebaseUser,
  partialData: {
    preferences?: UserPreferences;
    currentState?: EmotionalState;
    streakDays?: number;
    lastCheckInDate?: string;
  }
): Promise<void> {
  if (!user.uid) return;
  const userDocRef = doc(db, 'users', user.uid);
  const now = Date.now();

  try {
    const existingSnap = await getDoc(userDocRef);
    const existingData = existingSnap.exists() ? existingSnap.data() : {};

    const payload: FirebaseUserProfile = {
      uid: user.uid,
      displayName: user.displayName || 'Friend',
      email: user.email || '',
      photoURL: user.photoURL || '',
      preferences: partialData.preferences ?? (existingData.preferences as UserPreferences),
      currentState: partialData.currentState ?? (existingData.currentState as EmotionalState),
      streakDays: partialData.streakDays ?? (existingData.streakDays as number) ?? 1,
      lastCheckInDate:
        partialData.lastCheckInDate ??
        (existingData.lastCheckInDate as string) ??
        new Date().toISOString().split('T')[0],
      updatedAt: now,
      createdAt: (existingData.createdAt as number) || now,
    };

    await setDoc(userDocRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

// Load full user data from Firestore
export async function loadUserDataFromFirestore(userId: string): Promise<{
  profile: FirebaseUserProfile | null;
  checkIns: CheckInRecord[];
}> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);

    let profile: FirebaseUserProfile | null = null;
    if (userSnap.exists()) {
      profile = userSnap.data() as FirebaseUserProfile;
    }

    // Load checkIns subcollection
    const checkInsCol = collection(db, 'users', userId, 'checkIns');
    const q = query(checkInsCol, orderBy('timestamp', 'desc'));
    const checkInsSnap = await getDocs(q);

    const checkIns: CheckInRecord[] = [];
    checkInsSnap.forEach((docItem) => {
      checkIns.push(docItem.data() as CheckInRecord);
    });

    return { profile, checkIns };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
  }
}

// Save an individual check-in record
export async function saveCheckInToFirestore(
  userId: string,
  record: CheckInRecord
): Promise<void> {
  const docPath = `users/${userId}/checkIns/${record.id}`;
  try {
    const checkInDocRef = doc(db, 'users', userId, 'checkIns', record.id);
    const dataToSave = {
      ...record,
      userId,
    };
    await setDoc(checkInDocRef, dataToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Clear or delete user checkins from Firestore
export async function clearUserCheckInsInFirestore(userId: string): Promise<void> {
  try {
    const checkInsCol = collection(db, 'users', userId, 'checkIns');
    const checkInsSnap = await getDocs(checkInsCol);
    const deletePromises = checkInsSnap.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/checkIns`);
  }
}
