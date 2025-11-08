'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  // In a production environment (deployed on Firebase App Hosting),
  // initializeApp() can be called without arguments to use the auto-configured
  // environment variables. In all other cases (like local development),
  // we must pass the explicit firebaseConfig object.
  const isProduction = process.env.NODE_ENV === 'production';
  const firebaseApp = isProduction
    ? initializeApp()
    : initializeApp(firebaseConfig);

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
export * from './auth/use-user';
