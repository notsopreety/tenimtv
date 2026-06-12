"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tv, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setTimeout(() => setTheme("light"), 0);
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const navItems = [
    { name: "Live Events", shortName: "Events", href: "/" },
    { name: "Football", shortName: "Football", href: "/football" },
    { name: "Cricket", shortName: "Cricket", href: "/cricket" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 transition-colors duration-200">
      <div className="mx-auto flex max-w-4xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-md dark:shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
            <Tv className="h-5 w-5 text-black stroke-[2.5]" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            TENIM<span className="text-emerald-500 dark:text-emerald-400 font-extrabold">TV</span>
          </span>
        </Link>

        {/* Navigation & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="flex items-center gap-0.5 sm:gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 rounded-lg ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5"
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 w-full h-full bg-emerald-500/5 dark:bg-emerald-500/10 rounded-lg -z-10 border border-emerald-500/10 dark:border-emerald-500/20" />
                  )}
                  <span className="hidden min-[480px]:inline">{item.name}</span>
                  <span className="inline min-[480px]:hidden">{item.shortName}</span>
                </Link>
              );
            })}
          </nav>

          {/* Vertical divider */}
          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 shrink-0" />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer shrink-0 relative z-30 pointer-events-auto"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-zinc-700" />
            )}
          </button>

          {/* Live Indicator Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">LIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
