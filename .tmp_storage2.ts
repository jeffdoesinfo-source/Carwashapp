import type { AppData, User, LocationItem, InventoryItem, ScheduleItem, CancelRequest, FraudCheck, HistoryEntry, NotificationItem } from '../types';

const STORAGE_KEY = 'carwashStaffManagementData';
const USER_KEY = 'carwashStaffManagementUsers';

export function loadAppData(): AppData | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppData) : null;
  } catch {
    return null;
  }
}

export function saveAppData(data: AppData) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadLocalUsers(): User[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalUsers(users: User[]) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(USER_KEY, JSON.stringify(users));
}

// Async/native-aware storage helpers for users (uses Capacitor Plugins.Storage if available)
export async function loadLocalUsersAsync(): Promise<User[]> {
  if (typeof window === 'undefined') return [];
  try {
    const cap = (window as any).Capacitor as any;
    const plugins = cap && (cap.Plugins || (window as any).CapacitorPlugins);
    const storage = plugins?.Storage || (window as any).CapacitorStorage || null;
    if (storage && typeof storage.get === 'function') {
      const res = await storage.get({ key: USER_KEY });
      return res?.value ? (JSON.parse(res.value) as User[]) : [];
    }
  } catch (e) {
    // fall through to localStorage
  }

  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User[]) : [];
  } catch {
    return [];
  }
}

export async function saveLocalUsersAsync(users: User[]) {
  if (typeof window === 'undefined') return;
  let savedToPlugin = false;
  try {
    const cap = (window as any).Capacitor as any;
    const plugins = cap && (cap.Plugins || (window as any).CapacitorPlugins);
    const storage = plugins?.Storage || (window as any).CapacitorStorage || null;
    if (storage && typeof storage.set === 'function') {
      await storage.set({ key: USER_KEY, value: JSON.stringify(users) });
      savedToPlugin = true;
    }
  } catch {
    // fall back to localStorage below
  }

  try {
    window.localStorage.setItem(USER_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }

  if (!savedToPlugin) {
    try {
      const cap = (window as any).Capacitor as any;
      const plugins = cap && (cap.Plugins || (window as any).CapacitorPlugins);
      const storage = plugins?.Storage || (window as any).CapacitorStorage || null;
      if (storage && typeof storage.set === 'function') {
        await storage.set({ key: USER_KEY, value: JSON.stringify(users) });
      }
    } catch {
      // ignore
    }
  }
}

// Local storage functions for all app data
const LOCATIONS_KEY = 'carwashLocations';
const INVENTORY_KEY = 'carwashInventory';
const SCHEDULES_KEY = 'carwashSchedules';
const CANCEL_REQUESTS_KEY = 'carwashCancelRequests';
const FRAUD_CHECKS_KEY = 'carwashFraudChecks';
const HISTORY_KEY = 'carwashHistory';
const NOTIFICATIONS_KEY = 'carwashNotifications';

export function loadLocations(): LocationItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCATIONS_KEY);
    return raw ? (JSON.parse(raw) as LocationItem[]) : [];
  } catch {
    return [];
  }
}

export function saveLocations(locations: LocationItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
}

export function loadInventory(): InventoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(INVENTORY_KEY);
    return raw ? (JSON.parse(raw) as InventoryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveInventory(inventory: InventoryItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
}

export function loadSchedules(): ScheduleItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SCHEDULES_KEY);
    return raw ? (JSON.parse(raw) as ScheduleItem[]) : [];
  } catch {
    return [];
  }
}

export function saveSchedules(schedules: ScheduleItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
}

export function loadCancelRequests(): CancelRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CANCEL_REQUESTS_KEY);
    return raw ? (JSON.parse(raw) as CancelRequest[]) : [];
  } catch {
    return [];
  }
}

export function saveCancelRequests(cancelRequests: CancelRequest[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CANCEL_REQUESTS_KEY, JSON.stringify(cancelRequests));
}

export function loadFraudChecks(): FraudCheck[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(FRAUD_CHECKS_KEY);
    return raw ? (JSON.parse(raw) as FraudCheck[]) : [];
  } catch {
    return [];
  }
}

export function saveFraudChecks(fraudChecks: FraudCheck[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(FRAUD_CHECKS_KEY, JSON.stringify(fraudChecks));
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: HistoryEntry[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function loadNotifications(): NotificationItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_KEY);
    return raw ? (JSON.parse(raw) as NotificationItem[]) : [];
  } catch {
    return [];
  }
}

