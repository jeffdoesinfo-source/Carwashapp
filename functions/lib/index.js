"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.createUser = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
/**
 * Callable function for admins to create new users.
 * Input: { email, password, username, role, locationId, permissions }
 * Returns: { uid, profile }
 */
exports.createUser = functions.region('us-central1').https.onCall(async (data, context) => {
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
        ...(Array.isArray(locationIds) ? locationIds.map((id) => String(id).trim()) : []),
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
    }
    catch (err) {
        console.error('createUser error', err);
        throw new functions.https.HttpsError('internal', 'Failed to create user.');
    }
});
/**
 * Callable function for admins to delete a user's Auth account and profile.
 * Input: { uid }
 */
exports.deleteUser = functions.region('us-central1').https.onCall(async (data, context) => {
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
        }
        catch (err) {
            if (err?.code !== 'auth/user-not-found')
                throw err;
        }
        await admin.firestore().doc(`users/${uid}`).delete();
        return { uid };
    }
    catch (err) {
        console.error('deleteUser error', err);
        throw new functions.https.HttpsError('internal', 'Failed to delete user.');
    }
});
