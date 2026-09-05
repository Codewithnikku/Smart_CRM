import { Search, Bell, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCRMStore } from "@/store/crmStore";
import { useTheme } from "@/hooks/useTheme";
import AdminPanel from "@/components/AdminPanel";

export default function Topbar() {
    const navigate = useNavigate();
    const currentUser = useCRMStore((s) => s.currentUser);
    const logout = useCRMStore((s) => s.logout);
    const { theme, toggleTheme } = useTheme();
    if (!currentUser) {
        return null;
    }
    const initials = currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2);
    return (<header className="h-16 shrink-0 px-8 flex items-center justify-between border-b border-ink-200/80 bg-white/60 backdrop-blur-xl sticky top-0 z-20 dark:border-slate-700 dark:bg-slate-900/60">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 dark:text-slate-400"/>
          <input type="text" placeholder="Search customers, leads, deals, or tasks…" className="w-full h-10 pl-10 pr-4 rounded-xl bg-ink-100/70 border border-transparent focus:border-brand-300 focus:bg-white focus:outline-none text-sm placeholder:text-ink-400 transition-all dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-900"/>
        </div>
      </div>

      <div className="ml-8 flex items-center gap-2">
        <button className="w-10 h-10 rounded-xl flex items-center justify-center text-ink-600 hover:bg-ink-100 hover:text-brand-700 transition-colors dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-brand-300">
          <Calendar className="w-[18px] h-[18px]"/>
        </button>
        <button className="relative w-10 h-10 rounded-xl flex items-center justify-center text-ink-600 hover:bg-ink-100 hover:text-brand-700 transition-colors dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-brand-300">
          <Bell className="w-[18px] h-[18px]"/>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent-500 ring-2 ring-white dark:ring-slate-900"/>
        </button>
        <AdminPanel theme={theme} toggleTheme={toggleTheme} />

        <button type="button" onClick={() => navigate("/profile")} className="ml-2 pl-4 border-l border-ink-200 flex items-center gap-3 transition hover:opacity-90 dark:border-slate-700">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-soft" style={{ backgroundColor: currentUser.avatarColor }}>
            {initials}
          </div>
          <div className="leading-tight text-left">
            <div className="text-sm font-semibold text-ink-800 dark:text-slate-100">{currentUser.name}</div>
            <div className="text-xs text-ink-500 dark:text-slate-400">{currentUser.role}</div>
          </div>
        </button>
        <button type="button" onClick={logout} className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          Sign out
        </button>
      </div>
    </header>);
}
