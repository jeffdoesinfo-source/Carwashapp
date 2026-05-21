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
  getDocs,
  setDoc,
  onSnapshot,
  Unsubscribe,
  writeBatch,
  collection,
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
import { collection, writeBatch, doc } from "firebase/firestore";

import { writeBatch, doc } from "firebase/firestore";

export async function syncUsersToFirebase(users: User[]) {
  if (typeof window === "undefined") return;

  try {
    if (!Array.isArray(users) || users.length === 0) return;

    const batch = writeBatch(db);

    users.forEach((user) => {
      if (!user?.id) return;

      const ref = doc(db, "users", user.id);

      batch.set(
        ref,
        {
          id: user.id,
          username: user.username,
          role: user.role,
          locationId: user.locationId,
          permissions: user.permissions ?? [],
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );
    });

    await batch.commit();
  } catch (err) {
    console.error("Failed to sync users to Firebase:", err);
  }
}
if (!users?.length) return;
// Listen for users updates from Firestore
export async function syncToFirebase<T>(
  docName: string,
  data: T[]
) {
  if (typeof window === 'undefined') return;

  try {
    // ❌ block dangerous wipes
    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`Blocked empty sync for ${docName}`);
      return;
    }

    const ref = doc(db, 'app', docName);

    await setDoc(
      ref,
      {
        data,
        lastUpdated: new Date().toISOString(),
      },
      { merge: true } // 🔥 prevents full overwrite issues
    );

  } catch (err) {
    console.error(`Failed to sync ${docName} to Firebase:`, err);
  }
}

import { collection, getDocs } from "firebase/firestore";

async function loadFirestoreData<T>(collectionName: string): Promise<T[] | null> {
  if (typeof window === 'undefined') return null;

  try {
    const snapshot = await getDocs(collection(db, collectionName));

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];

    return data;
  } catch (err) {
    console.error(`Failed to load ${collectionName} from Firebase:`, err);
    return null;
  }
}
}

export async function loadUsersFromFirebase(): Promise<User[]> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(d => d.data() as User);
}

export async function loadLocationsFromFirebase(): Promise<LocationItem[] | null> {
  return loadFirestoreData<LocationItem>('locations_data');
}

import { collection, getDocs } from "firebase/firestore";

export async function loadInventoryFromFirebase(): Promise<InventoryItem[]> {
  try {
    const snapshot = await getDocs(collection(db, "inventory"));

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InventoryItem[];

  } catch (err) {
    console.error("Failed to load inventory:", err);
    return [];
  }
}
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
import { writeBatch, doc } from "firebase/firestore";

// Sync inventory to Firestore
export async function syncInventoryToFirebase(inventory: InventoryItem[]) {
  if (typeof window === 'undefined') return;

  try {
    // 🚨 Prevent accidental wipes
    if (!Array.isArray(inventory)) return;

    if (inventory.length === 0) {
      console.warn("Blocked empty inventory overwrite");
      return;
    }

    const batch = writeBatch(db);

    inventory.forEach((item) => {
      if (!item?.id) return;

      const ref = doc(db, "inventory", item.id);

      batch.set(ref, {
        ...item,
        lastUpdated: new Date().toISOString(),
      });
    });

    await batch.commit();

    console.log("INVENTORY SYNC SAFE SUCCESS");

  } catch (err) {
    console.error("Failed inventory sync:", err);
  }
}

// Listen for inventory updates from Firestore
export function listenToInventoryUpdates(callback) {
  if (typeof window === 'undefined') return () => {};

  try {
    const unsubscribe = onSnapshot(
      collection(db, "inventory"),
      (snapshot) => {

        const inventory = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        saveInventory(inventory);

        if (callback) {
          callback(inventory);
        }
      }
    );

    return unsubscribe;

  } catch (err) {
    console.error("Failed inventory listener:", err);
    return () => {};
  }
}

// Sync schedules to Firestore
export async function syncSchedulesToFirebase(schedules: ScheduleItem[]) {
  if (typeof window === 'undefined') return;
  try {
    import { collection, writeBatch, doc } from "firebase/firestore";

export async function syncSchedulesToFirebase(schedules: ScheduleItem[]) {
  if (typeof window === 'undefined') return;

  try {
    if (!Array.isArray(schedules)) return;

    const batch = writeBatch(db);

    schedules.forEach((item) => {
      if (!item?.id) return;

      const ref = doc(db, "schedules", item.id);

      batch.set(ref, {
        ...item,
        lastUpdated: new Date().toISOString(),
      });
    });

    await batch.commit();
  } catch (err) {
    console.error('Failed to sync schedules:', err);
  }
}
  } catch (err) {
    console.error('Failed to sync schedules to Firebase:', err);
  }
}

