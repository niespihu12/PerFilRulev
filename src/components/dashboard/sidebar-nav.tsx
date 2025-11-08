import Link from "next/link"
import {
  Home,
  LineChart,
  Settings,
  Wallet,
} from "lucide-react"
import { Logo } from "../logo"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function SidebarNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Panel" },
    { href: "/dashboard/transactions", icon: Wallet, label: "Transacciones" },
    { href: "/dashboard/reports", icon: LineChart, label: "Reportes" },
  ]

  return (
    <>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Logo />
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                pathname === href && "bg-muted text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
         <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              href="/dashboard/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                pathname === "/dashboard/settings" && "bg-muted text-primary"
              )}
            >
              <Settings className="h-4 w-4" />
              Configuración
            </Link>
         </nav>
      </div>
    </>
  )
}
