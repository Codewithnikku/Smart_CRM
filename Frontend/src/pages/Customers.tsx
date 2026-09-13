import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ChevronRight, Users, Mail, Building2, Factory } from "lucide-react";
import { useCRMStore } from "@/store/crmStore";
import { cn } from "@/lib/utils";
function getChurnColor(score: number) {
    if (score >= 0.4)
        return { bg: "bg-red-100", text: "text-red-700", ring: "ring-red-200" };
    if (score >= 0.25)
        return { bg: "bg-orange-100", text: "text-orange-700", ring: "ring-orange-200" };
    if (score >= 0.1)
        return { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-200" };
    return { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200" };
}
function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}
function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
export default function Customers() {
    const navigate = useNavigate();
    const customers = useCRMStore((s) => s.customers);
    const [search, setSearch] = useState("");
    const [industryFilter, setIndustryFilter] = useState<string>("all");
    const [churnFilter, setChurnFilter] = useState<string>("all");
    const industries = useMemo(() => {
        const set = new Set(customers.map((c) => c.industry));
        return Array.from(set).sort();
    }, [customers]);
    const filtered = useMemo(() => {
        return customers.filter((c) => {
            const searchLower = search.toLowerCase();
            const matchesSearch = c.name.toLowerCase().includes(searchLower) ||
                c.company.toLowerCase().includes(searchLower) ||
                c.email.toLowerCase().includes(searchLower);
            const matchesIndustry = industryFilter === "all" || c.industry === industryFilter;
            let matchesChurn = true;
            if (churnFilter === "high")
                matchesChurn = c.churnScore >= 0.4;
            else if (churnFilter === "medium")
                matchesChurn = c.churnScore >= 0.25 && c.churnScore < 0.4;
            else if (churnFilter === "low")
                matchesChurn = c.churnScore >= 0.1 && c.churnScore < 0.25;
            else if (churnFilter === "safe")
                matchesChurn = c.churnScore < 0.1;
            return matchesSearch && matchesIndustry && matchesChurn;
        });
    }, [customers, search, industryFilter, churnFilter]);
    return (<div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl relative overflow-hidden gradient-mesh-brand grain-overlay border border-ink-200/60 p-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-700">
              <Users className="w-4 h-4"/>
              <span className="text-xs font-semibold uppercase tracking-wider">All Accounts</span>
            </div>
            <h2 className="mt-2 font-display text-2xl text-ink-900">
              {filtered.length} {filtered.length === 1 ? "customer" : "customers"}
            </h2>
            <p className="text-ink-500 mt-1 text-sm">
              Search, filter, and drill into customer accounts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400"/>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, company, email..." className="w-full sm:w-72 pl-10 pr-4 py-2.5 rounded-xl bg-white/80 border border-ink-200/80 text-sm text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all"/>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-ink-500 ml-1"/>
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Filters:</span>

        <div className="flex flex-wrap gap-2 ml-1">
          <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} className="px-3 py-1.5 rounded-lg text-sm bg-white border border-ink-200 text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30">
            <option value="all">All industries</option>
            {industries.map((ind) => (<option key={ind} value={ind}>
                {ind}
              </option>))}
          </select>

          <select value={churnFilter} onChange={(e) => setChurnFilter(e.target.value)} className="px-3 py-1.5 rounded-lg text-sm bg-white border border-ink-200 text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30">
            <option value="all">All churn risk</option>
            <option value="high">High risk (≥40%)</option>
            <option value="medium">Medium (25–40%)</option>
            <option value="low">Low (10–25%)</option>
            <option value="safe">Safe (‹10%)</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-white/80 border border-ink-200/70 shadow-soft overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-200/70 bg-ink-50/60">
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  Customer
                </th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5"/>
                    Company
                  </div>
                </th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5"/>
                    Email
                  </div>
                </th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  <div className="flex items-center gap-1.5">
                    <Factory className="w-3.5 h-3.5"/>
                    Industry
                  </div>
                </th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  Churn Risk
                </th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  Created
                </th>
                <th className="px-6 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtered.map((customer) => {
            const churn = getChurnColor(customer.churnScore);
            return (<tr key={customer.id} onClick={() => navigate(`/customers/${customer.id}`)} className="group cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-brand-50/40 hover:to-accent-50/30 hover:shadow-[inset_2px_0_0_0_#3B3486]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-soft" style={{ backgroundColor: customer.avatarColor }}>
                          {getInitials(customer.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-ink-900 group-hover:text-brand-700 transition-colors">
                            {customer.name}
                          </div>
                          <div className="text-xs text-ink-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-500"/>
                            {customer.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-ink-800">{customer.company}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-ink-600">{customer.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-ink-100 text-ink-700 ring-1 ring-inset ring-ink-200/60">
                        {customer.industry}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset", churn.bg, churn.text, churn.ring)}>
                        <span className="w-1.5 h-1.5 rounded-full current"/>
                        {Math.round(customer.churnScore * 100)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-ink-500">{formatDate(customer.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <ChevronRight className="w-4 h-4 text-ink-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all"/>
                    </td>
                  </tr>);
        })}
              {filtered.length === 0 && (<tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="text-ink-400 text-sm">No customers match your filters.</div>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
