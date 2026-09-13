import { useCRMStore } from "@/store/crmStore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";
import { TrendingUp, Users, Target, AlertTriangle, Phone, Mail, Calendar, FileText, CheckSquare, ArrowUpRight, Building2, Clock, Sparkles, } from "lucide-react";
import type { ActivityItem } from "@/types";
import { api } from "@/api/client";
import { useEffect, useState } from "react";
const activityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
        case "call":
            return Phone;
        case "email":
            return Mail;
        case "meeting":
            return Calendar;
        case "note":
            return FileText;
        case "task":
            return CheckSquare;
    }
};
const activityColor = (type: ActivityItem["type"]) => {
    switch (type) {
        case "call":
            return "bg-accent-50 text-accent-600";
        case "email":
            return "bg-brand-50 text-brand-600";
        case "meeting":
            return "bg-purple-50 text-purple-600";
        case "note":
            return "bg-amber-50 text-amber-600";
        case "task":
            return "bg-emerald-50 text-emerald-600";
    }
};
const formatINR = (value: number) => {
    if (value >= 100000)
        return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000)
        return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
};
const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffH < 1)
        return `${Math.max(1, Math.floor(diffMs / (1000 * 60)))}m ago`;
    if (diffH < 24)
        return `${diffH}h ago`;
    return `${Math.floor(diffH / 24)}d ago`;
};
export default function Dashboard() {
    const { revenueByMonth, funnelData, activities, leads, deals, customers, getAtRiskCustomers, getCustomerById, getStaffById } = useCRMStore();
    const atRisk = getAtRiskCustomers();
    const topFunnel = funnelData[0]?.count ?? 1;
    const totalRevenue = deals.reduce((sum, deal) => sum + (Number.isFinite(Number(deal.value)) ? Number(deal.value) : 0), 0);
    const totalLeads = leads.length;
    const wonLeads = leads.filter((lead) => lead.stage === "won").length;
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
    const riskCount = atRisk.length;
    const [aiSummary, setAiSummary] = useState<{ focusMessage: string; predictedWinRate: number; topOpportunityCount: number; highlightLabel: string } | null>(null);
    const [aiInsights, setAiInsights] = useState<Array<{ id: string; company: string; name: string; score: number; prediction: string; reason: string }>>([]);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        let active = true;
        const loadInsights = async () => {
            setAiLoading(true);
            try {
                const result = await api.getLeadInsights(leads.map((lead) => ({
                    id: lead.id,
                    name: lead.name,
                    company: lead.company,
                    stage: lead.stage,
                    value: lead.value,
                    leadScore: lead.leadScore,
                    lastUpdated: lead.lastUpdated,
                })));
                if (!active)
                    return;
                setAiSummary(result.summary);
                setAiInsights(result.insights);
            }
            catch {
                if (!active)
                    return;
                setAiSummary({
                    focusMessage: "AI insights are unavailable right now. The CRM will still work normally.",
                    predictedWinRate: 0.35,
                    topOpportunityCount: 0,
                    highlightLabel: "Offline",
                });
                setAiInsights([]);
            }
            finally {
                if (active)
                    setAiLoading(false);
            }
        };
        void loadInsights();
        return () => {
            active = false;
        };
    }, [leads]);

    return (<div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-soft p-6 animate-slide-up dark:border dark:border-slate-700 dark:bg-slate-900">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 bg-gradient-to-br from-brand-500 to-accent-500 blur-2xl"/>
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
                <TrendingUp className="w-5 h-5"/>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                <ArrowUpRight className="w-3 h-3"/>
                +13%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-ink-500 font-medium">Revenue</p>
              <p className="font-display text-3xl text-ink-900 mt-1 tracking-tight">₹{Math.round(totalRevenue / 1000)}k</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white shadow-soft p-6 animate-slide-up dark:border dark:border-slate-700 dark:bg-slate-900" style={{ animationDelay: "50ms" }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 bg-gradient-to-br from-brand-500 to-brand-700 blur-2xl"/>
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-accent-50 text-accent-600">
                <Users className="w-5 h-5"/>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                <ArrowUpRight className="w-3 h-3"/>
                +8%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-ink-500 font-medium">Leads</p>
              <p className="font-display text-3xl text-ink-900 mt-1 tracking-tight">{totalLeads}</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white shadow-soft p-6 animate-slide-up dark:border dark:border-slate-700 dark:bg-slate-900" style={{ animationDelay: "100ms" }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 bg-gradient-to-br from-accent-500 to-accent-700 blur-2xl"/>
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-brand-50 to-accent-50 text-brand-700">
                <Target className="w-5 h-5"/>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                <ArrowUpRight className="w-3 h-3"/>
                +0.6%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-ink-500 font-medium">Conversion</p>
              <p className="font-display text-3xl text-ink-900 mt-1 tracking-tight">{conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white shadow-soft p-6 animate-slide-up dark:border dark:border-slate-700 dark:bg-slate-900" style={{ animationDelay: "150ms" }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-25 bg-gradient-to-br from-orange-400 to-red-500 blur-2xl"/>
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600">
                <AlertTriangle className="w-5 h-5"/>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700">
                At risk
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-ink-500 font-medium">Churn Risk</p>
              <p className="font-display text-3xl text-ink-900 mt-1 tracking-tight">{riskCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-white shadow-soft p-6 animate-slide-up dark:border dark:border-slate-700 dark:bg-slate-900" style={{ animationDelay: "200ms" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-display text-xl text-ink-900">Revenue Trend</h2>
              <p className="text-sm text-ink-500 mt-0.5">Monthly revenue performance</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-ink-500">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-brand-500 to-accent-500"/>
              Revenue
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByMonth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECE9E1" vertical={false}/>
                <XAxis dataKey="month" stroke="#908672" fontSize={12} tickLine={false} axisLine={false}/>
                <YAxis stroke="#908672" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatINR(v)}/>
                <Tooltip cursor={{ stroke: "#3B3486", strokeDasharray: "4 4", strokeWidth: 1 }} contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 10px 40px -10px rgba(59, 52, 134, 0.25)",
            padding: "10px 14px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
        }} formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}/>
                <Line type="monotone" dataKey="revenue" stroke="#3B3486" strokeWidth={3} dot={{ r: 4, fill: "#fff", stroke: "#3B3486", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#0E8388", stroke: "#fff", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white shadow-soft p-6 animate-slide-up dark:border dark:border-slate-700 dark:bg-slate-900" style={{ animationDelay: "250ms" }}>
          <div className="mb-5">
            <h2 className="font-display text-xl text-ink-900">Lead Funnel</h2>
            <p className="text-sm text-ink-500 mt-0.5">Stage conversion flow</p>
          </div>
          <div className="space-y-4">
            {funnelData.map((f, i) => {
            const pct = (f.count / topFunnel) * 100;
            return (<div key={f.stage}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-ink-800">{f.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-ink-500">{pct.toFixed(0)}%</span>
                      <span className="text-sm font-bold text-ink-900 tabular-nums">{f.count}</span>
                    </div>
                  </div>
                  <div className="h-7 w-full rounded-xl bg-ink-100 overflow-hidden relative">
                    <div className="h-full rounded-xl transition-all duration-700 ease-out flex items-center justify-end pr-2" style={{
                    width: `${Math.max(pct, 6)}%`,
                    background: `linear-gradient(90deg, ${f.fill}, ${f.fill}dd)`,
                    animationDelay: `${300 + i * 80}ms`,
                }}>
                      {i === funnelData.length - 1 && (<ArrowUpRight className="w-3.5 h-3.5 text-white/90"/>)}
                    </div>
                  </div>
                </div>);
        })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-white shadow-soft p-6 animate-slide-up dark:border dark:border-slate-700 dark:bg-slate-900" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-xl text-ink-900">Recent Activity</h2>
              <p className="text-sm text-ink-500 mt-0.5">Latest updates across the team</p>
            </div>
            <button className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition">
              View all
            </button>
          </div>
          <div className="space-y-1">
            {activities.map((a, i) => {
            const Icon = activityIcon(a.type);
            const customer = a.customerId ? getCustomerById(a.customerId) : null;
            const user = getStaffById(a.userId);
            return (<div key={a.id} className="flex items-start gap-4 p-3.5 -mx-2 rounded-xl hover:bg-ink-50 transition group">
                  <div className={`p-2.5 rounded-xl shrink-0 ${activityColor(a.type)}`}>
                    <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-ink-900 truncate">{a.title}</p>
                      <div className="flex items-center gap-1 shrink-0 text-xs text-ink-500">
                        <Clock className="w-3 h-3"/>
                        {formatTimestamp(a.timestamp)}
                      </div>
                    </div>
                    <p className="text-sm text-ink-500 mt-0.5 line-clamp-1">{a.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-ink-100 text-ink-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: user?.avatarColor ?? "#3B3486" }}/>
                        {user?.name?.split(" ")[0] ?? "Team"}
                      </span>
                      {customer && (<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 font-medium">
                          <Building2 className="w-3 h-3"/>
                          {customer.company}
                        </span>)}
                    </div>
                  </div>
                </div>);
        })}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl shadow-soft animate-slide-up" style={{ animationDelay: "350ms" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800"/>
          <div className="absolute inset-0 opacity-30 bg-grain"/>
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display text-xl">At-Risk Customers</h2>
                <p className="text-sm text-brand-100/80 mt-0.5">Churn score ≥ 35%</p>
              </div>
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <AlertTriangle className="w-5 h-5 text-orange-300"/>
              </div>
            </div>
            <div className="space-y-3">
              {atRisk.map((c) => {
            const riskPct = Math.round(c.churnScore * 100);
            const riskLevel = riskPct >= 50
                ? { label: "High", bar: "from-red-400 to-orange-400", badge: "bg-red-500/20 text-red-200 border-red-400/30" }
                : riskPct >= 40
                    ? { label: "Medium", bar: "from-orange-400 to-amber-400", badge: "bg-orange-500/20 text-orange-200 border-orange-400/30" }
                    : { label: "Elevated", bar: "from-amber-400 to-yellow-400", badge: "bg-amber-500/20 text-amber-200 border-amber-400/30" };
            return (<div key={c.id} className="p-3.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg" style={{ backgroundColor: c.avatarColor }}>
                        {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm truncate">{c.name}</p>
                          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${riskLevel.badge}`}>
                            {riskLevel.label}
                          </span>
                        </div>
                        <p className="text-xs text-brand-100/70 truncate mt-0.5">{c.company}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-brand-100/60 font-medium">Churn score</span>
                        <span className="text-xs font-bold tabular-nums">{riskPct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${riskLevel.bar} transition-all duration-700`} style={{ width: `${riskPct}%` }}/>
                      </div>
                    </div>
                  </div>);
        })}
            </div>
            <button className="w-full mt-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 text-sm font-semibold transition flex items-center justify-center gap-2">
              Review retention plan
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"/>
            </button>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl bg-white shadow-soft p-6 animate-slide-up dark:border dark:border-slate-700 dark:bg-slate-900" style={{ animationDelay: "400ms" }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-ink-900">AI Lead Intelligence</h2>
            <p className="text-sm text-ink-500 mt-0.5">Python-based scoring for the current lead pipeline</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
            <Sparkles className="w-4 h-4"/>
            {aiLoading ? "Scoring…" : "Live"}
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-accent-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Focus</p>
            <p className="mt-3 text-lg font-semibold text-ink-900">{aiSummary?.focusMessage ?? "Preparing AI recommendations…"}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-ink-700">{aiSummary?.highlightLabel ?? "Ready"}</span>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-ink-700">Win rate {((aiSummary?.predictedWinRate ?? 0) * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="rounded-2xl border border-ink-200/70 bg-ink-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-500">Model</p>
            <p className="mt-3 font-display text-2xl text-ink-900">{aiSummary ? `${aiSummary.topOpportunityCount} prioritized leads` : "Awaiting data"}</p>
            <p className="mt-2 text-sm text-ink-600">The model uses a lightweight Python scorer to rank opportunities by value, momentum, and recency.</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {aiInsights.length === 0 && !aiLoading ? (
            <p className="rounded-2xl border border-dashed border-ink-200 bg-ink-50 p-4 text-sm text-ink-600">No scored opportunities yet. The API will populate this panel once lead data is available.</p>
          ) : aiInsights.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 rounded-2xl border border-ink-200/70 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-ink-900">{item.name}</p>
                <p className="text-sm text-ink-600">{item.company} • {item.reason}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">{item.score}/100</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 capitalize">{item.prediction.replace("_", " ")}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>);
}
