import { Shield, Mail } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-950 py-12 mt-auto transition-colors duration-200">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                TENIM<span className="text-emerald-500 dark:text-emerald-400 font-extrabold">TV</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-xs leading-relaxed">
              Live sports streaming directory for football and cricket matches.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 tracking-wider uppercase">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">All Events</Link>
              </li>
              <li>
                <Link href="/football" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Football Streams</Link>
              </li>
              <li>
                <Link href="/cricket" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Cricket Streams</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 tracking-wider uppercase">Contact & Support</h4>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-xs leading-relaxed">
              Facing streaming issues or have feedback? Reach out to our technical team.
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>forapibysamir@gmail.com</span>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-zinc-200 dark:border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-600">
            &copy; {new Date().getFullYear()} TENIMTV. All rights reserved. We do not host any videos on our servers.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-650 italic text-center md:text-right">
            <Shield className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-700 shrink-0" />
            <span>For copyright issues, please direct legal actions directly to the stream hosting providers.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
