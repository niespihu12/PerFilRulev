"use client"

import { useState, useEffect } from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { useUser } from "@/firebase"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Header } from "@/components/dashboard/header"
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog"
import { type Transaction } from "@/lib/types"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const [isAddTransactionOpen, setAddTransactionOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/")
    }
  }, [user, isUserLoading, router])

  if (!isClient || isUserLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const handleAddTransaction = (newTransaction: Transaction) => {
    // This is a placeholder, actual logic is in the dialog.
  }

  return user ? (
    <>
      <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <SidebarNav />
          </div>
        </aside>
        <div className="flex flex-col">
          <Header onAddTransaction={() => setAddTransactionOpen(true)} />
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
      <AddTransactionDialog
        isOpen={isAddTransactionOpen}
        setIsOpen={setAddTransactionOpen}
        onTransactionAdded={handleAddTransaction}
      />
    </>
  ) : null
}
