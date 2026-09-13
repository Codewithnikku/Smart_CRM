import { useMemo, useState } from "react";
import { Search, TrendingUp, Target, Percent, Hash, Calendar, Building2 } from "lucide-react";
import { useCRMStore } from "@/store/crmStore";
import { cn } from "@/lib/utils";
const stageStyles: Record<string, {
    bg: string;
    text: string;
    dot: string;
}> = {
    Discovery: { bg: "bg-brand-50", text: "text-brand-700", dot: "bg-brand-400" },
    Qualified: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
    Proposal: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
    Negotiation: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
    "Closed Won": { bg: "bg-accent-50", text: "text-accent-700", dot: "bg-accent-500" },
    "Closed Lost": { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-400" },
};
function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}
function formatINR(value: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
}
function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}
export default function Deals() {
    const { deals, getCustomerById, getStaffById } = useCRMStore();
    const [search, setSearch] = useState("");
    const filteredDeals = useMemo(() => {
        const q = search.trim().toLowerCase();
        const list = deals.filter((d) => {
            if (!q)
                return true;
            const customer = getCustomerById(d.customerId);
            const staff = getStaffById(d.assignedTo);
            return (d.name.toLowerCase().includes(q) ||
                d.stage.toLowerCase().includes(q) ||
                (customer?.name.toLowerCase().includes(q) ?? false) ||
                (customer?.company.toLowerCase().includes(q) ?? false) ||
                (staff?.name.toLowerCase().includes(q) ?? false));
        });
        return [...list].sort((a, b) => b.value - a.value);
    }, [deals, search, getCustomerById, getStaffById]);
    const stats = useMemo(() => {
        const total = filteredDeals.reduce((sum, d) => sum + d.value, 0);
        const weighted = filteredDeals.reduce((sum, d) => sum + (d.value * d.winProbability) / 100, 0);
        const avgProb = filteredDeals.length
            ? filteredDeals.reduce((sum, d) => sum + d.winProbability, 0) / filteredDeals.length
            : 0;
        return { total, weighted, avgProb, count: filteredDeals.length };
    }, [filteredDeals]);
    return (<div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-soft p-5 border border-ink-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ink-500 text-sm">Total Pipeline Value</p>
              <p className="font-display text-2xl text-ink-900 mt-1">{formatINR(stats.total)}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-brand-600"/>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-5 border border-ink-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ink-500 text-sm">Weighted Value</p>
              <p className="font-display text-2xl text-ink-900 mt-1">{formatINR(stats.weighted)}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-accent-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-accent-600"/>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-5 border border-ink-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ink-500 text-sm">Avg Win Probability</p>
              <p className="font-display text-2xl text-ink-900 mt-1">{stats.avgProb.toFixed(0)}%</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
              <Percent className="w-5 h-5 text-amber-600"/>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-5 border border-ink-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ink-500 text-sm">Deals Count</p>
              <p className="font-display text-2xl text-ink-900 mt-1">{stats.count}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <Hash className="w-5 h-5 text-blue-600"/>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-ink-100 overflow-hidden dark:border-slate-700 dark:bg-slate-900">
        <div className="p-4 border-b border-ink-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400"/>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search deals, customers, assignees..." className="w-full pl-9 pr-3 py-2.5 bg-ink-50 rounded-xl border border-ink-200 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition"/>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-ink-50/95 backdrop-blur">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">
                  Deal Name
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider min-w-[200px]">
                  Win Probability
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">
                  Expected Close
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">
                  Assignee
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filteredDeals.length === 0 ? (<tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="text-ink-400 text-sm">No deals found matching your search.</div>
                  </td>
                </tr>) : (filteredDeals.map((deal) => {
            const customer = getCustomerById(deal.customerId);
            const staff = getStaffById(deal.assignedTo);
            const stageStyle = stageStyles[deal.stage] ?? {
                bg: "bg-ink-100",
                text: "text-ink-700",
                dot: "bg-ink-400",
            };
            const probColor = deal.winProbability >= 70
                ? "bg-accent-500"
                : deal.winProbability >= 40
                    ? "bg-amber-500"
                    : "bg-rose-500";
            return (<tr key={deal.id} className="group hover:bg-brand-50/40 transition-colors cursor-default">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-ink-900">{deal.name}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: customer?.avatarColor + "20" }}>
                            <Building2 className="w-4 h-4" style={{ color: customer?.avatarColor }}/>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-ink-900">
                              {customer?.company ?? "—"}
                            </div>
                            <div className="text-xs text-ink-500">{customer?.name ?? "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", stageStyle.bg, stageStyle.text)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", stageStyle.dot)}/>
                          {deal.stage}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-semibold text-ink-900">{formatINR(deal.value)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-ink-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all", probColor)} style={{ width: `${deal.winProbability}%` }}/>
                          </div>
                          <span className="text-sm font-semibold text-ink-700 min-w-[40px] text-right">
                            {deal.winProbability}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-ink-700">
                          <Calendar className="w-4 h-4 text-ink-400"/>
                          {formatDate(deal.expectedClose)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ backgroundColor: staff?.avatarColor ?? "#7b7262" }}>
                            {staff ? getInitials(staff.name) : "—"}
                          </div>
                          <div className="hidden sm:block">
                            <div className="text-sm font-medium text-ink-900">
                              {staff?.name ?? "Unassigned"}
                            </div>
                            <div className="text-xs text-ink-500">{staff?.role ?? ""}</div>
                          </div>
                        </div>
                      </td>
                    </tr>);
        }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
