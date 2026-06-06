import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  enableIndexedDbPersistence 
} from 'firebase/firestore';
import { 
  getAuth,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDzQN9xDrOxJynVWuy3pe03qr9-k8Xplvk',
  authDomain: 'qnc-app.firebaseapp.com',
  projectId: 'qnc-app',
  storageBucket: 'qnc-app.firebasestorage.app',
  messagingSenderId: '282993548004',
  appId: '1:282993548004:web:9ee2e3960961689b932af1',
  measurementId: 'G-CKLWXQXMT8',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// Keep users signed in across refreshes/devices
setPersistence(auth, browserLocalPersistence);

try {
  enableIndexedDbPersistence(db);
} catch (err: any) {
  if (
    err.code !== 'failed-precondition' &&
    err.code !== 'unimplemented'
  ) {
    console.error('Failed to enable persistence:', err);
  }
}