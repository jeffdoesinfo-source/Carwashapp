import type { AppData, User, LocationItem, InventoryItem, ScheduleItem, CancelRequest, FraudCheck, HistoryEntry, NotificationItem } from '../types';
import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  writeBatch,
  deleteDoc,
  setDoc,
  query,
  where,
  DocumentData,
  QuerySnapshot,
  Unsubscribe,
} from 'firebase/firestore';

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

const COLLECTION_USERS = 'users';
const COLLECTION_LOCATIONS = 'locations';
const COLLECTION_INVENTORY = 'inventory';
const COLLECTION_SCHEDULES = 'schedules';
const COLLECTION_CANCEL_REQUESTS = 'cancel_requests';
const COLLECTION_FRAUD_CHECKS = 'fraud_checks';

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

function snapshotToArray<T>(snapshot: QuerySnapshot<DocumentData>): T[] {
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as object) } as T));
}

// Load a collection optionally filtered by locationId. For non-admin callers
// the app MUST pass the caller's `locationId`. If neither `locationId` nor
// `allowAll` is provided, the function will return null to avoid unfiltered reads.
async function loadCollectionFromFirebase<T>(collectionName: string, locationId?: string, allowAll = false): Promise<T[] | null> {
  if (typeof window === 'undefined') return null;
  try {
    let snapshot;
    if (!allowAll && !locationId) {
      console.warn(`Refusing to load ${collectionName} without locationId or allowAll=true (prevents unfiltered reads).`);
      return null;
    }

    if (locationId && !allowAll) {
      const q = query(collection(db, collectionName), where('locationId', '==', locationId));
      snapshot = await getDocs(q);
    } else {
      const collectionRef = collection(db, collectionName);
      snapshot = await getDocs(collectionRef);
    }
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as object) } as T));
  } catch (err) {
    console.error(`Failed to load ${collectionName} from Firebase:`, err);
    return null;
  }
}

async function syncCollectionToFirebase<T extends { id: string }>(collectionName: string, items: T[]): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!Array.isArray(items)) return;
  if (items.length === 0) {
    console.warn(`Skipping ${collectionName} sync because payload is empty; this prevents accidental collection wipes.`);
    return;
  }
  // Disabled: bulk syncing an entire collection from client-side is unsafe
  // (can delete documents and bypass RBAC). Use per-document writes
  // (`setDoc`, `updateDoc`, `deleteDoc`) or implement a server-side sync
  // Cloud Function that runs with Admin privileges.
  throw new Error('syncCollectionToFirebase is disabled on the client. Use per-document writes or a server-side Admin sync.');
}

// Sync users to Firestore
export async function syncUsersToFirebase(users: User[]) {
  // Disabled: bulk user sync from client is unsafe. Use server-side Admin functions
  // to create/delete users and per-document writes for updates.
  throw new Error('syncUsersToFirebase is disabled on the client. Use per-document writes or a server-side admin sync.');
}

// Listen for users updates from Firestore
// Users updates: ADMIN-only real-time subscription. Non-admin clients must not
// call this. Provide `allowAll=true` only when caller verified admin client-side.
export function listenToUsersUpdates(allowAll = false) {
  if (typeof window === 'undefined') return;
  if (!allowAll) {
    console.warn('listenToUsersUpdates requires allowAll=true for admin subscriptions; skipping listener.');
    return;
  }
  try {
    unsubscribeUsers = onSnapshot(collection(db, COLLECTION_USERS), async (snapshot) => {
      const users = snapshotToArray<User>(snapshot);
      saveLocalUsers(users);
      await saveLocalUsersAsync(users);
      if (usersUpdateCallback) usersUpdateCallback(users);
    });
  } catch (err) {
    console.error('Failed to listen to users updates:', err);
  }
}

export async function loadUsersFromFirebase(allowAll = false): Promise<User[] | null> {
  return loadCollectionFromFirebase<User>(COLLECTION_USERS, undefined, allowAll);
}

export async function loadLocationsFromFirebase(): Promise<LocationItem[] | null> {
  return loadCollectionFromFirebase<LocationItem>(COLLECTION_LOCATIONS, undefined, true);
}

export async function loadInventoryFromFirebase(locationId?: string, allowAll = false): Promise<InventoryItem[] | null> {
  return loadCollectionFromFirebase<InventoryItem>(COLLECTION_INVENTORY, locationId, allowAll);
}

export async function loadSchedulesFromFirebase(locationId?: string, allowAll = false): Promise<ScheduleItem[] | null> {
  return loadCollectionFromFirebase<ScheduleItem>(COLLECTION_SCHEDULES, locationId, allowAll);
}

export async function loadCancelRequestsFromFirebase(locationId?: string, allowAll = false): Promise<CancelRequest[] | null> {
  return loadCollectionFromFirebase<CancelRequest>(COLLECTION_CANCEL_REQUESTS, locationId, allowAll);
}

export async function loadFraudChecksFromFirebase(): Promise<FraudCheck[] | null> {
  // Fraud checks are global/shared
  return loadCollectionFromFirebase<FraudCheck>(COLLECTION_FRAUD_CHECKS, undefined, true);
}

