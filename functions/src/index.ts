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

  const { email, password, username, role, locationId, permissions } = data || {};
  if (!email || !password || !username || !role || !locationId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required user creation fields.');
  }

  try {
    const userRecord = await admin.auth().createUser({
      email: String(email),
      password: String(password),
      displayName: String(username),
    });

    const uid = userRecord.uid;
    const profile = {
      id: uid,
      username: String(username),
      role: String(role),
      locationId: String(locationId),
      permissions: permissions || [],
    };

    await admin.firestore().doc(`users/${uid}`).set(profile);

    return { uid, profile };
  } catch (err) {
    console.error('createUser error', err);
    throw new functions.https.HttpsError('internal', 'Failed to create user.');
  }
});
