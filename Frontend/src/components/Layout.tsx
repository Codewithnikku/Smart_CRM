import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
const titles: Record<string, {
    title: string;
    subtitle: string;
}> = {
    "/": { title: "Dashboard", subtitle: "A live view of your sales performance and KPIs." },
    "/customers": { title: "Customers", subtitle: "Manage accounts and monitor churn risk signals." },
    "/pipeline": { title: "Lead Pipeline", subtitle: "Visual flow from first touch to closed-won." },
    "/deals": { title: "Deals", subtitle: "Track active opportunities and expected revenue." },
    "/tasks": { title: "Tasks", subtitle: "Follow-ups, priorities, and automated reminders." },
};
export default function Layout() {
    const { pathname } = useLocation();
    const key = Object.keys(titles).find((k) => (k === "/" && pathname === "/") || (k !== "/" && pathname.startsWith(k))) ?? "/";
    const page = titles[key];
    return (<div className="min-h-screen flex bg-ink-50 font-sans transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 px-8 py-6 overflow-auto">
          <div className="mb-6 animate-slide-up">
            <h1 className="font-display text-3xl md:text-4xl text-ink-900 tracking-tight dark:text-slate-100">
              {page.title}
            </h1>
            <p className="text-ink-500 mt-1 dark:text-slate-400">{page.subtitle}</p>
          </div>
          <Outlet />
        </main>
      </div>
    </div>);
}
