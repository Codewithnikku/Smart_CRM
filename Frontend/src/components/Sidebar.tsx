import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, GitBranch, BriefcaseBusiness, CheckSquare, Sparkles, TrendingUp, } from "lucide-react";
import { clsx } from "clsx";
import { useCRMStore } from "@/store/crmStore";
const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/customers", label: "Customers", icon: Users },
    { to: "/pipeline", label: "Pipeline", icon: GitBranch },
    { to: "/deals", label: "Deals", icon: BriefcaseBusiness },
    { to: "/tasks", label: "Tasks", icon: CheckSquare },
];
export default function Sidebar() {
    const openTasks = useCRMStore((s) => s.getOpenTasksCount());
    const atRisk = useCRMStore((s) => s.getAtRiskCustomers().length);
    return (<aside className="w-64 shrink-0 h-screen sticky top-0 border-r border-ink-200/80 bg-white/70 backdrop-blur-xl flex flex-col dark:border-slate-700 dark:bg-slate-900/70">
      <div className="h-16 px-6 flex items-center gap-3 border-b border-ink-200/80 dark:border-slate-700">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 shadow-glow flex items-center justify-center text-white">
          <Sparkles className="w-5 h-5"/>
        </div>
        <div>
          <div className="font-display text-xl leading-none text-brand-700 dark:text-brand-300">Smart CRM</div>
          <div className="text-[11px] uppercase tracking-widest text-ink-500 mt-0.5 dark:text-slate-400">
            Sales Console
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (<NavLink key={item.to} to={item.to} end={item.to === "/"} className={({ isActive }) => clsx("group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 animate-stagger", isActive
                    ? "bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-soft"
                    : "text-ink-700 hover:bg-ink-100/80 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-brand-300")} style={{ animationDelay: `${idx * 40}ms` }}>
              <span className="flex items-center gap-3">
                <Icon className="w-[18px] h-[18px]"/>
                {item.label}
              </span>
              {item.label === "Tasks" && openTasks > 0 && (<span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white">
                  {openTasks}
                </span>)}
              {item.label === "Customers" && atRisk > 0 && (<span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 group-hover:bg-white/20 group-hover:text-white">
                  {atRisk}
                </span>)}
            </NavLink>);
        })}
      </nav>

      <div className="mx-3 mb-4 p-4 rounded-2xl relative overflow-hidden gradient-mesh-brand grain-overlay border border-ink-200/60 dark:border-slate-700">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-brand-700">
            <TrendingUp className="w-4 h-4"/>
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Target</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-display text-brand-800">72%</span>
              <span className="text-xs text-ink-500">of ₹1.1M goal</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-white/70 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-500 transition-all duration-700" style={{ width: "72%" }}/>
            </div>
          </div>
        </div>
      </div>
    </aside>);
}