// Sync inventory to Firestore
export async function syncInventoryToFirebase(inventory: InventoryItem[]) {
  // Disabled: bulk inventory sync from client is unsafe.
  throw new Error('syncInventoryToFirebase is disabled on the client. Use per-document writes (setDoc/updateDoc/deleteDoc).');
}

// Listen for inventory updates from Firestore
// Listen for inventory updates. Non-admin callers MUST provide `locationId`.
// Admins may pass `allowAll=true` to receive all inventory.
export function listenToInventoryUpdates(locationId?: string, callback?: (inventory: InventoryItem[]) => void, allowAll = false) {
  if (typeof window === 'undefined') return () => {};
  if (!allowAll && !locationId) {
    console.warn('listenToInventoryUpdates requires locationId for non-admin callers; skipping listener.');
    return () => {};
  }

  try {
    const ref = allowAll ? collection(db, COLLECTION_INVENTORY) : query(collection(db, COLLECTION_INVENTORY), where('locationId', '==', locationId));
    unsubscribeInventory = onSnapshot(ref, (snapshot) => {
      const inventory = snapshotToArray<InventoryItem>(snapshot);
      saveInventory(inventory);
      if (callback) callback(inventory);
    });

    return unsubscribeInventory;
  } catch (err) {
    console.error('Failed to listen to inventory updates:', err);
    return () => {};
  }
}

// Sync schedules to Firestore
export async function syncSchedulesToFirebase(schedules: ScheduleItem[]) {
  // Disabled: bulk schedules sync from client is unsafe.
  throw new Error('syncSchedulesToFirebase is disabled on the client. Use per-document writes (setDoc/updateDoc/deleteDoc).');
}

// Listen for schedules updates from Firestore
export function listenToSchedulesUpdates(locationId?: string, allowAll = false) {
  if (typeof window === 'undefined') return;
  if (!allowAll && !locationId) {
    console.warn('listenToSchedulesUpdates requires locationId for non-admin callers; skipping listener.');
    return;
  }
  try {
    const ref = allowAll ? collection(db, COLLECTION_SCHEDULES) : query(collection(db, COLLECTION_SCHEDULES), where('locationId', '==', locationId));
    unsubscribeSchedules = onSnapshot(ref, (snapshot) => {
      const schedules = snapshotToArray<ScheduleItem>(snapshot);
      saveSchedules(schedules);
      if (schedulesUpdateCallback) schedulesUpdateCallback(schedules);
    });
  } catch (err) {
    console.error('Failed to listen to schedules updates:', err);
  }
}

// Sync cancel requests to Firestore
export async function syncCancelRequestsToFirebase(requests: CancelRequest[]) {
  // Disabled: bulk cancel_requests sync from client is unsafe.
  throw new Error('syncCancelRequestsToFirebase is disabled on the client. Use per-document writes (setDoc/updateDoc/deleteDoc).');
}

// Listen for cancel requests updates from Firestore
export function listenToCancelRequestsUpdates(locationId?: string, allowAll = false) {
  if (typeof window === 'undefined') return;
  if (!allowAll && !locationId) {
    console.warn('listenToCancelRequestsUpdates requires locationId for non-admin callers; skipping listener.');
    return;
  }
  try {
    const ref = allowAll ? collection(db, COLLECTION_CANCEL_REQUESTS) : query(collection(db, COLLECTION_CANCEL_REQUESTS), where('locationId', '==', locationId));
    unsubscribeCancelRequests = onSnapshot(ref, (snapshot) => {
      const requests = snapshotToArray<CancelRequest>(snapshot);
      saveCancelRequests(requests);
      if (cancelRequestsUpdateCallback) cancelRequestsUpdateCallback(requests);
    });
  } catch (err) {
    console.error('Failed to listen to cancel requests updates:', err);
  }
}

// Sync fraud checks to Firestore
export async function syncFraudChecksToFirebase(checks: FraudCheck[]) {
  // Disabled: bulk fraud checks sync from client is unsafe. Use per-document writes.
  throw new Error('syncFraudChecksToFirebase is disabled on the client. Use per-document writes (setDoc/updateDoc/deleteDoc).');
}

// Listen for fraud checks updates from Firestore
export function listenToFraudChecksUpdates() {
  if (typeof window === 'undefined') return;
  try {
    unsubscribeFraudChecks = onSnapshot(collection(db, COLLECTION_FRAUD_CHECKS), (snapshot) => {
      const checks = snapshotToArray<FraudCheck>(snapshot);
      saveFraudChecks(checks);
      if (fraudChecksUpdateCallback) fraudChecksUpdateCallback(checks);
    });
  } catch (err) {
    console.error('Failed to listen to fraud checks updates:', err);
  }
}

// Sync locations to Firestore
export async function syncLocationsToFirebase(locations: LocationItem[]) {
  // Disabled: bulk locations sync from client is unsafe. Use per-document writes.
  throw new Error('syncLocationsToFirebase is disabled on the client. Use per-document writes (setDoc/updateDoc/deleteDoc).');
}

// Listen for locations updates from Firestore
export function listenToLocationsUpdates() {
  if (typeof window === 'undefined') return;
  try {
    unsubscribeLocations = onSnapshot(collection(db, COLLECTION_LOCATIONS), (snapshot) => {
      const locations = snapshotToArray<LocationItem>(snapshot);
      saveLocations(locations);
      if (locationsUpdateCallback) locationsUpdateCallback(locations);
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
