import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, Building2, Mail, ShieldCheck, Sparkles, UserRound, Wallet2 } from "lucide-react";
import { useCRMStore } from "@/store/crmStore";

export default function UserProfile() {
    const navigate = useNavigate();
    const currentUser = useCRMStore((s) => s.currentUser);
    const logout = useCRMStore((s) => s.logout);
    const customers = useCRMStore((s) => s.customers);
    const deals = useCRMStore((s) => s.deals);
    const leads = useCRMStore((s) => s.leads);
    const tasks = useCRMStore((s) => s.tasks);

    const assignedDeals = useMemo(() => deals.filter((deal) => deal.assignedTo === currentUser?.id), [currentUser?.id, deals]);
    const assignedLeads = useMemo(() => leads.filter((lead) => lead.assignedTo === currentUser?.id), [currentUser?.id, leads]);
    const assignedTasks = useMemo(() => tasks.filter((task) => task.assignee === currentUser?.id), [currentUser?.id, tasks]);
    const assignedCustomers = useMemo(() => customers.filter((customer) => assignedLeads.some((lead) => lead.customerId === customer.id)), [assignedLeads, customers]);

    const stats = [
        { label: "Assigned customers", value: assignedCustomers.length, icon: Building2 },
        { label: "Active leads", value: assignedLeads.length, icon: Sparkles },
        { label: "Open deals", value: assignedDeals.length, icon: BriefcaseBusiness },
        { label: "Pending tasks", value: assignedTasks.filter((task) => task.status !== "done").length, icon: ShieldCheck },
    ];

    if (!currentUser) {
        return (
            <div className="rounded-3xl border border-ink-200/80 bg-white p-8 text-center shadow-soft dark:border-slate-700 dark:bg-slate-900">
                <p className="text-lg font-semibold text-ink-800 dark:text-slate-100">No user selected</p>
                <p className="mt-2 text-sm text-ink-500 dark:text-slate-400">Sign in with a CRM user account to view your profile.</p>
                <button onClick={() => navigate("/login")} className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Go to login</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
                <button onClick={logout} className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700">
                    Sign out
                </button>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-[28px] border border-ink-200/70 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 text-xl font-semibold text-white">
                                {currentUser.name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">User profile</p>
                                <h1 className="text-3xl font-semibold text-ink-950 dark:text-slate-100">{currentUser.name}</h1>
                                <p className="text-sm text-ink-500 dark:text-slate-400">{currentUser.role}</p>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                            <p className="font-semibold">Active account</p>
                            <p className="mt-1">Ready to manage CRM operations</p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-ink-200/70 bg-ink-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                            <div className="flex items-center gap-2 text-sm font-semibold text-ink-700 dark:text-slate-200">
                                <Mail className="h-4 w-4" />
                                Email
                            </div>
                            <p className="mt-2 text-sm text-ink-600 dark:text-slate-400">{currentUser.email}</p>
                        </div>
                        <div className="rounded-2xl border border-ink-200/70 bg-ink-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                            <div className="flex items-center gap-2 text-sm font-semibold text-ink-700 dark:text-slate-200">
                                <UserRound className="h-4 w-4" />
                                Access level
                            </div>
                            <p className="mt-2 text-sm text-ink-600 dark:text-slate-400">{currentUser.role}</p>
                        </div>
                    </div>
                </section>

                <section className="rounded-[28px] border border-ink-200/70 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
                        <Wallet2 className="h-4 w-4" />
                        Snapshot
                    </div>
                    <div className="mt-4 grid gap-3">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="flex items-center justify-between rounded-2xl border border-ink-200/70 bg-ink-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-xl bg-white p-2 shadow-sm dark:bg-slate-900">
                                            <Icon className="h-4 w-4 text-brand-600" />
                                        </div>
                                        <span className="text-sm font-medium text-ink-700 dark:text-slate-200">{stat.label}</span>
                                    </div>
                                    <span className="text-lg font-semibold text-ink-950 dark:text-slate-100">{stat.value}</span>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}
