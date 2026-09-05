import { create } from "zustand";
import type { Customer, Lead, Deal, Task, Staff, ActivityItem, LeadStage, TaskStatus } from "@/types";
import { customers as seedCustomers, leads as seedLeads, deals as seedDeals, tasks as seedTasks, staffList as seedStaff, activities as seedActivities, revenueByMonth as seedRevenue, funnelData as seedFunnel } from "@/data/mockData";
import { api } from "@/api/client";
interface CRMState {
    customers: Customer[];
    leads: Lead[];
    deals: Deal[];
    tasks: Task[];
    staff: Staff[];
    activities: ActivityItem[];
    revenueByMonth: {
        month: string;
        revenue: number;
    }[];
    funnelData: {
        stage: string;
        count: number;
        fill: string;
    }[];
    selectedCustomerId: string | null;
    currentUser: Staff | null;
    apiConnected: boolean;
    apiError: string | null;
    hydrateFromApi: () => Promise<void>;
    setCurrentUser: (user: Staff | null) => void;
    logout: () => void;
    setSelectedCustomerId: (id: string | null) => void;
    updateLeadStage: (leadId: string, stage: LeadStage) => Promise<void>;
    updateCustomerChurnScore: (customerId: string, churnScore: number) => Promise<void>;
    updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
    toggleTaskStatus: (taskId: string) => Promise<void>;
    getCustomerById: (id: string) => Customer | undefined;
    getStaffById: (id: string) => Staff | undefined;
    getLeadsByCustomer: (customerId: string) => Lead[];
    getDealsByCustomer: (customerId: string) => Deal[];
    getOpenTasksCount: () => number;
    getAtRiskCustomers: () => Customer[];
}
const FILL_BY_STAGE: Record<string, string> = {
    Leads: "#3B3486", new: "#3B3486",
    Contacted: "#4c54ab", contacted: "#4c54ab",
    Qualified: "#6b75c1", qualified: "#6b75c1",
    Proposal: "#38a0a2", proposal: "#38a0a2",
    Won: "#0E8388", won: "#0E8388",
    Closed: "#0c6a70", "Closed Won": "#0E8388", "Closed Lost": "#8B5E3C",
    lost: "#8B5E3C", Lost: "#8B5E3C",
    Discovery: "#969fd8", Negotiation: "#0c6a70",
};
const getFill = (k: string) => FILL_BY_STAGE[k] ?? "#3B3486";
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const normalizeMonthLabel = (rawLabel: unknown): string => {
    const label = String(rawLabel ?? "").trim();
    if (!label)
        return "";
    if (MONTH_LABELS.includes(label))
        return label;
    const monthNumberMatch = String(label).match(/^(\d{4})[-_/](\d{1,2})(?:[-_/]\d{1,2})?$/);
    if (monthNumberMatch) {
        const monthIndex = Number(monthNumberMatch[2]) - 1;
        return MONTH_LABELS[monthIndex] ?? "";
    }
    const normalized = label.slice(0, 3).toLowerCase();
    const match = MONTH_LABELS.find((month) => month.toLowerCase() === normalized);
    return match ?? "";
};
const normalizeRevenueByMonth = (rows: unknown[]) => {
    const revenueByMonth = new Map<string, number>(seedRevenue.map((item) => [item.month, item.revenue]));
    for (const row of rows) {
        if (!row || typeof row !== "object")
            continue;
        const raw = row as PlainObj;
        const monthLabel = normalizeMonthLabel(raw.month_label ?? raw.month);
        if (!monthLabel)
            continue;
        const revenue = asNumber(raw.won_value ?? raw.pipeline_value ?? raw.wonValue ?? 0);
        if (revenue > 0) {
            revenueByMonth.set(monthLabel, revenue);
        }
    }
    return MONTH_LABELS.map((month) => ({
        month,
        revenue: revenueByMonth.get(month) ?? 0,
    }));
};
const camel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c) => (c as string).toUpperCase());
type PlainObj = Record<string, unknown>;
function asNumber(value: unknown, fallback = 0): number {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed || trimmed === "null" || trimmed === "undefined")
            return fallback;
        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
}
function norm<T>(row: unknown): T {
    const out: PlainObj = {};
    if (!row || typeof row !== "object")
        return out as T;
    for (const k of Object.keys(row as PlainObj))
        out[camel(k)] = (row as PlainObj)[k];
    return out as T;
}
function normArr<T>(xs: unknown): T[] {
    if (!Array.isArray(xs))
        return [];
    return xs.map((x) => norm<T>(x));
}
const STORAGE_KEY = "smart-crm-current-user";
function readStoredUser(): Staff | null {
    if (typeof window === "undefined")
        return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed as Staff : null;
    }
    catch {
        return null;
    }
}
function writeStoredUser(user: Staff | null) {
    if (typeof window === "undefined")
        return;
    if (user) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
    else {
        window.localStorage.removeItem(STORAGE_KEY);
    }
}
export const useCRMStore = create<CRMState>((set, get) => ({
    customers: seedCustomers,
    leads: seedLeads,
    deals: seedDeals,
    tasks: seedTasks,
    staff: seedStaff,
    activities: seedActivities,
    revenueByMonth: seedRevenue,
    funnelData: seedFunnel,
    selectedCustomerId: null,
    currentUser: readStoredUser(),
    apiConnected: false,
    apiError: null,
    setCurrentUser: (user) => {
        writeStoredUser(user);
        set({ currentUser: user });
    },
    logout: () => {
        writeStoredUser(null);
        set({ currentUser: null });
    },
    hydrateFromApi: async () => {
        try {
            const [customersRaw, leadsRaw, dealsRaw, tasksRaw, staffRaw, activitiesRaw, kpisRaw, revenueRaw, funnelRaw] = await Promise.all([
                api.listCustomers(),
                api.listLeads(),
                api.listDeals(),
                api.listTasks(),
                api.listStaff(),
                api.getActivity().catch(() => []),
                api.getKPIs(),
                api.getRevenue().catch(() => []),
                api.getFunnel().catch(() => []),
            ]);
            void kpisRaw;
            const customers = normArr<Customer>(customersRaw).map((customer) => ({
                ...customer,
                churnScore: asNumber((customer as unknown as PlainObj).churnScore),
            }));
            const leads = normArr<Lead>(leadsRaw).map((lead) => ({
                ...lead,
                value: asNumber((lead as unknown as PlainObj).value),
                leadScore: asNumber((lead as unknown as PlainObj).leadScore),
            }));
            const deals = normArr<Deal>(dealsRaw).map((deal) => ({
                ...deal,
                value: asNumber((deal as unknown as PlainObj).value),
                winProbability: asNumber((deal as unknown as PlainObj).winProbability),
            }));
            const tasks = normArr<Task>(tasksRaw);
            const staff = normArr<Staff>(staffRaw);
            const activities = normArr<ActivityItem>(activitiesRaw);
            const revenueByMonth = normalizeRevenueByMonth(revenueRaw ?? []);
            const funnelData = (funnelRaw ?? []).map((f: PlainObj) => ({
                stage: String(f.stage ?? ""),
                count: Number(f.lead_count ?? f.count ?? 0),
                fill: getFill(String(f.stage ?? "")),
            }));
            set({
                customers: customers.length ? customers : get().customers,
                leads: leads.length ? leads : get().leads,
                deals: deals.length ? deals : get().deals,
                tasks: tasks.length ? tasks : get().tasks,
                staff: staff.length ? staff : get().staff,
                activities: activities.length ? activities : get().activities,
                revenueByMonth: revenueByMonth.length ? revenueByMonth : get().revenueByMonth,
                funnelData: funnelData.length ? funnelData : get().funnelData,
                apiConnected: true,
                apiError: null,
            });
        }
        catch (e) {
            set({
                apiConnected: false,
                apiError: e instanceof Error ? e.message : "api_hydrate_failed",
            });
        }
    },
    setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),
    updateCustomerChurnScore: async (customerId, churnScore) => {
        try {
            const updated = await api.patchCustomerChurnScore(customerId, churnScore);
            set((state) => ({
                customers: state.customers.map((customer) => customer.id === customerId ? { ...customer, ...(updated as Customer), churnScore } : customer),
            }));
        }
        catch {
            set((state) => ({
                customers: state.customers.map((customer) => customer.id === customerId ? { ...customer, churnScore } : customer),
            }));
        }
    },
    updateLeadStage: async (leadId, stage) => {
        try {
            const updated = await api.patchLeadStage(leadId, stage);
            set((state) => ({
                leads: state.leads.map((l) => (l.id === leadId ? { ...l, ...(updated as Lead), stage } : l)),
            }));
        }
        catch {
            set((state) => ({
                leads: state.leads.map((l) => l.id === leadId ? { ...l, stage, lastUpdated: new Date().toISOString().slice(0, 10) } : l),
            }));
        }
    },
    updateTaskStatus: async (taskId, status) => {
        try {
            const updated = await api.patchTaskStatus(taskId, status);
            set((state) => ({
                tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...(updated as Task), status } : t)),
            }));
        }
        catch {
            set((state) => ({
                tasks: state.tasks.map((t) => t.id === taskId ? { ...t, status } : t),
            }));
        }
    },
    toggleTaskStatus: async (taskId) => {
        const cycle = (s: TaskStatus): TaskStatus => s === "done" ? "todo" : s === "todo" ? "in_progress" : "done";
        try {
            const updated = await api.patchTaskStatus(taskId);
            set((state) => ({
                tasks: state.tasks.map((t) => (t.id === taskId ? (updated as Task) : t)),
            }));
        }
        catch {
            set((state) => ({
                tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: cycle(t.status) } : t)),
            }));
        }
    },
    getCustomerById: (id) => get().customers.find((c) => c.id === id),
    getStaffById: (id) => get().staff.find((s) => s.id === id),
    getLeadsByCustomer: (customerId) => get().leads.filter((l) => l.customerId === customerId),
    getDealsByCustomer: (customerId) => get().deals.filter((d) => d.customerId === customerId),
    getOpenTasksCount: () => get().tasks.filter((t) => t.status !== "done").length,
    getAtRiskCustomers: () => {
        const asNumber = (v: unknown) => typeof v === "string" ? Number(v) : typeof v === "number" ? v : 0;
        return get().customers
            .filter((c) => asNumber(c.churnScore ?? (c as unknown as Record<string, unknown>).churn_score ?? 0) >= 0.35)
            .sort((a, b) => asNumber(b.churnScore ?? (b as unknown as Record<string, unknown>).churn_score ?? 0) -
            asNumber(a.churnScore ?? (a as unknown as Record<string, unknown>).churn_score ?? 0));
    },
}));
