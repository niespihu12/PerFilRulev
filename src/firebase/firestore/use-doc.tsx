"use client";

import {
  doc,
  onSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirestore } from "../provider";

export function useDoc<T>(path: string, id: string) {
  const firestore = useFirestore();
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore) return;

    const docRef = doc(firestore, path, id);

    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as unknown as T);
          setError(null);
        } else {
          setData(undefined);
        }
      },
      (err) => {
        console.error(err);
        setError(err);
      }
    );

    return () => unsubscribe();
  }, [firestore, path, id]);

  return { data, error };
}
