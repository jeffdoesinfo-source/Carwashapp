import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase"; // adjust path if needed
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import React, { useEffect, useMemo, useState } from 'react';
import {
  loadLocalUsers,
  saveLocalUsers,
  loadLocalUsersAsync,
  saveLocalUsersAsync,
  loadLocations,
  saveLocations,
  loadInventory,
  saveInventory,
  loadSchedules,
  saveSchedules,
  loadCancelRequests,
  saveCancelRequests,
  loadFraudChecks,
  saveFraudChecks,
  loadHistory,
  saveHistory,
  loadNotifications,
  saveNotifications,
  loadUsersFromFirebase,
  loadLocationsFromFirebase,
  loadInventoryFromFirebase,
  loadSchedulesFromFirebase,
  loadCancelRequestsFromFirebase,
  loadFraudChecksFromFirebase,
  syncUsersToFirebase,
  syncInventoryToFirebase,
  syncSchedulesToFirebase,
  syncCancelRequestsToFirebase,
  syncFraudChecksToFirebase,
  syncLocationsToFirebase,
  listenToUsersUpdates,
  listenToInventoryUpdates,
  listenToSchedulesUpdates,
  listenToCancelRequestsUpdates,
  listenToFraudChecksUpdates,
  listenToLocationsUpdates,
  setUsersUpdateCallback,
  setInventoryUpdateCallback,
  setSchedulesUpdateCallback,
  setCancelRequestsUpdateCallback,
  setFraudChecksUpdateCallback,
  setLocationsUpdateCallback,
  unsubscribeFromAllUpdates,
} from './utils/storage';
import type {
  CancelRequest,
  FraudCheck,
  HistoryEntry,
  InventoryItem,
  LocationItem,
  NotificationItem,
  Permission,
  Role,
  ScheduleItem,
  User,
} from './types';

const tabs = ['Dashboard', 'Schedule', 'Inventory', 'Cancel Requests', 'Fraud Plate Check', 'History', 'Admin'] as const;
const permissionOptions: { value: Permission; label: string }[] = [
  { value: 'Dashboard', label: 'Dashboard access' },
  { value: 'Schedule', label: 'Schedule access' },
  { value: 'Inventory', label: 'Inventory access' },
  { value: 'Cancel', label: 'Cancel request access' },
  { value: 'Fraud', label: 'Fraud plate check access' },
  { value: 'History', label: 'History access' },
  { value: 'Admin', label: 'Admin management access' },
];

const tabPermissionMap: Record<typeof tabs[number], Permission> = {
  Dashboard: 'Dashboard',
  Schedule: 'Schedule',
  Inventory: 'Inventory',
  'Cancel Requests': 'Cancel',
  'Fraud Plate Check': 'Fraud',
  History: 'History',
  Admin: 'Admin',
};

type Tab = typeof tabs[number];

const localDefaultLocation: LocationItem = {
  id: 'local-default-location',
  name: 'Default Location',
};

const ALL_LOCATIONS_ID = 'all-locations';

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
};

const getDefaultPermissions = (role: Role): Permission[] => {
  switch (role) {
    case 'Admin':
      return ['Dashboard', 'Schedule', 'Inventory', 'Cancel', 'Fraud', 'History', 'Admin'];
    case 'Manager':
      return ['Dashboard', 'Schedule', 'Inventory', 'Cancel', 'Fraud', 'History'];
    case 'Crew':
      return ['Dashboard', 'Schedule', 'Inventory', 'Cancel', 'Fraud'];
    default:
      return ['Dashboard'];
  }
};

const getPermissionsForUser = (user: User): Permission[] => user.permissions ?? getDefaultPermissions(user.role);

const hasPermission = (user: User, permission: Permission): boolean => getPermissionsForUser(user).includes(permission);

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [cancelRequests, setCancelRequests] = useState<CancelRequest[]>([]);
  const [fraudChecks, setFraudChecks] = useState<FraudCheck[]>([]);
  const [fraudSearch, setFraudSearch] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [locationsLoaded, setLocationsLoaded] = useState(false);
  const [defaultAdminSeeded, setDefaultAdminSeeded] = useState(false);

  const appLocationId = useMemo(() => {
    if (!currentUser) return '';
    if (currentUser.role === 'Admin') {
      return selectedLocationId === ALL_LOCATIONS_ID ? '' : selectedLocationId || currentUser.locationId;
    }
    return currentUser.locationId;
  }, [currentUser, selectedLocationId]);

  const locationUsers = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Admin' && selectedLocationId === ALL_LOCATIONS_ID) {
      return users;
    }
    return users.filter((item) => item.locationId === appLocationId);
  }, [users, appLocationId, currentUser, selectedLocationId]);

