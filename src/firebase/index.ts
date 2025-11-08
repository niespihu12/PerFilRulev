import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { firebaseConfig } from "./config";
import { useCollection } from "./firestore/use-collection";
import { useDoc } from "./firestore/use-doc";
import { useUser } from "./auth/use-user";
import { FirebaseProvider } from "./provider";
import { FirebaseClientProvider } from "./client-provider";

export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} {
  const firebaseApp = !getApps().length
    ? initializeApp(firebaseConfig)
    : getApp();
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  return { firebaseApp, auth, firestore };
}

export { FirebaseProvider, FirebaseClientProvider };
export { useCollection, useDoc, useUser };
export {
  useFirebase,
  useFirebaseApp,
  useAuth,
  useFirestore,
} from "./provider";
