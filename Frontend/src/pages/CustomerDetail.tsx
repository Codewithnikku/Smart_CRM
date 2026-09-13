import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, Factory, Calendar, TrendingDown, PhoneCall, Video, FileText, CheckSquare, StickyNote, BriefcaseBusiness, Target, DollarSign, CalendarDays, User, } from "lucide-react";
import { useCRMStore } from "@/store/crmStore";
import type { ActivityItem, Lead, Deal } from "@/types";
import { cn } from "@/lib/utils";
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
function formatDateTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
        " at " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function formatCurrency(value: number) {
    return "₹" + value.toLocaleString("en-IN");
}
function churnBarColor(score: number) {
    if (score >= 0.4)
        return "from-red-500 to-red-600";
    if (score >= 0.25)
        return "from-orange-500 to-orange-600";
    if (score >= 0.1)
        return "from-amber-500 to-amber-600";
    return "from-emerald-500 to-emerald-600";
}
function churnLabel(score: number) {
    if (score >= 0.4)
        return { text: "Critical", color: "text-red-700 bg-red-100" };
    if (score >= 0.25)
        return { text: "At Risk", color: "text-orange-700 bg-orange-100" };
    if (score >= 0.1)
        return { text: "Monitor", color: "text-amber-700 bg-amber-100" };
    return { text: "Healthy", color: "text-emerald-700 bg-emerald-100" };
}
function stageBadge(stage: Lead["stage"]) {
    const map: Record<Lead["stage"], string> = {
        new: "bg-sky-100 text-sky-700 ring-sky-200",
        contacted: "bg-violet-100 text-violet-700 ring-violet-200",
        qualified: "bg-blue-100 text-blue-700 ring-blue-200",
        proposal: "bg-amber-100 text-amber-700 ring-amber-200",
        won: "bg-emerald-100 text-emerald-700 ring-emerald-200",
        lost: "bg-ink-200 text-ink-600 ring-ink-300",
    };
    return map[stage];
}
function dealStageBadge(stage: string) {
    if (stage === "Closed Won")
        return "bg-emerald-100 text-emerald-700 ring-emerald-200";
    if (stage === "Closed Lost")
        return "bg-ink-200 text-ink-600 ring-ink-300";
    if (stage === "Proposal")
        return "bg-amber-100 text-amber-700 ring-amber-200";
    if (stage === "Negotiation")
        return "bg-violet-100 text-violet-700 ring-violet-200";
    if (stage === "Qualified")
        return "bg-blue-100 text-blue-700 ring-blue-200";
    return "bg-sky-100 text-sky-700 ring-sky-200";
}
function activityIcon(type: ActivityItem["type"]) {
    switch (type) {
        case "call":
            return PhoneCall;
        case "meeting":
            return Video;
        case "email":
            return Mail;
        case "task":
            return CheckSquare;
        case "note":
            return StickyNote;
        default:
            return FileText;
    }
}
function activityColor(type: ActivityItem["type"]) {
    switch (type) {
        case "call":
            return "bg-brand-100 text-brand-700";
        case "meeting":
            return "bg-accent-100 text-accent-700";
        case "email":
            return "bg-sky-100 text-sky-700";
        case "task":
            return "bg-violet-100 text-violet-700";
        case "note":
            return "bg-amber-100 text-amber-700";
        default:
            return "bg-ink-100 text-ink-700";
    }
}
export default function CustomerDetail() {
    const { id } = useParams<{
        id: string;
    }>();
    const customers = useCRMStore((s) => s.customers);
    const staff = useCRMStore((s) => s.staff);
    const leads = useCRMStore((s) => s.leads);
    const deals = useCRMStore((s) => s.deals);
    const allActivities = useCRMStore((s) => s.activities);
    const customer = id ? customers.find((c) => c.id === id) : undefined;
    const staffById = (sid: string) => staff.find((s) => s.id === sid);
    const customerLeads = id ? leads.filter((l) => l.customerId === id) : [];
    const customerDeals = id ? deals.filter((d) => d.customerId === id) : [];
    const customerActivities = allActivities
        .filter((a) => a.customerId === id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (!customer) {
        return (<div className="rounded-2xl bg-white/80 border border-ink-200/70 p-12 text-center">
        <h2 className="font-display text-2xl text-ink-900 mb-2">Customer not found</h2>
        <p className="text-ink-500 mb-6">The customer you're looking for doesn't exist.</p>
        <Link to="/customers" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 text-white font-medium shadow-soft hover:shadow-glow transition-all">
          <ArrowLeft className="w-4 h-4"/>
          Back to Customers
        </Link>
      </div>);
    }
    const churnStatus = churnLabel(customer.churnScore);
    const totalDealValue = customerDeals.reduce((sum, d) => sum + d.value, 0);
    return (<div className="space-y-6 animate-fade-in">
      <Link to="/customers" className="inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-brand-700 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"/>
        Back to customers
      </Link>

      <div className="rounded-2xl relative overflow-hidden border border-ink-200/60 bg-white shadow-soft">
        <div className="h-28 bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 relative grain-overlay">
          <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent"/>
        </div>
        <div className="px-8 pb-8 -mt-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-soft flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: customer.avatarColor }}>
              {getInitials(customer.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl md:text-4xl text-ink-900 tracking-tight">
                  {customer.name}
                </h1>
                <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", churnStatus.color)}>
                  {churnStatus.text}
                </span>
              </div>
              <p className="mt-1 text-ink-600 font-medium">{customer.company}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <div className="flex items-center gap-1.5 text-ink-500">
                  <Factory className="w-4 h-4"/>
                  {customer.industry}
                </div>
                <div className="flex items-center gap-1.5 text-ink-500">
                  <MapPin className="w-4 h-4"/>
                  {customer.location}
                </div>
                <div className="flex items-center gap-1.5 text-ink-500">
                  <Calendar className="w-4 h-4"/>
                  Since {formatDate(customer.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-center px-5 py-3 rounded-xl bg-ink-50 border border-ink-200/60">
                <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold">Leads</div>
                <div className="font-display text-2xl text-brand-700 mt-0.5">{customerLeads.length}</div>
              </div>
              <div className="text-center px-5 py-3 rounded-xl bg-ink-50 border border-ink-200/60">
                <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold">Deals</div>
                <div className="font-display text-2xl text-accent-700 mt-0.5">{customerDeals.length}</div>
              </div>
              <div className="text-center px-5 py-3 rounded-xl bg-gradient-to-br from-brand-50 to-accent-50 border border-brand-200/60">
                <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold">Pipeline</div>
                <div className="font-display text-2xl text-brand-800 mt-0.5">{formatCurrency(totalDealValue)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl bg-white/80 border border-ink-200/70 shadow-soft p-6">
            <h3 className="font-display text-lg text-ink-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-brand-700"/>
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold">Email</div>
                  <a href={`mailto:${customer.email}`} className="text-sm text-ink-800 hover:text-brand-700 break-all">
                    {customer.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-accent-50 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-accent-700"/>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold">Phone</div>
                  <a href={`tel:${customer.phone}`} className="text-sm text-ink-800 hover:text-brand-700">
                    {customer.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-amber-700"/>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold">Location</div>
                  <div className="text-sm text-ink-800">{customer.location}</div>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                  <Factory className="w-4 h-4 text-violet-700"/>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold">Industry</div>
                  <div className="text-sm text-ink-800">{customer.industry}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 border border-ink-200/70 shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-ink-900">Churn Risk</h3>
              <TrendingDown className={cn("w-4 h-4", customer.churnScore >= 0.4 ? "text-red-500" : customer.churnScore >= 0.25 ? "text-orange-500" : "text-emerald-500")}/>
            </div>
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-ink-500 uppercase tracking-wider font-semibold">Risk Score</span>
                <span className="font-display text-2xl text-ink-900">{Math.round(customer.churnScore * 100)}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-ink-100 overflow-hidden">
                <div className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", churnBarColor(customer.churnScore))} style={{ width: `${Math.max(customer.churnScore * 100, 2)}%` }}/>
              </div>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold text-ink-400">
                <span>Safe</span>
                <span>Monitor</span>
                <span>At Risk</span>
                <span>Critical</span>
              </div>
              <p className="text-xs text-ink-500 mt-3 leading-relaxed pt-3 border-t border-ink-100">
                {customer.churnScore >= 0.4
            ? "This account shows strong churn signals. Prioritize outreach and schedule a strategic review immediately."
            : customer.churnScore >= 0.25
                ? "Monitor engagement closely. Consider proactive check-ins to address any unmet needs."
                : customer.churnScore >= 0.1
                    ? "Account is stable. Continue regular touchpoints to nurture the relationship."
                    : "Account is in great standing. Focus on upsell and expansion opportunities."}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white/80 border border-ink-200/70 shadow-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-ink-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Target className="w-4 h-4 text-brand-700"/>
                <h3 className="font-display text-lg text-ink-900">Associated Leads</h3>
                <span className="text-xs font-semibold text-ink-500 px-2 py-0.5 rounded-full bg-ink-100">
                  {customerLeads.length}
                </span>
              </div>
            </div>
            <div className="p-4">
              {customerLeads.length === 0 ? (<div className="py-10 text-center text-sm text-ink-500">No leads associated with this customer yet.</div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customerLeads.map((lead) => {
                const staff = staffById(lead.assignedTo);
                return (<div key={lead.id} className="p-4 rounded-xl border border-ink-200/60 bg-gradient-to-br from-white to-ink-50/40 hover:border-brand-300/70 hover:shadow-soft transition-all">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-ink-900 truncate">{lead.name}</h4>
                          </div>
                          <span className={cn("shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset capitalize", stageBadge(lead.stage))}>
                            {lead.stage.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1.5 mb-3">
                          <DollarSign className="w-3.5 h-3.5 text-accent-600"/>
                          <span className="font-bold text-ink-900">{formatCurrency(lead.value)}</span>
                          <span className="text-xs text-ink-500">· Score {Math.round(lead.leadScore * 100)}%</span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-ink-100/80">
                          <div className="flex items-center gap-2">
                            {staff && (<div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: staff.avatarColor }}>
                                {getInitials(staff.name)}
                              </div>)}
                            <span className="text-xs text-ink-600">{staff?.name ?? "Unassigned"}</span>
                          </div>
                          <div className="text-[11px] text-ink-500">{formatDate(lead.lastUpdated)}</div>
                        </div>
                      </div>);
            })}
                </div>)}
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 border border-ink-200/70 shadow-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-ink-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BriefcaseBusiness className="w-4 h-4 text-accent-700"/>
                <h3 className="font-display text-lg text-ink-900">Active Deals</h3>
                <span className="text-xs font-semibold text-ink-500 px-2 py-0.5 rounded-full bg-ink-100">
                  {customerDeals.length}
                </span>
              </div>
            </div>
            <div className="p-4">
              {customerDeals.length === 0 ? (<div className="py-10 text-center text-sm text-ink-500">No deals for this customer.</div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customerDeals.map((deal: Deal) => {
                const staff = staffById(deal.assignedTo);
                return (<div key={deal.id} className="p-4 rounded-xl border border-ink-200/60 bg-gradient-to-br from-white to-accent-50/30 hover:border-accent-300/70 hover:shadow-soft transition-all">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-ink-900 truncate">{deal.name}</h4>
                          </div>
                          <span className={cn("shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset", dealStageBadge(deal.stage))}>
                            {deal.stage}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1.5 mb-1">
                          <DollarSign className="w-3.5 h-3.5 text-brand-600"/>
                          <span className="font-bold text-ink-900">{formatCurrency(deal.value)}</span>
                        </div>
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-[11px] text-ink-500 mb-1">
                            <span>Win Probability</span>
                            <span className="font-semibold text-ink-700">{deal.winProbability}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-ink-100 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500" style={{ width: `${deal.winProbability}%` }}/>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-ink-100/80">
                          <div className="flex items-center gap-2">
                            {staff && (<div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: staff.avatarColor }}>
                                {getInitials(staff.name)}
                              </div>)}
                            <span className="text-xs text-ink-600 truncate max-w-[100px]">{staff?.name ?? "Unassigned"}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-ink-500">
                            <CalendarDays className="w-3 h-3"/>
                            {formatDate(deal.expectedClose)}
                          </div>
                        </div>
                      </div>);
            })}
                </div>)}
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 border border-ink-200/70 shadow-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-ink-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-violet-600"/>
                <h3 className="font-display text-lg text-ink-900">Activity Timeline</h3>
              </div>
            </div>
            <div className="p-6">
              {customerActivities.length === 0 ? (<div className="py-10 text-center text-sm text-ink-500">No interactions recorded for this customer yet.</div>) : (<ol className="relative border-l-2 border-ink-200/70 space-y-5 pl-6 ml-1">
                  {customerActivities.map((activity, idx) => {
                const Icon = activityIcon(activity.type);
                const staff = staffById(activity.userId);
                return (<li key={activity.id} className="relative animate-stagger" style={{ animationDelay: `${idx * 50}ms` }}>
                        <span className={cn("absolute -left-[34px] w-8 h-8 rounded-xl flex items-center justify-center ring-4 ring-white", activityColor(activity.type))}>
                          <Icon className="w-4 h-4"/>
                        </span>
                        <div className="rounded-xl bg-ink-50/50 border border-ink-200/50 p-4 hover:bg-white hover:shadow-soft transition-all">
                          <div className="flex items-start justify-between gap-3 mb-1.5">
                            <h4 className="font-semibold text-ink-900 text-sm">{activity.title}</h4>
                            <span className="text-[11px] text-ink-500 shrink-0 whitespace-nowrap">
                              {formatDateTime(activity.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-ink-600 leading-relaxed">{activity.description}</p>
                          {staff && (<div className="mt-3 flex items-center gap-2 pt-3 border-t border-ink-100">
                              <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: staff.avatarColor }}>
                                {getInitials(staff.name)}
                              </div>
                              <User className="w-3 h-3 text-ink-400"/>
                              <span className="text-xs text-ink-500">{staff.name}</span>
                              <span className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
                                · {staff.role}
                              </span>
                            </div>)}
                        </div>
                      </li>);
            })}
                </ol>)}
            </div>
          </div>
        </div>
      </div>
    </div>);
}