useEffect(() => {
  const initializeApp = async () => {
    const localUsers = await loadLocalUsersAsync();
    const localLocations = loadLocations();
    const localInventory = loadInventory();
    const localSchedules = loadSchedules();
    const localCancelRequests = loadCancelRequests();
    const localFraudChecks = loadFraudChecks();

    const remoteUsers = await loadUsersFromFirebase();
    const remoteLocations = await loadLocationsFromFirebase();
    const remoteInventory = await loadInventoryFromFirebase();
    const remoteSchedules = await loadSchedulesFromFirebase();
    const remoteCancelRequests = await loadCancelRequestsFromFirebase();
    const remoteFraudChecks = await loadFraudChecksFromFirebase();

    const usersFromServer = remoteUsers ?? localUsers;
    let effectiveUsers = usersFromServer;

    if (!remoteUsers && effectiveUsers.length === 0) {
      const locationId = localLocations[0]?.id || localDefaultLocation.id;

     const userCred = const seededUser: User = {
  id: crypto.randomUUID(),
  username: "JeffArmstrong",
  password: "ArmstrongFam2024!",
  role: "Admin",
  locationId,
  permissions: ["Dashboard", "Inventory"],
};
await syncUsersToFirebase([seededUser]);
const uid = userCred.user.uid;
{
  username: "JeffArmstrong",
  role: "Admin",
  locationId: "5be6a514-79e8-41a4-81ce-16d7fdb20cbd",
  permissions: ["Dashboard", "Inventory"]
}
import { writeBatch, doc } from "firebase/firestore";

export async function syncUsersToFirebase(users: User[]) {
  if (typeof window === 'undefined') return;

  try {
    // ≡ƒÜ¿ SAFETY: prevent wiping all users
    if (!Array.isArray(users)) return;
    if (users.length === 0) {
      console.warn("Blocked empty user overwrite");
      return;
    }

    const usersRef = doc(db, 'app', 'users_data');

    await setDoc(
      usersRef,
      {
        data: users,
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );

  } catch (err) {
    console.error('Failed to sync users to Firebase:', err);
  }
}
}
  {
    username,
    role,
    locationId,
  },
  { merge: true }
);
});

      effectiveUsers = [seededUser];

      saveLocalUsers(effectiveUsers);
      await saveLocalUsersAsync(effectiveUsers);
      await syncUsersToFirebase(effectiveUsers);
    } else if (remoteUsers) {
      saveLocalUsers(effectiveUsers);
      await saveLocalUsersAsync(effectiveUsers);
    }

    setUsers(effectiveUsers);

    const effectiveLocations = remoteLocations ?? localLocations;
    setLocations(effectiveLocations);
    saveLocations(effectiveLocations);

    const effectiveInventory = remoteInventory ?? localInventory;
    setInventory(effectiveInventory);
    saveInventory(effectiveInventory);

    const effectiveSchedules = remoteSchedules ?? localSchedules;
    setSchedules(effectiveSchedules);
    saveSchedules(effectiveSchedules);

    const effectiveCancelRequests =
      remoteCancelRequests ?? localCancelRequests;
    setCancelRequests(effectiveCancelRequests);
    saveCancelRequests(effectiveCancelRequests);

    const effectiveFraudChecks =
      remoteFraudChecks ?? localFraudChecks;
    setFraudChecks(effectiveFraudChecks);
    saveFraudChecks(effectiveFraudChecks);

    setUsersLoaded(true);
    setLocationsLoaded(true);
    setDefaultAdminSeeded(true);
  };

  if (!defaultAdminSeeded) {
    void initializeApp();
  }

  const unsubscribeInventory = listenToInventoryUpdates((items) => {
    setInventory(items);
    saveInventory(items);
  });
const unsubscribeUsers = listenToUsersUpdates((items) => {
  setUsers(items);
  saveLocalUsers(items);
});

const unsubscribeSchedules = listenToSchedulesUpdates((items) => {
  setSchedules(items);
  saveSchedules(items);
});

const unsubscribeCancelRequests = listenToCancelRequestsUpdates((items) => {
  setCancelRequests(items);
  saveCancelRequests(items);
});
 const unsubscribeInventory = listenToInventoryUpdates((items) => {
  setInventory(items);
  saveInventory(items);
});

const unsubscribeUsers = listenToUsersUpdates((items) => {
  setUsers(items);
  saveLocalUsers(items);
});

const unsubscribeSchedules = listenToSchedulesUpdates((items) => {
  setSchedules(items);
  saveSchedules(items);
});

const unsubscribeCancelRequests = listenToCancelRequestsUpdates((items) => {
  setCancelRequests(items);
  saveCancelRequests(items);
});

