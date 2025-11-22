
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAO7QnM6at_UurRVq6cb_MoLaRKwL_1pfc",
  authDomain: "aicampaigngen.firebaseapp.com",
  projectId: "aicampaigngen",
  storageBucket: "aicampaigngen.firebasestorage.app",
  messagingSenderId: "879291712490",
  appId: "1:879291712490:web:8d8bd55caeb3b5be87a893",
  measurementId: "G-5S4BK3GZKJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with offline persistence enabled
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// We export storage, but services will handle fallback if it's not enabled on the project.
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
