import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

/**
 * Callable function for admins to create new users.
 * Input: { email, password, username, role, locationId, permissions }
 * Returns: { uid, profile }
 */
export const createUser = functions.region('us-central1').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const callerUid = context.auth.uid;

  // Verify caller is an admin by reading Firestore users/{callerUid}
  const callerSnap = await admin.firestore().doc(`users/${callerUid}`).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError('permission-denied', 'Caller profile missing.');
  }
  const callerData = callerSnap.data();
  if (!callerData || callerData.role !== 'Admin') {
    throw new functions.https.HttpsError('permission-denied', 'Caller must be an Admin.');
  }

  const { email, password, username, role, locationId, locationIds, permissions } = data || {};
  const normalizedEmail = String(email || '').trim();
  const normalizedPassword = String(password || '');
  const normalizedUsername = String(username || '').trim();
  const normalizedLocationIds = Array.from(new Set([
    String(locationId || '').trim(),
    ...(Array.isArray(locationIds) ? locationIds.map((id: unknown) => String(id).trim()) : []),
  ].filter(Boolean)));

  if (!normalizedEmail || !normalizedPassword || !role || !locationId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required user creation fields.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide a valid email address.');
  }

  if (normalizedPassword.length < 8) {
    throw new functions.https.HttpsError('invalid-argument', 'Password must be at least 8 characters.');
  }

  const locationSnaps = await Promise.all(normalizedLocationIds.map((id) => admin.firestore().doc(`locations/${id}`).get()));
  if (locationSnaps.some((snapshot) => !snapshot.exists)) {
    throw new functions.https.HttpsError('invalid-argument', 'One or more selected Firebase locations do not exist.');
  }

  try {
    const userRecord = await admin.auth().createUser({
      email: normalizedEmail,
      password: normalizedPassword,
      ...(normalizedUsername ? { displayName: normalizedUsername } : {}),
      emailVerified: false,
    });

    const uid = userRecord.uid;
    const profile = {
      id: uid,
      username: normalizedUsername,
      role: String(role),
      locationId: String(locationId),
      locationIds: String(role) === 'Manager' ? normalizedLocationIds : [],
      permissions: permissions || [],
    };

    await admin.firestore().doc(`users/${uid}`).set(profile);

    return { uid, profile };
  } catch (err) {
    console.error('createUser error', err);
    throw new functions.https.HttpsError('internal', 'Failed to create user.');
  }
});

/**
 * Callable function for admins to delete a user's Auth account and profile.
 * Input: { uid }
 */
export const deleteUser = functions.region('us-central1').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const callerSnap = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  const callerData = callerSnap.data();
  if (!callerSnap.exists || !callerData || callerData.role !== 'Admin') {
    throw new functions.https.HttpsError('permission-denied', 'Caller must be an Admin.');
  }

  const uid = String(data?.uid || '').trim();
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'A user UID is required.');
  }
  if (uid === context.auth.uid) {
    throw new functions.https.HttpsError('failed-precondition', 'You cannot delete the currently signed-in account.');
  }

  try {
    try {
      await admin.auth().deleteUser(uid);
    } catch (err: any) {
      if (err?.code !== 'auth/user-not-found') throw err;
    }
    await admin.firestore().doc(`users/${uid}`).delete();
    return { uid };
  } catch (err) {
    console.error('deleteUser error', err);
    throw new functions.https.HttpsError('internal', 'Failed to delete user.');
  }
});
