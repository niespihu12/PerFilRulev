"use client";

import { useMemo } from "react";
import { collection, query } from "firebase/firestore";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";

import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { type Transaction } from "@/lib/types";

export default function TransactionsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const transactionsQuery = useMemoFirebase(
    () =>
      user
        ? query(collection(firestore, "users", user.uid, "transactions"))
        : null,
    [firestore, user]
  );

  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);

  const sortedTransactions = useMemo(() => {
    if (!transactions) return [];
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold mb-4">Todas las Transacciones</h1>
      {isLoading ? (
        <p>Cargando transacciones...</p>
      ) : (
        <RecentTransactions transactions={sortedTransactions} />
      )}
    </div>
  );
}