export function saveNotifications(notifications: NotificationItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

// Firestore sync functions
import { db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';

let unsubscribeUsers: Unsubscribe | null = null;
let unsubscribeInventory: Unsubscribe | null = null;
let unsubscribeSchedules: Unsubscribe | null = null;
let unsubscribeCancelRequests: Unsubscribe | null = null;
let unsubscribeFraudChecks: Unsubscribe | null = null;
let unsubscribeLocations: Unsubscribe | null = null;

// Callback setters for real-time updates
let usersUpdateCallback: ((users: User[]) => void) | null = null;
let inventoryUpdateCallback: ((inventory: InventoryItem[]) => void) | null = null;
let schedulesUpdateCallback: ((schedules: ScheduleItem[]) => void) | null = null;
let cancelRequestsUpdateCallback: ((requests: CancelRequest[]) => void) | null = null;
let fraudChecksUpdateCallback: ((checks: FraudCheck[]) => void) | null = null;
let locationsUpdateCallback: ((locations: LocationItem[]) => void) | null = null;

export function setUsersUpdateCallback(callback: (users: User[]) => void) {
  usersUpdateCallback = callback;
}

export function setInventoryUpdateCallback(callback: (inventory: InventoryItem[]) => void) {
  inventoryUpdateCallback = callback;
}

export function setSchedulesUpdateCallback(callback: (schedules: ScheduleItem[]) => void) {
  schedulesUpdateCallback = callback;
}

export function setCancelRequestsUpdateCallback(callback: (requests: CancelRequest[]) => void) {
  cancelRequestsUpdateCallback = callback;
}

export function setFraudChecksUpdateCallback(callback: (checks: FraudCheck[]) => void) {
  fraudChecksUpdateCallback = callback;
}

export function setLocationsUpdateCallback(callback: (locations: LocationItem[]) => void) {
  locationsUpdateCallback = callback;
}

// Sync users to Firestore
export async function syncUsersToFirebase(users: User[]) {
  if (typeof window === 'undefined') return;
  try {
    const usersRef = doc(db, 'app', 'users_data');
    await setDoc(usersRef, { data: users, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error('Failed to sync users to Firebase:', err);
  }
}

// Listen for users updates from Firestore
export function listenToUsersUpdates() {
  if (typeof window === 'undefined') return;
  try {
    unsubscribeUsers = onSnapshot(doc(db, 'app', 'users_data'), async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const users = data?.data || [];
        saveLocalUsers(users);
        await saveLocalUsersAsync(users);
        if (usersUpdateCallback) usersUpdateCallback(users);
      }
    });
  } catch (err) {
    console.error('Failed to listen to users updates:', err);
  }
}

async function loadFirestoreData<T>(docId: string): Promise<T[] | null> {
  if (typeof window === 'undefined') return null;
  try {
    const snapshot = await getDoc(doc(db, 'app', docId));
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    return data?.data || null;
  } catch (err) {
    console.error(`Failed to load ${docId} from Firebase:`, err);
    return null;
  }
}

export async function loadUsersFromFirebase(): Promise<User[] | null> {
  return loadFirestoreData<User>('users_data');
}

export async function loadLocationsFromFirebase(): Promise<LocationItem[] | null> {
  return loadFirestoreData<LocationItem>('locations_data');
}

export async function loadInventoryFromFirebase(): Promise<InventoryItem[] | null> {
  return loadFirestoreData<InventoryItem>('inventory_data');
}

export async function loadSchedulesFromFirebase(): Promise<ScheduleItem[] | null> {
  return loadFirestoreData<ScheduleItem>('schedules_data');
}

export async function loadCancelRequestsFromFirebase(): Promise<CancelRequest[] | null> {
  return loadFirestoreData<CancelRequest>('cancel_requests_data');
}

export async function loadFraudChecksFromFirebase(): Promise<FraudCheck[] | null> {
  return loadFirestoreData<FraudCheck>('fraud_checks_data');
}

// Sync inventory to Firestore
export async function syncInventoryToFirebase(inventory: InventoryItem[]) {
  if (typeof window === 'undefined') return;

  try {
    console.log('SYNCING TO FIREBASE', inventory);

    const invRef = doc(db, 'app', 'inventory_data');

    await setDoc(invRef, {
      data: inventory,
      lastUpdated: new Date().toISOString(),
    });

    console.log('FIREBASE SYNC SUCCESS');
  } catch (err) {
    console.error('Failed to sync inventory to Firebase:', err);
  }
}

// Listen for inventory updates from Firestore
export function listenToInventoryUpdates(callback) {
  if (typeof window === 'undefined') return () => {};

  try {
    unsubscribeInventory = onSnapshot(
      doc(db, 'app', 'inventory_data'),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const inventory = data?.data || [];

          saveInventory(inventory);

          if (callback) {
            callback(inventory);
          }
        }
      }
    );

    return unsubscribeInventory;
  } catch (err) {
    console.error('Failed to listen to inventory updates:', err);
    return () => {};
  }
}

