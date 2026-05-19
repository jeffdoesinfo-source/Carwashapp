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
} from './utils/storage';
import type {
  CancelRequest,
  FraudCheck,
  HistoryEntry,
  InventoryItem,
  LocationItem,
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
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [locationsLoaded, setLocationsLoaded] = useState(false);
  const [defaultAdminSeeded, setDefaultAdminSeeded] = useState(false);

  const appLocationId = useMemo(() => {
    if (!currentUser) return '';
    return currentUser.role === 'Admin' ? selectedLocationId || currentUser.locationId : currentUser.locationId;
  }, [currentUser, selectedLocationId]);

  const locationUsers = useMemo(
    () => users.filter((item) => item.locationId === appLocationId),
    [users, appLocationId],
  );

  useEffect(() => {
    const loadAll = async () => {
      const storedUsers = await loadLocalUsersAsync();
      setUsers(storedUsers);
      setUsersLoaded(true);

      // Load all data from local storage (sync)
      setLocations(loadLocations());
      setInventory(loadInventory());
      setSchedules(loadSchedules());
      setCancelRequests(loadCancelRequests());
      setFraudChecks(loadFraudChecks());
      setHistory(loadHistory());
      setLocationsLoaded(true);
    };

    void loadAll();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setInventory([]);
      setSchedules([]);
      setCancelRequests([]);
      setHistory([]);
      return;
    }

    // Filter data by location for non-admin users
    const locationId = appLocationId;
    if (!locationId) return;

    const allInventory = loadInventory();
    const allSchedules = loadSchedules();
    const allCancelRequests = loadCancelRequests();
    const allHistory = loadHistory();

    if (currentUser.role === 'Admin') {
      setInventory(allInventory);
      setSchedules(allSchedules);
      setCancelRequests(allCancelRequests);
      setHistory(allHistory);
    } else {
      setInventory(allInventory.filter(item => item.locationId === locationId));
      setSchedules(allSchedules.filter(item => item.locationId === locationId));
      setCancelRequests(allCancelRequests.filter(item => item.locationId === locationId));
      setHistory(allHistory.filter(item => item.locationId === locationId));
    }
  }, [currentUser, appLocationId]);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'Admin') {
      setSelectedLocationId(locations[0]?.id || currentUser.locationId);
    } else {
      setSelectedLocationId(currentUser.locationId);
    }
  }, [currentUser, locations]);

  useEffect(() => {
    if (defaultAdminSeeded) return;
    if (users.length > 0) return;

      const seedDefaultAdmin = async () => {
      const locationId = locations[0]?.id || localDefaultLocation.id;
      const seededUser: User = {
        id: generateId(),
        username: 'JeffArmstrong',
        password: 'ArmstrongFam2024!',
        role: 'Admin',
        locationId,
      };

      setUsers([seededUser]);
      await saveLocalUsersAsync([seededUser]);
      if (locations.length === 0) {
        const defaultLocations = [localDefaultLocation];
        setLocations(defaultLocations);
        saveLocations(defaultLocations);
        setLocationsLoaded(true);
      }
      setDefaultAdminSeeded(true);
    };

    void seedDefaultAdmin();
  }, [defaultAdminSeeded, users.length, locations]);

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

  const handleLogin = async () => {
    if (!usersLoaded) {
      setLoginError('Please wait while user data is loading.');
      return;
    }

    setLoginError('');
    setStatusMessage('Signing in...');

    const matchedUser = users.find(
      (user) => user.username === loginUsername.trim() && user.password === loginPassword,
    );

    if (!matchedUser) {
      setLoginError('Invalid username or password');
      setStatusMessage('');
      return;
    }

    setCurrentUser(matchedUser);
    setStatusMessage('');
    setActiveTab('Dashboard');
  };

  const signOut = () => {
    setCurrentUser(null);
    setLoginUsername('');
    setLoginPassword('');
    setLoginError('');
    setActiveTab('Dashboard');
  };

  const [newSchedule, setNewSchedule] = useState({ title: '', date: '', type: 'Shift' as ScheduleItem['type'], assignedTo: '' });
  const [newInventory, setNewInventory] = useState({ name: '', quantity: 0, notes: '' });
  const [newCancel, setNewCancel] = useState({ customerName: '', licensePlate: '', reason: '' });
  const [newFraud, setNewFraud] = useState({ customerName: '', licensePlate: '', location: '', note: '' });
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'Crew' as Role, locationId: '', permissions: getDefaultPermissions('Crew') });
  const [newLocationName, setNewLocationName] = useState('');

  useEffect(() => {
    if (!newUser.locationId && locations.length > 0) {
      setNewUser((prev) => ({ ...prev, locationId: locations[0].id }));
    }
  }, [locations, newUser.locationId]);

  const appLocation = locations.find((item) => item.id === appLocationId);

  const handleCreateSchedule = async () => {
    if (!currentUser || !appLocationId || !newSchedule.title || !newSchedule.date) return;

    const newItem: ScheduleItem = {
      id: generateId(),
      ...newSchedule,
      locationId: appLocationId,
      done: false,
    };

    const currentSchedules = loadSchedules();
    const updatedSchedules = [...currentSchedules, newItem];
    saveSchedules(updatedSchedules);
    setSchedules(updatedSchedules);

    createHistoryEntry('Schedule added', `${newSchedule.title} for ${newSchedule.assignedTo || 'unassigned'}`, appLocationId);
    setNewSchedule({ title: '', date: '', type: 'Shift', assignedTo: '' });
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
    saveInventory(updatedInventory);
    setInventory(updatedInventory);

    createHistoryEntry('Inventory added', `${newInventory.name} x${newInventory.quantity}`, appLocationId);
    setNewInventory({ name: '', quantity: 0, notes: '' });
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
      createdAt: new Date().toISOString(),
    };

    const currentFraudChecks = loadFraudChecks();
    const updatedFraudChecks = [...currentFraudChecks, newItem];
    saveFraudChecks(updatedFraudChecks);
    setFraudChecks(updatedFraudChecks);

    createHistoryEntry('Fraud plate check added', `${newFraud.customerName} / ${newFraud.licensePlate}`, appLocationId || currentUser.locationId);
    setNewFraud({ customerName: '', licensePlate: '', location: '', note: '' });
  };

  const handleCreateUser = async () => {
    if (!currentUser || currentUser.role !== 'Admin' || !newUser.username || !newUser.password || !newUser.locationId) return;
    setActionMessage('');
    const created: User = {
      id: generateId(),
      username: newUser.username.trim(),
      password: newUser.password,
      role: newUser.role,
      locationId: newUser.locationId,
      permissions: newUser.permissions,
    };
    const updatedUsers = [...users, created];
    setUsers(updatedUsers);
    await saveLocalUsersAsync(updatedUsers);

    createHistoryEntry('User created', `${newUser.username} as ${newUser.role}`, newUser.locationId);
    setActionMessage('New user account created successfully.');

    setNewUser({ username: '', password: '', role: 'Crew', locationId: locations[0]?.id || '', permissions: getDefaultPermissions('Crew') });
  };

  const handleCreateLocation = async () => {
    if (!currentUser || currentUser.role !== 'Admin' || !newLocationName) return;

    const newLocation: LocationItem = {
      id: generateId(),
      name: newLocationName,
    };

    const currentLocations = loadLocations();
    const updatedLocations = [...currentLocations, newLocation];
    saveLocations(updatedLocations);
    setLocations(updatedLocations);

    createHistoryEntry('Location added', newLocationName, newLocation.id);
    setNewLocationName('');
  };

  const toggleDone = async (collectionName: string, itemId: string, currentValue: boolean, label: string, details: string) => {
    if (collectionName === 'schedules') {
      const currentSchedules = loadSchedules();
      const updatedSchedules = currentSchedules.map(item =>
        item.id === itemId ? { ...item, done: !currentValue } : item
      );
      saveSchedules(updatedSchedules);
      setSchedules(updatedSchedules);
    } else if (collectionName === 'cancelRequests') {
      const currentCancelRequests = loadCancelRequests();
      const updatedCancelRequests = currentCancelRequests.map(item =>
        item.id === itemId ? { ...item, done: !currentValue } : item
      );
      saveCancelRequests(updatedCancelRequests);
      setCancelRequests(updatedCancelRequests);
    }

    createHistoryEntry(`${label} updated`, details, appLocationId);
  };

  const availableTabs = tabs.filter((tab) => {
    if (!currentUser) return false;
    return hasPermission(currentUser, tabPermissionMap[tab]);
  });

  useEffect(() => {
    if (!currentUser) return;
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0] || 'Dashboard');
    }
  }, [availableTabs, activeTab, currentUser]);

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
              Username
              <input value={loginUsername} onChange={(event) => setLoginUsername(event.target.value)} />
            </label>
            <label>
              Password
              <input type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} />
            </label>
          </div>
          {loginError && <div className="alert">{loginError}</div>}
          <button className="primary" onClick={handleLogin} disabled={!usersLoaded}>
            {usersLoaded ? 'Sign In' : 'Loading...'}
          </button>
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
          </div>
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
            <button className="primary" onClick={handleCreateSchedule}>
              Add schedule item
            </button>
          </div>

          <div className="table-card">
            <h2>Upcoming schedule</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Assigned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>{item.title}</td>
                    <td>{item.type}</td>
                    <td>{item.assignedTo || '—'}</td>
                    <td>
                      <button
                        className="small"
                        onClick={() =>
                          toggleDone(
                            'schedules',
                            item.id,
                            item.done,
                            'Schedule item',
                            `${item.title} for ${item.assignedTo}`,
                          )
                        }
                      >
                        {item.done ? 'Done' : 'Mark done'}
                      </button>
                    </td>
                  </tr>
                ))}
                {schedules.length === 0 && (
                  <tr>
                    <td colSpan={5}>No schedule items for this location yet.</td>
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
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.notes}</td>
                  </tr>
                ))}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan={3}>No inventory items recorded yet.</td>
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

          <div className="table-card">
            <h2>Fraud plate records</h2>
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Plate</th>
                  <th>Location</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {fraudChecks.map((item) => (
                  <tr key={item.id}>
                    <td>{item.customerName}</td>
                    <td>{item.licensePlate}</td>
                    <td>{item.location}</td>
                    <td>{item.note}</td>
                  </tr>
                ))}
                {fraudChecks.length === 0 && (
                  <tr>
                    <td colSpan={4}>No fraud plate checks yet.</td>
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

          <div className="table-card">
            <h2>Accounts</h2>
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Permissions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.role}</td>
                    <td>{locations.find((loc) => loc.id === user.locationId)?.name || 'Unknown'}</td>
                    <td>{getPermissionsForUser(user).join(', ')}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={3}>No users set up yet.</td>
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
