import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;

// Basic check to prevent crash and guide user
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
  console.error("Firebase API Key is missing or invalid. Please set VITE_FIREBASE_API_KEY in Secrets.");
}

const app = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined' 
  ? initializeApp(firebaseConfig) 
  : null;

export const auth = app ? getAuth(app) : null as any;
export const db = app ? getFirestore(app, firestoreDatabaseId) : null as any;
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  if (!auth || !db) {
    throw new Error("Firebase is not initialized. Please check your API keys in Secrets.");
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore, if not create
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      const isAdmin = user.email === 'karimovkamron349@gmail.com';
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        role: isAdmin ? 'admin' : 'user',
        dailyLimit: isAdmin ? 100 : 2,
        requestsToday: 0,
        lastRequestDate: new Date().toISOString().split('T')[0]
      });
    }
    return user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logout = () => signOut(auth);
