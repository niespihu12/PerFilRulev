"use client";

import {
  collection,
  onSnapshot,
  query,
  where,
  type DocumentData,
  type Query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirestore } from "../provider";

export function useCollection<T>(path: string, field?: string, value?: string) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[]>();
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore) return;

    let q: Query<DocumentData>;

    if (field && value) {
      q = query(collection(firestore, path), where(field, "==", value));
    } else {
      q = query(collection(firestore, path));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as unknown as T)
        );
        setData(docs);
        setError(null);
      },
      (err) => {
        console.error(err);
        setError(err);
      }
    );

    return () => unsubscribe();
  }, [firestore, path, field, value]);

  return { data, error };
}
