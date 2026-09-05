import type { Customer, Lead, Deal, Task, Staff, ActivityItem, TaskStatus, } from "@/types";
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000/api";
async function json<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const res = await fetch(input, init);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return (await res.json()) as T;
}
export type DashboardKPIs = {
    revenue: number;
    leads: number;
    conversionRate: number;
    atRiskChurn: number;
    wonDealsThisMonth: number;
};
export const api = {
    login: (email: string, password: string) => json<Staff>(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    }),
    getKPIs: () => json<DashboardKPIs>(`${API_BASE}/dashboard/kpis`),
    getRevenue: () => json<Array<{
        month: string;
        month_label: string;
        won_value: number;
        pipeline_value: number;
        deal_count: number;
    }>>(`${API_BASE}/dashboard/revenue`),
    getFunnel: () => json<Array<{
        stage: string;
        lead_count: number;
        total_value: number;
        pct_of_leads: number;
    }>>(`${API_BASE}/dashboard/funnel`),
    getActivity: () => json<Array<ActivityItem & {
        customer_name?: string;
        company?: string;
        user_name?: string;
    }>>(`${API_BASE}/dashboard/activity`),
    getAtRisk: () => json<Customer[]>(`${API_BASE}/dashboard/at-risk`),
    patchCustomerChurnScore: (id: string, churnScore: number) => json<Customer>(`${API_BASE}/customers/${id}/churn-score`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ churn_score: churnScore }),
    }),
    listCustomers: (params?: {
        search?: string;
        industry?: string;
        churn_tier?: string;
    }) => {
        const qs = new URLSearchParams();
        if (params?.search)
            qs.set("search", params.search);
        if (params?.industry && params.industry !== "all")
            qs.set("industry", params.industry);
        if (params?.churn_tier && params.churn_tier !== "all")
            qs.set("churn_tier", params.churn_tier);
        const q = qs.toString();
        return json<Customer[]>(`${API_BASE}/customers${q ? `?${q}` : ""}`);
    },
    getCustomerDetail: (id: string) => json<{
        customer: Customer;
        leads: Lead[];
        deals: Deal[];
        interactions: ActivityItem[];
    }>(`${API_BASE}/customers/${id}`),
    listLeads: (stage?: string) => json<Lead[]>(`${API_BASE}/leads${stage && stage !== "all" ? `?stage=${encodeURIComponent(stage)}` : ""}`),
    patchLeadStage: (id: string, stage: Lead["stage"]) => json<Lead>(`${API_BASE}/leads/${id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
    }),
    listDeals: (search?: string) => json<Deal[]>(`${API_BASE}/deals${search ? `?search=${encodeURIComponent(search)}` : ""}`),
    listTasks: () => json<Task[]>(`${API_BASE}/tasks`),
    patchTaskStatus: (id: string, status?: TaskStatus) => json<Task>(`${API_BASE}/tasks/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: status ? JSON.stringify({ status }) : undefined,
    }),
    getLeadInsights: (leads: Array<{ id: string; name: string; company: string; stage: string; value: number; leadScore?: number; lastUpdated?: string }>) => json<{
        summary: {
            focusMessage: string;
            predictedWinRate: number;
            topOpportunityCount: number;
            highlightLabel: string;
        };
        insights: Array<{
            id: string;
            company: string;
            name: string;
            score: number;
            prediction: string;
            reason: string;
        }>;
        model: {
            name: string;
            version: string;
        };
    }>(`${API_BASE}/ai/lead-insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads }),
    }),
    listStaff: () => json<Staff[]>(`${API_BASE}/staff`),
};