return () => {
  unsubscribeInventory();
  unsubscribeUsers();
  unsubscribeSchedules();
  unsubscribeCancelRequests();

  if (defaultAdminSeeded) {
    unsubscribeFromAllUpdates();
  }
};
}, [defaultAdminSeeded]);
}, []);
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'Admin') {
      setSelectedLocationId(locations[0]?.id || currentUser.locationId);
    } else {
      setSelectedLocationId(currentUser.locationId);
    }
  }, [currentUser, locations]);

  function createHistoryEntry(label: string, details: string, locationId: string) {
    const newEntry: HistoryEntry = {
      id: generateId(),
      label,
      details,
      locationId,
      timestamp: new Date().toISOString(),
    };

    const currentHistory = loadHistory();
    const updatedHistory = [newEntry, ...currentHistory];
    saveHistory(updatedHistory);
    setHistory(updatedHistory);
  }

  function createNotification(message: string, type: NotificationItem['type'], locationId: string, relatedId?: string) {
    const currentNotifications = loadNotifications();
    const existing = relatedId
      ? currentNotifications.find((item) => item.relatedId === relatedId && item.type === type && item.locationId === locationId)
      : undefined;

    if (existing) {
      return;
    }

    const newItem: NotificationItem = {
      id: generateId(),
      relatedId,
      message,
      type,
      timestamp: new Date().toISOString(),
      locationId,
      read: false,
    };

    const updatedNotifications = [newItem, ...currentNotifications];
    saveNotifications(updatedNotifications);
    setNotifications(currentUser?.role === 'Admin' ? updatedNotifications : updatedNotifications.filter((item) => item.locationId === locationId));
  }

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    const currentNotifications = loadNotifications();
    const updatedNotifications = currentNotifications.map((item) => {
      if (currentUser.role === 'Admin' && selectedLocationId === ALL_LOCATIONS_ID) {
        return { ...item, read: true };
      }
      return item.locationId === appLocationId ? { ...item, read: true } : item;
    });
    saveNotifications(updatedNotifications);
    if (currentUser.role === 'Admin' && selectedLocationId === ALL_LOCATIONS_ID) {
      setNotifications(updatedNotifications);
    } else {
      setNotifications(updatedNotifications.filter((item) => item.locationId === appLocationId));
    }
  };

  const handleLogin = async () => {
    if (!usersLoaded) {
      setLoginError('Please wait while user data is loading.');
      return;
    }

    setLoginError('');
    setStatusMessage('Signing in...');

   const handleLogin = async () => {
  if (!usersLoaded) {
    setLoginError("Please wait while user data is loading.");
    return;
  }

  setLoginError("");
  setStatusMessage("Signing in...");

  try {
    // ≡ƒöÉ Firebase Auth login (THIS IS THE ONLY REAL LOGIN CHECK)
    const cred = await signInWithEmailAndPassword(
      auth,
      loginEmail.trim(), // <-- this must be EMAIL now
      loginPassword
    );

    const uid = cred.user.uid;

    // ≡ƒæñ load Firestore user profile
    const snap = await getDoc(doc(db, "users", uid));

    if (!snap.exists()) {
      setLoginError("User profile missing in database");
      return;
    }

    const userData = snap.data() as User;

    setCurrentUser(userData);
    setStatusMessage("");
    setActiveTab("Dashboard");

  } catch (err) {
    setLoginError("Invalid email or password");
    setStatusMessage("");
  }
};

  const signOut = () => {
    setCurrentUser(null);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
    setActiveTab('Dashboard');
  };

  const [newSchedule, setNewSchedule] = useState({ title: '', date: '', startTime: '', endTime: '', type: 'Shift' as ScheduleItem['type'], assignedTo: '' });
  const [newInventory, setNewInventory] = useState({ name: '', quantity: 0, notes: '' });
  const [newCancel, setNewCancel] = useState({ customerName: '', licensePlate: '', reason: '' });
  const [newFraud, setNewFraud] = useState({ customerName: '', licensePlate: '', location: '', note: '' });
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'Crew' as Role, locationId: '', permissions: getDefaultPermissions('Crew') });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationThreshold, setNewLocationThreshold] = useState(5);
  const [locationThresholdEdits, setLocationThresholdEdits] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!newUser.locationId && locations.length > 0) {
      setNewUser((prev) => ({ ...prev, locationId: locations[0].id }));
    }
  }, [locations, newUser.locationId]);

  const appLocation = locations.find((item) => item.id === appLocationId);
  const shiftSchedules = useMemo(() => schedules.filter((item) => item.type === 'Shift'), [schedules]);
  const choreSchedules = useMemo(() => schedules.filter((item) => item.type !== 'Shift'), [schedules]);
  const unreadNotifications = useMemo(() => {
    if (currentUser?.role === 'Admin' && selectedLocationId === ALL_LOCATIONS_ID) {
      return notifications.filter((item) => !item.read);
    }
    return notifications.filter((item) => !item.read && item.locationId === appLocationId);
  }, [notifications, appLocationId, currentUser, selectedLocationId]);
  const displayedFraudChecks = useMemo(() => {
    const searchText = fraudSearch.trim().toLowerCase();
    if (!searchText) return fraudChecks;
    return fraudChecks.filter((item) =>
      item.customerName.toLowerCase().includes(searchText)
      || item.licensePlate.toLowerCase().includes(searchText)
      || item.location.toLowerCase().includes(searchText)
      || (item.membership?.toLowerCase().includes(searchText) ?? false),
    );
  }, [fraudChecks, fraudSearch]);

  const adminOverview = useMemo(() => {
    if (!currentUser || currentUser.role !== 'Admin') {
      return {
        scheduleByLocation: [] as { locationId: string; locationName: string; shifts: ScheduleItem[] }[],
        lowInventoryAlerts: [] as (InventoryItem & { locationName: string })[],
      };
    }

    const scheduleGroups = schedules
      .filter((item) => item.type === 'Shift')
      .reduce<Record<string, { locationId: string; locationName: string; shifts: ScheduleItem[] }>>((acc, schedule) => {
        const locationName = locations.find((loc) => loc.id === schedule.locationId)?.name || 'Unknown location';
        if (!acc[schedule.locationId]) {
          acc[schedule.locationId] = {
            locationId: schedule.locationId,
            locationName,
            shifts: [],
          };
        }
        acc[schedule.locationId].shifts.push(schedule);
        return acc;
      }, {});

    const scheduleByLocation = Object.values(scheduleGroups).sort((a, b) => a.locationName.localeCompare(b.locationName));
    const lowInventoryAlerts = inventory
      .filter((item) => {
        const location = locations.find((loc) => loc.id === item.locationId);
        const threshold = location?.lowInventoryThreshold ?? 5;
        return item.quantity <= threshold;
      })
      .map((item) => ({
        ...item,
        locationName: locations.find((loc) => loc.id === item.locationId)?.name || 'Unknown location',
      }))
      .sort((a, b) => a.locationName.localeCompare(b.locationName));

    return { scheduleByLocation, lowInventoryAlerts };
  }, [currentUser, inventory, schedules, locations]);

  const finalizeFraudCheck = (itemId: string) => {
    if (!currentUser) return;
    const currentFraudChecks = loadFraudChecks();
    const target = currentFraudChecks.find((item) => item.id === itemId);
    if (!target) return;

    const membershipResponse = window.prompt('Customer membership level (leave blank if none):', target.membership || '');
    if (membershipResponse === null) return;
    const membership = membershipResponse.trim();

    const activeResponse = window.prompt('Set customer active status: enter yes or no', target.active ? 'yes' : 'no');
    if (activeResponse === null) return;
    const active = activeResponse.trim().toLowerCase() === 'yes';

    const updatedFraudChecks = currentFraudChecks.map((item) =>
      item.id === itemId
        ? { ...item, done: true, membership, active }
        : item,
    );

   await syncFraudChecksToFirebase(updatedFraudChecks);

saveFraudChecks(updatedFraudChecks);
setFraudChecks(updatedFraudChecks);

    const fraudLocationId = appLocationId || target.location;
    createHistoryEntry(
      'Fraud plate resolved',
      `${target.customerName} / ${target.licensePlate} (${membership || 'No membership'}) - ${active ? 'Active' : 'Not Active'}`,
      fraudLocationId,
    );
    createNotification(
      `Fraud plate ${target.licensePlate} resolved as ${active ? 'Active' : 'Not Active'} (${membership || 'No membership'})`,
      'Fraud',
      fraudLocationId,
      `${target.id}-resolved`,
    );
  };

  const handleCreateSchedule = async () => {
    if (!currentUser || currentUser.role === 'Crew' || !appLocationId || !newSchedule.title || !newSchedule.date) return;

    const newItem: ScheduleItem = {
      id: generateId(),
      ...newSchedule,
      locationId: appLocationId,
      done: false,
    };

    const currentSchedules = loadSchedules();
const updatedSchedules = [...currentSchedules, newItem];

await syncSchedulesToFirebase(updatedSchedules);

saveSchedules(updatedSchedules);
setSchedules(updatedSchedules);

    createHistoryEntry(
      'Schedule added',
      `${newSchedule.title} for ${newSchedule.assignedTo || 'unassigned'}${newSchedule.startTime ? ` at ${newSchedule.startTime}` : ''}`,
      appLocationId,
    );

    const scheduleLabel = newSchedule.type === 'Shift' ? 'Shift assigned' : 'Chore scheduled';
    const scheduleMessage =
      newSchedule.type === 'Shift'
        ? `Shift scheduled for ${newSchedule.assignedTo || 'unassigned'} on ${newSchedule.date}${newSchedule.startTime ? ` at ${newSchedule.startTime}` : ''}`
        : `${newSchedule.type} added: ${newSchedule.title} on ${newSchedule.date}`;

    createNotification(scheduleMessage, newSchedule.type === 'Shift' ? 'Shift' : 'Schedule', appLocationId, newItem.id);

    setNewSchedule({ title: '', date: '', startTime: '', endTime: '', type: 'Shift', assignedTo: '' });
  };

  const handleAddInventory = async () => {
    if (!currentUser || !appLocationId || !newInventory.name) return;

    const newItem: InventoryItem = {
      id: generateId(),
      ...newInventory,
      locationId: appLocationId,
    };

   const currentInventory = loadInventory();
const updatedInventory = [...currentInventory, newItem];

await syncInventoryToFirebase(updatedInventory);

saveInventory(updatedInventory);
setInventory(updatedInventory);

    createHistoryEntry('Inventory added', `${newInventory.name} x${newInventory.quantity}`, appLocationId);
    setNewInventory({ name: '', quantity: 0, notes: '' });
  };

 const handleDeleteInventory = async (itemId: string) => {
  if (!currentUser || currentUser.role !== 'Admin') return;

  const itemToDelete = inventory.find(
    (item) => item.id === itemId
  );

  if (!itemToDelete) return;

  if (!window.confirm(`Delete inventory item ${itemToDelete.name}?`)) {
    return;
  }

  const updatedInventory = inventory.filter(
    (item) => item.id !== itemId
  );

  try {
    await syncInventoryToFirebase(updatedInventory);

    setInventory(updatedInventory);
    saveInventory(updatedInventory);

    createHistoryEntry(
      'Inventory removed',
      `${itemToDelete.name} removed from inventory`,
      itemToDelete.locationId
    );
  } catch (err) {
    console.error('Delete sync failed:', err);
  }
};

  const handleAdjustInventory = async (itemId: string, delta: number) => {
    if (!currentUser || !appLocationId) return;
    const currentInventory = loadInventory();
    const updatedInventory = currentInventory.map((item) =>
      item.id === itemId
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item,
    );
   await syncInventoryToFirebase(updatedInventory);

saveInventory(updatedInventory);

setInventory(
  updatedInventory.filter(
    (item) =>
      currentUser.role === 'Admin' ||
      item.locationId === appLocationId
  )
);

    const changedItem = updatedInventory.find((item) => item.id === itemId);
    if (changedItem) {
      createHistoryEntry(
        'Inventory updated',
        `${changedItem.name} quantity ${delta >= 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)} to ${changedItem.quantity}`,
        appLocationId,
      );
    }
  };

  const handleEditInventoryQuantity = async (itemId: string) => {
    if (!currentUser || !appLocationId) return;
    const currentInventory = loadInventory();
    const target = currentInventory.find((item) => item.id === itemId);
    if (!target) return;

    const response = window.prompt('Enter new quantity for ' + target.name, String(target.quantity));
    if (response === null) return;
    const quantity = Number(response);
    if (Number.isNaN(quantity) || quantity < 0) return;

    const updatedInventory = currentInventory.map((item) =>
      item.id === itemId ? { ...item, quantity } : item,
    );
    await syncInventoryToFirebase(updatedInventory);

saveInventory(updatedInventory);

setInventory(
  updatedInventory.filter(
    (item) =>
      currentUser.role === 'Admin' ||
      item.locationId === appLocationId
  )
);
    createHistoryEntry(
      'Inventory quantity set',
      `${target.name} quantity changed to ${quantity}`,
      appLocationId,
    );
  };

  const handleAddCancel = async () => {
    if (!currentUser || !appLocationId || !newCancel.customerName || !newCancel.licensePlate) return;

    const newItem: CancelRequest = {
      id: generateId(),
      ...newCancel,
      done: false,
      createdAt: new Date().toISOString(),
      locationId: appLocationId,
    };

   const currentCancelRequests = loadCancelRequests();
const updatedCancelRequests = [...currentCancelRequests, newItem];

await syncCancelRequestsToFirebase(updatedCancelRequests);

saveCancelRequests(updatedCancelRequests);
setCancelRequests(updatedCancelRequests);

    createHistoryEntry('Cancel request added', `${newCancel.customerName} / ${newCancel.licensePlate}`, appLocationId);
    setNewCancel({ customerName: '', licensePlate: '', reason: '' });
  };

  const handleAddFraud = async () => {
    if (!currentUser || !newFraud.customerName || !newFraud.licensePlate || !newFraud.location) return;

    const newItem: FraudCheck = {
      id: generateId(),
      ...newFraud,
      done: false,
      createdAt: new Date().toISOString(),
    };

   const currentFraudChecks = loadFraudChecks();
const updatedFraudChecks = [...currentFraudChecks, newItem];

await syncFraudChecksToFirebase(updatedFraudChecks);

saveFraudChecks(updatedFraudChecks);
setFraudChecks(updatedFraudChecks);

    const fraudLocationId = appLocationId || currentUser.locationId;
    createHistoryEntry('Fraud plate check added', `${newFraud.customerName} / ${newFraud.licensePlate}`, fraudLocationId);
    createNotification(
      `Fraud plate entered: ${newFraud.licensePlate} (${newFraud.customerName}) at ${newFraud.location}`,
      'Fraud',
      fraudLocationId,
      newItem.id,
    );
    setNewFraud({ customerName: '', licensePlate: '', location: '', note: '' });
  };

  const handleCreateUser = async () => {
    if (!currentUser || currentUser.role !== 'Admin' || !newUser.username || !newUser.locationId) return;
    setActionMessage('');

    const updatedUsers = editingUserId
      ? users.map((user) =>
          user.id === editingUserId
            ? {
                ...user,
                username: newUser.username.trim(),
                password: newUser.password || user.password,
                role: newUser.role,
                locationId: newUser.locationId,
                permissions: newUser.permissions,
              }
            : user,
        )
      : [
          ...users,
          {
            id: generateId(),
            username: newUser.username.trim(),
            password: newUser.password,
            role: newUser.role,
            locationId: newUser.locationId,
            permissions: newUser.permissions,
          },
        ];

    setUsers(updatedUsers);
    saveLocalUsers(updatedUsers);
    await saveLocalUsersAsync(updatedUsers);
    await syncUsersToFirebase(updatedUsers);

    if (editingUserId) {
      createHistoryEntry('User updated', `${newUser.username} as ${newUser.role}`, newUser.locationId);
      setActionMessage('User account updated successfully.');
    } else {
      createHistoryEntry('User created', `${newUser.username} as ${newUser.role}`, newUser.locationId);
      setActionMessage('New user account created successfully.');
    }

    setEditingUserId(null);
    setNewUser({ username: '', password: '', role: 'Crew', locationId: locations[0]?.id || '', permissions: getDefaultPermissions('Crew') });
  };

  const handleDeleteUser = async (userId: string) => {
    if (!currentUser || currentUser.role !== 'Admin') return;
    if (userId === currentUser.id) {
      setActionMessage('You cannot delete the currently signed-in account.');
      return;
    }
    const userToDelete = users.find((user) => user.id === userId);
    if (!userToDelete) return;
    if (!window.confirm(`Delete user ${userToDelete.username}? This action cannot be undone.`)) return;

   const updatedUsers = users.filter((user) => user.id !== userId);

try {
  await syncUsersToFirebase(updatedUsers);

  setUsers(updatedUsers);
  saveLocalUsers(updatedUsers);
  await saveLocalUsersAsync(updatedUsers);

  createHistoryEntry(
    'User deleted',
    `${userToDelete.username} removed`,
    userToDelete.locationId
  );
} catch (err) {
  console.error('Failed to delete user in Firebase:', err);
}

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setNewUser({
      username: user.username,
      password: '',
      role: user.role,
      locationId: user.locationId,
      permissions: user.permissions ?? getDefaultPermissions(user.role),
    });
    setActionMessage('Editing existing user. Update the fields and save.');
  };

  const handleCancelEditUser = () => {
    setEditingUserId(null);
    setNewUser({ username: '', password: '', role: 'Crew', locationId: locations[0]?.id || '', permissions: getDefaultPermissions('Crew') });
    setActionMessage('');
  };

  const handleCreateLocation = async () => {
    if (!currentUser || currentUser.role !== 'Admin' || !newLocationName) return;

    const newLocation: LocationItem = {
      id: generateId(),
      name: newLocationName,
      lowInventoryThreshold: newLocationThreshold,
    };

 const currentLocations = loadLocations();
const updatedLocations = [...currentLocations, newLocation];

await syncLocationsToFirebase(updatedLocations);

saveLocations(updatedLocations);
setLocations(updatedLocations);
    createHistoryEntry('Location added', newLocationName, newLocation.id);
    setNewLocationName('');
    setNewLocationThreshold(5);
  };

  const toggleDone = async (collectionName: string, itemId: string, currentValue: boolean, label: string, details: string) => {
    if (collectionName === 'schedules') {
      const currentSchedules = loadSchedules();
      const targetItem = currentSchedules.find((item) => item.id === itemId);
      if (!targetItem) return;
      if (currentUser?.role === 'Crew' && targetItem.type === 'Shift') {
        return;
      }
      const updatedSchedules = currentSchedules.map(item =>
        item.id === itemId
          ? {
              ...item,
              done: !currentValue,
              completedBy: !currentValue ? currentUser?.username : undefined,
            }
          : item,
      );
      await syncSchedulesToFirebase(updatedSchedules);

saveSchedules(updatedSchedules);
setSchedules(updatedSchedules);
    } else if (collectionName === 'cancelRequests') {
      const currentCancelRequests = loadCancelRequests();
      const updatedCancelRequests = currentCancelRequests.map(item =>
        item.id === itemId ? { ...item, done: !currentValue } : item
      );
     await syncCancelRequestsToFirebase(updatedCancelRequests);

saveCancelRequests(updatedCancelRequests);
setCancelRequests(updatedCancelRequests);
    }

    createHistoryEntry(`${label} updated`, details, appLocationId);
  };

  const availableTabs = tabs.filter((tab) => {
    if (!currentUser) return false;
    if (tab === 'Fraud Plate Check') return true;
    return hasPermission(currentUser, tabPermissionMap[tab]);
  });

  useEffect(() => {
    if (!currentUser) return;
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0] || 'Dashboard');
    }
  }, [availableTabs, activeTab, currentUser])
  if (!currentUser) {
    return (
      <div className="app-shell">
        <div className="header">
          <div>
            <h1>Carwash Staff Management</h1>
            <p>Login with your account to access your location tools.</p>
          </div>
        </div>

        <div className="form-card">
          <div className="field-group">
            <label>
              Email
              <input value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} />
            </label>
            <label>
              Password
              <input type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} />
            </label>
          </div>
          {loginError && <div className="alert">{loginError}</div>}
          <button className="primary" onClick={handleLogin} disabled={!usersLoaded}>
            Sign In
          </button>
          {!usersLoaded && <p>Loading user data before login...</p>}
          {statusMessage && <p>{statusMessage}</p>}
          {actionMessage && <div className="alert">{actionMessage}</div>}
          <div className="alert" style={{ marginTop: 20 }}>
            Use admin account to create users and locations. Fill Firebase config in <code>src/firebase.ts</code> before use.
          </div>
        </div>
      </div>
    );
  }

  const dashboardCounts = {
    inventory: inventory.length,
    schedules: schedules.length,
    cancelRequests: cancelRequests.filter((item) => !item.done).length,
    fraudChecks: fraudChecks.length,
    notifications: currentUser?.role === 'Admin' && selectedLocationId === ALL_LOCATIONS_ID
      ? notifications.filter((item) => !item.read).length
      : notifications.filter((item) => !item.read && item.locationId === appLocationId).length,
  };

  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <h1>Carwash Staff Management</h1>
          <p>
            Signed in as <strong>{currentUser.username}</strong> ({currentUser.role})
          </p>
          <p>Location: {appLocation?.name || 'All locations'}</p>
        </div>
        <div>
          {currentUser.role === 'Admin' && (
            <label>
              Active location
              <select value={selectedLocationId} onChange={(event) => setSelectedLocationId(event.target.value)}>
                <option value={ALL_LOCATIONS_ID}>All locations</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button className="secondary" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>

      <div className="nav-tabs">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Dashboard' && (
        <>
          <div className="summary-grid">
            <div className="summary-card">
              <h3>Inventory Items</h3>
              <p>{dashboardCounts.inventory}</p>
            </div>
            <div className="summary-card">
              <h3>Scheduled items</h3>
              <p>{dashboardCounts.schedules}</p>
            </div>
            <div className="summary-card">
              <h3>Open cancel requests</h3>
              <p>{dashboardCounts.cancelRequests}</p>
            </div>
            <div className="summary-card">
              <h3>Fraud plate records</h3>
              <p>{dashboardCounts.fraudChecks}</p>
            </div>
            <div className="summary-card">
              <h3>Unread notifications</h3>
              <p>{dashboardCounts.notifications}</p>
            </div>
          </div>
          {currentUser.role === 'Admin' && (
            <div className="section-card">
              <h2>Admin location overview</h2>
              {adminOverview.lowInventoryAlerts.length > 0 ? (
                <>
                  <h3>Low inventory alerts</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Location</th>
                        <th>Item</th>
                        <th>Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminOverview.lowInventoryAlerts.map((item) => (
                        <tr key={item.id}>
                          <td>{item.locationName}</td>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <p>No low inventory alerts. All tracked items are above the threshold.</p>
              )}

              <h3>Who is scheduled where</h3>
              {adminOverview.scheduleByLocation.length > 0 ? (
                adminOverview.scheduleByLocation.map((group) => (
                  <div key={group.locationId} style={{ marginTop: 16 }}>
                    <h4>{group.locationName}</h4>
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Title</th>
                          <th>Assigned</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.shifts.map((shift) => (
                          <tr key={shift.id}>
                            <td>{shift.date}</td>
                            <td>{shift.startTime || 'ΓÇö'}{shift.endTime ? `ΓÇô ${shift.endTime}` : ''}</td>
                            <td>{shift.title}</td>
                            <td>{shift.assignedTo || 'Unassigned'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              ) : (
                <p>No scheduled shift assignments found for the selected view.</p>
              )}
            </div>
          )}
          <div className="section-card">
            <h2>Quick notes</h2>
            <p>Use the menu to track schedules, inventory, cancel requests, fraud plate checks, and history by location.</p>
          </div>
        </>
      )}

      {activeTab === 'Schedule' && (
        <div>
          <div className="section-card">
            <h2>Schedule / Daily Chore Agenda</h2>
            {currentUser.role === 'Crew' ? (
              <p>Crew members can only mark chores complete. Schedule creation is restricted to Managers and Admins.</p>
            ) : (
              <div className="field-group">
                <label>
                  Title
                  <input
                    value={newSchedule.title}
                    onChange={(event) => setNewSchedule({ ...newSchedule, title: event.target.value })}
                  />
                </label>
                <label>
                  Date
                  <input
                    type="date"
                    value={newSchedule.date}
                    onChange={(event) => setNewSchedule({ ...newSchedule, date: event.target.value })}
                  />
                </label>
                <label>
                  Start time
                  <input
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(event) => setNewSchedule({ ...newSchedule, startTime: event.target.value })}
                  />
                </label>
                <label>
                  End time
                  <input
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(event) => setNewSchedule({ ...newSchedule, endTime: event.target.value })}
                  />
                </label>
                <label>
                  Type
                  <select
                    value={newSchedule.type}
                    onChange={(event) => setNewSchedule({ ...newSchedule, type: event.target.value as ScheduleItem['type'] })}
                  >
                    <option value="Shift">Shift</option>
                    <option value="Daily Chore">Daily Chore</option>
                    <option value="Extra Chore">Extra Chore</option>
                  </select>
                </label>
                <label>
                  Assigned to
                  <select
                    value={newSchedule.assignedTo}
                    onChange={(event) => setNewSchedule({ ...newSchedule, assignedTo: event.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {locationUsers.map((user) => (
                      <option key={user.id} value={user.username}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
            {currentUser.role !== 'Crew' && (
              <button className="primary" onClick={handleCreateSchedule}>
                Add schedule item
              </button>
            )}
          </div>

          <div className="section-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Notifications</h2>
              {unreadNotifications.length > 0 && (
                <button className="secondary small" onClick={markAllNotificationsRead}>
                  Mark all read
                </button>
              )}
            </div>
            {unreadNotifications.length > 0 ? (
              <ul className="notification-list">
                {unreadNotifications.map((notification) => (
                  <li key={notification.id}>
                    <strong>{notification.type}</strong>: {notification.message}
                    <div className="notification-time">{new Date(notification.timestamp).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No new notifications for this location.</p>
            )}
          </div>

          <div className="table-card">
            <h2>Shift assignments</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Title</th>
                  <th>Assigned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {shiftSchedules.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>{item.startTime || 'ΓÇö'} {item.endTime ? `ΓÇô ${item.endTime}` : ''}</td>
                    <td>{item.title}</td>
                    <td>{item.assignedTo || 'ΓÇö'}</td>
                    <td>
                      {item.done ? (
                        'Done'
                      ) : currentUser.role === 'Crew' ? (
                        'Manager/Admin only'
                      ) : (
                        <button
                          className="small"
                          onClick={() =>
                            toggleDone(
                              'schedules',
                              item.id,
                              item.done,
                              'Shift assignment',
                              `${item.title} for ${item.assignedTo}`,
                            )
                          }
                        >
                          Mark done
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {shiftSchedules.length === 0 && (
                  <tr>
                    <td colSpan={5}>No shift assignments for this location yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-card">
            <h2>Chores</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Assigned</th>
                  <th>Completed by</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {choreSchedules.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>{item.startTime || 'ΓÇö'} {item.endTime ? `ΓÇô ${item.endTime}` : ''}</td>
                    <td>{item.title}</td>
                    <td>{item.type}</td>
                    <td>{item.assignedTo || 'ΓÇö'}</td>
                    <td>
                      {item.completedBy ? (
                        <span className="badge done">Completed by {item.completedBy}</span>
                      ) : (
                        <span className="badge pending">Open</span>
                      )}
                    </td>
                    <td>
                      {!item.done ? (
                        <button
                          className="small"
                          onClick={() =>
                            toggleDone(
                              'schedules',
                              item.id,
                              item.done,
                              'Chore item',
                              `${item.title} for ${item.assignedTo}`,
                            )
                          }
                        >
                          Mark done
                        </button>
                      ) : (
                        'Done'
                      )}
                    </td>
                  </tr>
                ))}
                {choreSchedules.length === 0 && (
                  <tr>
                    <td colSpan={7}>No chores scheduled for this location yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Inventory' && (
        <div>
          <div className="section-card">
            <h2>Inventory tracking</h2>
            <div className="field-group">
              <label>
                Item name
                <input
                  value={newInventory.name}
                  onChange={(event) => setNewInventory({ ...newInventory, name: event.target.value })}
                />
              </label>
              <label>
                Quantity
                <input
                  type="number"
                  value={newInventory.quantity}
                  onChange={(event) => setNewInventory({ ...newInventory, quantity: Number(event.target.value) })}
                />
              </label>
              <label>
                Notes
                <textarea
                  value={newInventory.notes}
                  onChange={(event) => setNewInventory({ ...newInventory, notes: event.target.value })}
                />
              </label>
            </div>
            <button className="primary" onClick={handleAddInventory}>
              Add inventory item
            </button>
          </div>

          <div className="table-card">
            <h2>Inventory</h2>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.notes}</td>
                    <td>
                      <button className="small" onClick={() => handleAdjustInventory(item.id, -1)}>-</button>
                      <button className="small" onClick={() => handleAdjustInventory(item.id, 1)}>+</button>
                      <button className="small" onClick={() => handleEditInventoryQuantity(item.id)}>Edit</button>
                      <button className="small danger" onClick={() => handleDeleteInventory(item.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan={4}>No inventory items recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Cancel Requests' && (
        <div>
          <div className="section-card">
            <h2>Cancel request input</h2>
            <div className="field-group">
              <label>
                Customer name
                <input
                  value={newCancel.customerName}
                  onChange={(event) => setNewCancel({ ...newCancel, customerName: event.target.value })}
                />
              </label>
              <label>
                License plate
                <input
                  value={newCancel.licensePlate}
                  onChange={(event) => setNewCancel({ ...newCancel, licensePlate: event.target.value })}
                />
              </label>
              <label>
                Reason
                <textarea
                  value={newCancel.reason}
                  onChange={(event) => setNewCancel({ ...newCancel, reason: event.target.value })}
                />
              </label>
            </div>
            <button className="primary" onClick={handleAddCancel}>
              Add cancel request
            </button>
          </div>

          <div className="table-card">
            <h2>Cancel requests</h2>
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Plate</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cancelRequests.map((item) => (
                  <tr key={item.id}>
                    <td>{item.customerName}</td>
                    <td>{item.licensePlate}</td>
                    <td>{item.reason}</td>
                    <td>
                      <button
                        className="small"
                        onClick={() =>
                          toggleDone(
                            'cancelRequests',
                            item.id,
                            item.done,
                            'Cancel request',
                            `${item.customerName} / ${item.licensePlate}`,
                          )
                        }
                      >
                        {item.done ? 'Done' : 'Mark done'}
                      </button>
                    </td>
                  </tr>
                ))}
                {cancelRequests.length === 0 && (
                  <tr>
                    <td colSpan={4}>No cancel requests at this location.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Fraud Plate Check' && (
        <div>
          <div className="section-card">
            <h2>Fraud plate check</h2>
            <div className="field-group">
              <label>
                Customer name
                <input
                  value={newFraud.customerName}
                  onChange={(event) => setNewFraud({ ...newFraud, customerName: event.target.value })}
                />
              </label>
              <label>
                License plate
                <input
                  value={newFraud.licensePlate}
                  onChange={(event) => setNewFraud({ ...newFraud, licensePlate: event.target.value })}
                />
              </label>
              <label>
                Location member at
                <select
                  value={newFraud.location}
                  onChange={(event) => setNewFraud({ ...newFraud, location: event.target.value })}
                >
                  <option value="">Select location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.name}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Notes
                <textarea value={newFraud.note} onChange={(event) => setNewFraud({ ...newFraud, note: event.target.value })} />
              </label>
            </div>
            <button className="primary" onClick={handleAddFraud}>
              Add fraud check
            </button>
          </div>

          <div className="section-card">
            <label>
              Search plates or names
              <input
                value={fraudSearch}
                onChange={(event) => setFraudSearch(event.target.value)}
                placeholder="Search license plate, customer, location, membership"
              />
            </label>
          </div>

          <div className="table-card">
            <h2>Fraud plate records</h2>
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Plate</th>
                  <th>Location</th>
                  <th>Membership</th>
                  <th>Status</th>
                  <th>Note</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedFraudChecks.map((item) => (
                  <tr key={item.id}>
                    <td>{item.customerName}</td>
                    <td>{item.licensePlate}</td>
                    <td>{item.location}</td>
                    <td>{item.membership || 'ΓÇö'}</td>
                    <td>{item.done ? (item.active ? 'Active' : 'Not Active') : 'Open'}</td>
                    <td>{item.note}</td>
                    <td>
                      {!item.done ? (
                        <button className="small" onClick={() => finalizeFraudCheck(item.id)}>
                          Mark done
                        </button>
                      ) : (
                        'Resolved'
                      )}
                    </td>
                  </tr>
                ))}
                {displayedFraudChecks.length === 0 && (
                  <tr>
                    <td colSpan={7}>No fraud plate checks match the search or records are empty.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'History' && (
        <div className="table-card">
          <h2>History</h2>
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Details</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.label}</td>
                  <td>{entry.details}</td>
                  <td>{new Date(entry.timestamp).toLocaleString()}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={3}>No history entries available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Admin' && currentUser.role === 'Admin' && (
        <div>
          <div className="section-card">
            <h2>Create location</h2>
            <div className="field-group">
              <label>
                New location name
                <input value={newLocationName} onChange={(event) => setNewLocationName(event.target.value)} />
              </label>
              <label>
                Low inventory threshold
                <input
                  type="number"
                  min={0}
                  value={newLocationThreshold}
                  onChange={(event) => setNewLocationThreshold(Number(event.target.value))}
                />
              </label>
            </div>
            <button className="primary" onClick={handleCreateLocation}>
              Add location
            </button>
          </div>

          <div className="section-card">
            <h2>Create user</h2>
            <div className="field-group">
              <label>
                Username
                <input value={newUser.username} onChange={(event) => setNewUser({ ...newUser, username: event.target.value })} />
              </label>
              <label>
                Password
                <input type="password" value={newUser.password} onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} />
              </label>
              <label>
                Role
                <select
                  value={newUser.role}
                  onChange={(event) => {
                    const role = event.target.value as Role;
                    setNewUser({
                      ...newUser,
                      role,
                      permissions: getDefaultPermissions(role),
                    });
                  }}
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Crew">Crew</option>
                </select>
              </label>
              <label>
                Location
                <select value={newUser.locationId} onChange={(event) => setNewUser({ ...newUser, locationId: event.target.value })}>
                  <option value="">Select location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="section-card">
              <h3>Permissions</h3>
              <div className="field-group">
                {permissionOptions.map((option) => (
                  <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={newUser.permissions?.includes(option.value) ?? false}
                      onChange={(event) => {
                        const permission = option.value;
                        const currentPermissions = newUser.permissions ?? [];
                        const updatedPermissions = event.target.checked
                          ? [...currentPermissions, permission]
                          : currentPermissions.filter((value) => value !== permission);
                        setNewUser({ ...newUser, permissions: updatedPermissions });
                      }}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
            <button className="primary" onClick={handleCreateUser}>
              Create user
            </button>
          </div>

          <div className="section-card">
            <h2>Location thresholds</h2>
            <div className="field-group">
              {locations.map((location) => (
                <label key={location.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {location.name}
                  <input
                    type="number"
                    min={0}
                    value={locationThresholdEdits[location.id] ?? location.lowInventoryThreshold ?? 5}
                    onChange={(event) => {
                      const threshold = Number(event.target.value);
                      setLocationThresholdEdits((prev) => ({ ...prev, [location.id]: threshold }));
                    }}
                  />
                  <button
                    className="secondary small"
                    onClick={async () => {
                      const threshold = locationThresholdEdits[location.id] ?? location.lowInventoryThreshold ?? 5;
                      const updatedLocations = locations.map((loc) =>
                        loc.id === location.id ? { ...loc, lowInventoryThreshold: threshold } : loc,
                      );
                     await syncLocationsToFirebase(updatedLocations);

saveLocations(updatedLocations);
setLocations(updatedLocations);

setLocationThresholdEdits((prev) => {
  const next = { ...prev };
  delete next[location.id];
  return next;
});
                      createHistoryEntry(
                        'Location threshold updated',
                        `${location.name} low inventory threshold set to ${threshold}`,
                        location.id,
                      );
                    }}
                  >
                    Save
                  </button>
                </label>
              ))}
            </div>
          </div>

          <div className="table-card">
            <h2>Accounts</h2>
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Permissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.role}</td>
                    <td>{locations.find((loc) => loc.id === user.locationId)?.name || 'Unknown'}</td>
                    <td>{getPermissionsForUser(user).join(', ')}</td>
                    <td>
                      <button className="small" onClick={() => handleEditUser(user)}>
                        Edit
                      </button>
                      <button className="small danger" onClick={() => handleDeleteUser(user.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5}>No users set up yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
