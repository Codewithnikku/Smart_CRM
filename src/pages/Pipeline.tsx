import { useCRMStore } from "@/store/crmStore";
import type { Lead, LeadStage, Staff } from "@/types";
import { Sparkles, PhoneCall, Target, FileText, Trophy, XCircle, Building2, IndianRupee, Users, } from "lucide-react";
const STAGES: {
    id: LeadStage;
    label: string;
    icon: React.ComponentType<{
        className?: string;
    }>;
    dot: string;
    bar: string;
}[] = [
    { id: "new", label: "New", icon: Sparkles, dot: "bg-brand-500", bar: "bg-brand-500" },
    { id: "contacted", label: "Contacted", icon: PhoneCall, dot: "bg-brand-400", bar: "bg-brand-400" },
    { id: "qualified", label: "Qualified", icon: Target, dot: "bg-accent-400", bar: "bg-accent-400" },
    { id: "proposal", label: "Proposal", icon: FileText, dot: "bg-accent-500", bar: "bg-accent-500" },
    { id: "won", label: "Won", icon: Trophy, dot: "bg-emerald-500", bar: "bg-emerald-500" },
    { id: "lost", label: "Lost", icon: XCircle, dot: "bg-rose-500", bar: "bg-rose-500" },
];
function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1)
        return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function scoreBadge(score: number) {
    const pct = Math.round(score * 100);
    if (score >= 0.8) {
        return { cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", pct };
    }
    if (score >= 0.5) {
        return { cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", pct };
    }
    return { cls: "bg-rose-50 text-rose-700 ring-1 ring-rose-200", pct };
}
function formatINR(value: number): string {
    const safeValue = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(safeValue);
}
interface LeadCardProps {
    lead: Lead;
    staff: Staff | undefined;
    index: number;
    columnIndex: number;
}
function LeadCard({ lead, staff, index, columnIndex }: LeadCardProps) {
    const badge = scoreBadge(lead.leadScore);
    const delay = columnIndex * 80 + index * 70;
    return (<article draggable onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", lead.id);
        }} style={{ animationDelay: `${delay}ms` }} className="group animate-stagger cursor-grab rounded-2xl bg-white p-4 shadow-soft ring-1 ring-ink-100 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-brand-200 active:cursor-grabbing dark:border dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-semibold text-ink-950">{lead.name}</h4>
          <div className="mt-1 flex items-center gap-1 text-xs text-ink-500">
            <Building2 className="h-3 w-3 shrink-0"/>
            <span className="truncate">{lead.company}</span>
          </div>
        </div>
        <div title={staff?.name ?? "Unassigned"} className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold text-white shadow-sm" style={{ backgroundColor: staff?.avatarColor ?? "#3B3486" }}>
          {staff ? getInitials(staff.name) : "??"}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div className="flex items-center gap-1 text-sm font-semibold text-ink-900">
          <IndianRupee className="h-3.5 w-3.5 text-brand-600"/>
          {Number.isFinite(Number(lead.value)) ? Number(lead.value).toLocaleString("en-IN") : "0"}
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.cls}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70"/>
          {badge.pct}%
        </span>
      </div>
    </article>);
}
const EMPTY_ICON_STROKE = { className: "h-5 w-5 stroke-[1.75]" };
export default function Pipeline() {
    const leads = useCRMStore((s) => s.leads);
    const staff = useCRMStore((s) => s.staff);
    const getStaffById = useCRMStore((s) => s.getStaffById);
    const updateLeadStage = useCRMStore((s) => s.updateLeadStage);
    return (<div className="h-full w-full">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 px-1">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-ink-500">
            <Users className="h-4 w-4 text-brand-500"/>
            <span>Sales pipeline</span>
          </div>
          <h1 className="mt-1 font-display text-3xl text-ink-950 tracking-tight">
            Pipeline Kanban
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Drag leads across stages to update their progress — everything saves instantly.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 shadow-soft ring-1 ring-ink-100 dark:border dark:border-slate-700 dark:bg-slate-900">
          <IndianRupee className="h-4 w-4 text-accent-600"/>
          <span className="text-xs text-ink-500">Total pipeline</span>
          <span className="ml-1 font-semibold text-ink-950">
            {formatINR(leads.reduce((sum, l) => sum + (Number.isFinite(Number(l.value)) ? Number(l.value) : 0), 0))}
          </span>
        </div>
      </header>

      <div className="grid h-full grid-cols-1 gap-4 pb-12 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {STAGES.map((stage, colIdx) => {
            const Icon = stage.icon;
            const columnLeads = leads.filter((l) => l.stage === stage.id);
            const total = columnLeads.reduce((sum, l) => sum + (Number.isFinite(Number(l.value)) ? Number(l.value) : 0), 0);
            return (<section key={stage.id} onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                }} onDrop={(e) => {
                    e.preventDefault();
                    const leadId = e.dataTransfer.getData("text/plain");
                    if (leadId)
                        updateLeadStage(leadId, stage.id);
                }} style={{ animationDelay: `${colIdx * 90}ms` }} className="animate-slide-up flex min-h-[320px] flex-col rounded-2xl bg-gradient-to-b from-white to-ink-50/60 p-4 shadow-soft ring-1 ring-ink-100 transition hover:ring-brand-200">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${stage.dot} shadow-sm`}/>
                  <h2 className="text-sm font-semibold text-ink-900">{stage.label}</h2>
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-600 dark:bg-slate-800 dark:text-slate-300">
                    {columnLeads.length}
                  </span>
                </div>
                <Icon {...EMPTY_ICON_STROKE} className="h-4 w-4 text-ink-400"/>
              </div>

              <div className={`mb-4 h-1 w-full rounded-full ${stage.bar} opacity-80`}/>

              <div className="mb-4 flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-ink-100 dark:border dark:border-slate-700 dark:bg-slate-900">
                <span className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Value
                </span>
                <span className="flex items-center gap-0.5 text-sm font-semibold text-ink-900">
                  <IndianRupee className="h-3 w-3 text-accent-600"/>
                  {total.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1 scrollbar-thin">
                {columnLeads.map((lead, idx) => (<LeadCard key={lead.id} lead={lead} staff={getStaffById(lead.assignedTo)} index={idx} columnIndex={colIdx}/>))}
                {columnLeads.length === 0 && (<div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-200 bg-white/40 py-8 text-center">
                    <Icon className="h-6 w-6 text-ink-300"/>
                    <p className="mt-2 text-xs text-ink-400">No leads yet</p>
                    <p className="text-[11px] text-ink-400">Drop a card here</p>
                  </div>)}
              </div>
            </section>);
        })}
      </div>
    </div>);
}