// Sync schedules to Firestore
export async function syncSchedulesToFirebase(schedules: ScheduleItem[]) {
  if (typeof window === 'undefined') return;
  try {
    const schedRef = doc(db, 'app', 'schedules_data');
    await setDoc(schedRef, { data: schedules, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error('Failed to sync schedules to Firebase:', err);
  }
}

// Listen for schedules updates from Firestore
export function listenToSchedulesUpdates() {
  if (typeof window === 'undefined') return;
  try {
    unsubscribeSchedules = onSnapshot(doc(db, 'app', 'schedules_data'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const schedules = data?.data || [];
        saveSchedules(schedules);
        if (schedulesUpdateCallback) schedulesUpdateCallback(schedules);
      }
    });
  } catch (err) {
    console.error('Failed to listen to schedules updates:', err);
  }
}

// Sync cancel requests to Firestore
export async function syncCancelRequestsToFirebase(requests: CancelRequest[]) {
  if (typeof window === 'undefined') return;
  try {
    const reqRef = doc(db, 'app', 'cancel_requests_data');
    await setDoc(reqRef, { data: requests, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error('Failed to sync cancel requests to Firebase:', err);
  }
}

// Listen for cancel requests updates from Firestore
export function listenToCancelRequestsUpdates() {
  if (typeof window === 'undefined') return;
  try {
    unsubscribeCancelRequests = onSnapshot(doc(db, 'app', 'cancel_requests_data'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const requests = data?.data || [];
        saveCancelRequests(requests);
        if (cancelRequestsUpdateCallback) cancelRequestsUpdateCallback(requests);
      }
    });
  } catch (err) {
    console.error('Failed to listen to cancel requests updates:', err);
  }
}

// Sync fraud checks to Firestore
export async function syncFraudChecksToFirebase(checks: FraudCheck[]) {
  if (typeof window === 'undefined') return;
  try {
    const fraudRef = doc(db, 'app', 'fraud_checks_data');
    await setDoc(fraudRef, { data: checks, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error('Failed to sync fraud checks to Firebase:', err);
  }
}

// Listen for fraud checks updates from Firestore
export function listenToFraudChecksUpdates() {
  if (typeof window === 'undefined') return;
  try {
    unsubscribeFraudChecks = onSnapshot(doc(db, 'app', 'fraud_checks_data'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const checks = data?.data || [];
        saveFraudChecks(checks);
        if (fraudChecksUpdateCallback) fraudChecksUpdateCallback(checks);
      }
    });
  } catch (err) {
    console.error('Failed to listen to fraud checks updates:', err);
  }
}

// Sync locations to Firestore
export async function syncLocationsToFirebase(locations: LocationItem[]) {
  if (typeof window === 'undefined') return;
  try {
    const locRef = doc(db, 'app', 'locations_data');
    await setDoc(locRef, { data: locations, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error('Failed to sync locations to Firebase:', err);
  }
}

// Listen for locations updates from Firestore
export function listenToLocationsUpdates() {
  if (typeof window === 'undefined') return;
  try {
    unsubscribeLocations = onSnapshot(doc(db, 'app', 'locations_data'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const locations = data?.data || [];
        saveLocations(locations);
        if (locationsUpdateCallback) locationsUpdateCallback(locations);
      }
    });
  } catch (err) {
    console.error('Failed to listen to locations updates:', err);
  }
}

// Unsubscribe from all listeners (cleanup)
export function unsubscribeFromAllUpdates() {
  if (unsubscribeUsers) unsubscribeUsers();
  if (unsubscribeInventory) unsubscribeInventory();
  if (unsubscribeSchedules) unsubscribeSchedules();
  if (unsubscribeCancelRequests) unsubscribeCancelRequests();
  if (unsubscribeFraudChecks) unsubscribeFraudChecks();
  if (unsubscribeLocations) unsubscribeLocations();
}