// Listen for schedules updates from Firestore
import { collection, onSnapshot } from "firebase/firestore";

export function listenToSchedulesUpdates() {
  if (typeof window === 'undefined') return;

  try {
    unsubscribeSchedules = onSnapshot(
      collection(db, "schedules"),
      (snapshot) => {
        const schedules = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        saveSchedules(schedules);
        schedulesUpdateCallback?.(schedules);
      }
    );
  } catch (err) {
    console.error('Failed to listen to schedules updates:', err);
  }
}

// Sync cancel requests to Firestore
export async function syncCancelRequestsToFirebase(requests: CancelRequest[]) {
  if (typeof window === 'undefined') return;
  try {
   export async function syncCancelRequestsToFirebase(requests: CancelRequest[]) {
  if (typeof window === 'undefined') return;

  try {
    if (!Array.isArray(requests)) return;

    const batch = writeBatch(db);

    requests.forEach((req) => {
      if (!req?.id) return;

      const ref = doc(db, "cancel_requests", req.id);

      batch.set(ref, {
        ...req,
        lastUpdated: new Date().toISOString(),
      });
    });

    await batch.commit();
  } catch (err) {
    console.error('Failed cancel sync:', err);
  }
}
  } catch (err) {
    console.error('Failed to sync cancel requests to Firebase:', err);
  }
}

// Listen for cancel requests updates from Firestore
import { collection, onSnapshot } from "firebase/firestore";

export function listenToCancelRequestsUpdates() {
  if (typeof window === 'undefined') return;

  try {
    unsubscribeCancelRequests = onSnapshot(
      collection(db, "cancel_requests"),
      (snapshot) => {
        const requests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        saveCancelRequests(requests);
        cancelRequestsUpdateCallback?.(requests);
      }
    );
  } catch (err) {
    console.error('Failed to listen to cancel requests updates:', err);
  }
}

// Sync fraud checks to Firestore
export async function syncFraudChecksToFirebase(checks: FraudCheck[]) {
  if (typeof window === 'undefined') return;
  try {
    export async function syncFraudChecksToFirebase(checks: FraudCheck[]) {
  if (typeof window === 'undefined') return;

  try {
    if (!Array.isArray(checks)) return;

    const batch = writeBatch(db);

    checks.forEach((check) => {
      if (!check?.id) return;

      const ref = doc(db, "fraud_checks", check.id);

      batch.set(ref, {
        ...check,
        lastUpdated: new Date().toISOString(),
      });
    });

    await batch.commit();
  } catch (err) {
    console.error('Failed fraud sync:', err);
  }
}
  } catch (err) {
    console.error('Failed to sync fraud checks to Firebase:', err);
  }
}

// Listen for fraud checks updates from Firestore
export function listenToFraudChecksUpdates() {
  if (typeof window === 'undefined') return;

  try {
    unsubscribeFraudChecks = onSnapshot(
      collection(db, "fraud_checks"),
      (snapshot) => {
        const checks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        saveFraudChecks(checks);
        fraudChecksUpdateCallback?.(checks);
      }
    );
  } catch (err) {
    console.error('Failed to listen to fraud checks updates:', err);
  }
}

// Sync locations to Firestore
export async function syncLocationsToFirebase(locations: LocationItem[]) {
  if (typeof window === 'undefined') return;
  try {
    export async function syncLocationsToFirebase(locations: LocationItem[]) {
  if (typeof window === 'undefined') return;

  try {
    if (!Array.isArray(locations)) return;

    const batch = writeBatch(db);

    locations.forEach((loc) => {
      if (!loc?.id) return;

      const ref = doc(db, "locations", loc.id);

      batch.set(ref, {
        ...loc,
        lastUpdated: new Date().toISOString(),
      });
    });

    await batch.commit();
  } catch (err) {
    console.error('Failed locations sync:', err);
  }
}
  } catch (err) {
    console.error('Failed to sync locations to Firebase:', err);
  }
}

// Listen for locations updates from Firestore
export function listenToLocationsUpdates() {
  if (typeof window === 'undefined') return;

  try {
    unsubscribeLocations = onSnapshot(
      collection(db, "locations"),
      (snapshot) => {
        const locations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        saveLocations(locations);
        locationsUpdateCallback?.(locations);
      }
    );
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
