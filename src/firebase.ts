// Firebase config - kept for potential future use
const firebaseConfig = {
  apiKey: 'AIzaSyDzQN9xDrOxJynVWuy3pe03qr9-k8Xplvk',
  authDomain: 'qnc-app.firebaseapp.com',
  projectId: 'qnc-app',
  storageBucket: 'qnc-app.firebasestorage.app',
  messagingSenderId: '282993548004',
  appId: '1:282993548004:web:9ee2e3960961689b932af1',
  measurementId: 'G-CKLWXQXMT8',
};

import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Enable offline persistence so the app works when offline
try {
  enableIndexedDbPersistence(db);
} catch (err: any) {
  if (err.code !== 'failed-precondition' && err.code !== 'unimplemented') {
    console.error('Failed to enable persistence:', err);
  }
}
