"use client";

import { useMemo } from "react";
import { initializeFirebase } from ".";
import { FirebaseProvider } from "./provider";

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const firebaseApp = useMemo(() => initializeFirebase(), []);

  return <FirebaseProvider {...firebaseApp}>{children}</FirebaseProvider>;
}
