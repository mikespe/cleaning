"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HardHat,
  Home,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";

const navigation = [
  { name: "Today", href: "/portal", icon: Home },
  { name: "Schedule", href: "/portal/schedule", icon: Calendar },
  { name: "Profile", href: "/portal/profile", icon: User },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    };

    getProfile();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20 lg:pb-0">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/portal" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600">
            <HardHat className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-slate-100">Garden State</span>
        </Link>
        <div className="flex items-center gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100">
            <Bell className="h-5 w-5" />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="fixed inset-x-0 top-16 z-30 border-b border-slate-800 bg-slate-900 p-4 lg:hidden">
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-slate-800/50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600/20 font-semibold text-orange-500">
              {profile?.full_name?.charAt(0) || "W"}
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-100">
                {profile?.full_name || "Worker"}
              </p>
              <p className="text-xs text-slate-500">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-400 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-slate-800 bg-slate-900 lg:block">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-slate-800 px-6">
          <Link href="/portal" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600">
              <HardHat className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-100">Garden State</span>
              <span className="ml-1 text-xs text-orange-500">PORTAL</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/portal" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-orange-600/20 text-orange-500"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600/20 font-semibold text-orange-500">
              {profile?.full_name?.charAt(0) || "W"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-100">
                {profile?.full_name || "Worker"}
              </p>
              <p className="truncate text-xs text-slate-500">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="min-h-[calc(100vh-4rem)] p-4 lg:p-6">{children}</main>
      </div>

      {/* Mobile Bottom Navigation - Instagram/TikTok style */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl lg:hidden safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/portal" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-6 py-2 transition-colors",
                  isActive ? "text-orange-500" : "text-slate-500"
                )}
              >
                <item.icon className={cn("h-6 w-6", isActive && "scale-110")} />
                <span className="text-[10px] font-medium">{item.name}</span>
                {isActive && (
                  <div className="absolute bottom-1 h-1 w-1 rounded-full bg-orange-500" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
