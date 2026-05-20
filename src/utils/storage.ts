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
  try {
    const cap = (window as any).Capacitor as any;
    const plugins = cap && (cap.Plugins || (window as any).CapacitorPlugins);
    const storage = plugins?.Storage || (window as any).CapacitorStorage || null;
    if (storage && typeof storage.set === 'function') {
      await storage.set({ key: USER_KEY, value: JSON.stringify(users) });
      return;
    }
  } catch (e) {
    // fall back to localStorage
  }

  try {
    window.localStorage.setItem(USER_KEY, JSON.stringify(users));
  } catch {
    // ignore
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
