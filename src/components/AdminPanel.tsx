import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Settings, ShieldCheck, SunMedium, MoonStar } from "lucide-react";
import { useCRMStore } from "@/store/crmStore";
import type { LeadStage, TaskStatus } from "@/types";

type AdminPanelProps = {
    theme: "light" | "dark";
    toggleTheme: () => void;
};

const leadStages: LeadStage[] = ["new", "contacted", "qualified", "proposal", "won", "lost"];
const taskStatuses: TaskStatus[] = ["todo", "in_progress", "done"];

export default function AdminPanel({ theme, toggleTheme }: AdminPanelProps) {
    const [open, setOpen] = useState(false);
    const [customerId, setCustomerId] = useState("");
    const [churnScore, setChurnScore] = useState("0.2");
    const [leadId, setLeadId] = useState("");
    const [leadStage, setLeadStage] = useState<LeadStage>("qualified");
    const [taskId, setTaskId] = useState("");
    const [taskStatus, setTaskStatus] = useState<TaskStatus>("in_progress");
    const [busy, setBusy] = useState<"customer" | "lead" | "task" | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    const customers = useCRMStore((s) => s.customers);
    const leads = useCRMStore((s) => s.leads);
    const tasks = useCRMStore((s) => s.tasks);
    const updateCustomerChurnScore = useCRMStore((s) => s.updateCustomerChurnScore);
    const updateLeadStage = useCRMStore((s) => s.updateLeadStage);
    const updateTaskStatus = useCRMStore((s) => s.updateTaskStatus);

    const handleCustomerSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!customerId) {
            setFeedback("Choose a customer before updating their score.");
            return;
        }

        setBusy("customer");
        setFeedback(null);
        try {
            await updateCustomerChurnScore(customerId, Number(churnScore));
            setFeedback("Customer churn score updated.");
        }
        catch {
            setFeedback("The update could not be saved. Please try again.");
        }
        finally {
            setBusy(null);
        }
    };

    const handleLeadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!leadId) {
            setFeedback("Select a lead before changing its stage.");
            return;
        }

        setBusy("lead");
        setFeedback(null);
        try {
            await updateLeadStage(leadId, leadStage);
            setFeedback("Lead stage updated.");
        }
        catch {
            setFeedback("The lead could not be updated.");
        }
        finally {
            setBusy(null);
        }
    };

    const handleTaskSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!taskId) {
            setFeedback("Select a task before changing its status.");
            return;
        }

        setBusy("task");
        setFeedback(null);
        try {
            await updateTaskStatus(taskId, taskStatus);
            setFeedback("Task status updated.");
        }
        catch {
            setFeedback("The task could not be updated.");
        }
        finally {
            setBusy(null);
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-ink-600 hover:bg-ink-100 hover:text-brand-700 transition-colors dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-brand-300"
                aria-label="Open DBA controls"
            >
                <Settings className="w-[18px] h-[18px]" />
            </button>

            {open && (
                <div className="absolute right-0 mt-3 w-[360px] rounded-2xl border border-ink-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-ink-800 dark:text-slate-100">DBA controls</p>
                            <p className="text-xs text-ink-500 dark:text-slate-400">Adjust CRM records directly.</p>
                        </div>
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="rounded-xl border border-ink-200/80 bg-ink-50 px-2.5 py-2 text-sm text-ink-700 transition-colors hover:bg-ink-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            {theme === "dark" ? <SunMedium className="w-4 h-4" /> : <MoonStar className="w-4 h-4" />}
                        </button>
                    </div>

                    {feedback && (
                        <div className={`mt-3 rounded-xl border px-3 py-2 text-sm ${feedback.includes("updated") || feedback.includes("saved") ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"}`}>
                            <div className="flex items-center gap-2">
                                {feedback.includes("updated") || feedback.includes("saved") ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                <span>{feedback}</span>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 space-y-3">
                        <form onSubmit={handleCustomerSubmit} className="rounded-xl border border-ink-200/70 p-3 dark:border-slate-700">
                            <div className="flex items-center gap-2 text-sm font-semibold text-ink-700 dark:text-slate-200">
                                <ShieldCheck className="w-4 h-4 text-brand-600" />
                                Customer risk
                            </div>
                            <label className="mt-2 block text-xs font-medium uppercase tracking-[0.18em] text-ink-500 dark:text-slate-400">Customer</label>
                            <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-brand-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                <option value="">Select a customer</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>{customer.name} • {customer.company}</option>
                                ))}
                            </select>
                            <label className="mt-2 block text-xs font-medium uppercase tracking-[0.18em] text-ink-500 dark:text-slate-400">Churn score</label>
                            <input type="number" min="0" max="1" step="0.01" value={churnScore} onChange={(event) => setChurnScore(event.target.value)} className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-brand-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
                            <button type="submit" disabled={busy === "customer"} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70">
                                {busy === "customer" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Save score
                            </button>
                        </form>

                        <form onSubmit={handleLeadSubmit} className="rounded-xl border border-ink-200/70 p-3 dark:border-slate-700">
                            <div className="flex items-center gap-2 text-sm font-semibold text-ink-700 dark:text-slate-200">
                                <ShieldCheck className="w-4 h-4 text-accent-600" />
                                Lead stage
                            </div>
                            <label className="mt-2 block text-xs font-medium uppercase tracking-[0.18em] text-ink-500 dark:text-slate-400">Lead</label>
                            <select value={leadId} onChange={(event) => setLeadId(event.target.value)} className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-brand-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                <option value="">Select a lead</option>
                                {leads.map((lead) => (
                                    <option key={lead.id} value={lead.id}>{lead.name} • {lead.company}</option>
                                ))}
                            </select>
                            <label className="mt-2 block text-xs font-medium uppercase tracking-[0.18em] text-ink-500 dark:text-slate-400">Stage</label>
                            <select value={leadStage} onChange={(event) => setLeadStage(event.target.value as LeadStage)} className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-brand-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                {leadStages.map((stage) => (
                                    <option key={stage} value={stage}>{stage}</option>
                                ))}
                            </select>
                            <button type="submit" disabled={busy === "lead"} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-70">
                                {busy === "lead" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Update lead
                            </button>
                        </form>

                        <form onSubmit={handleTaskSubmit} className="rounded-xl border border-ink-200/70 p-3 dark:border-slate-700">
                            <div className="flex items-center gap-2 text-sm font-semibold text-ink-700 dark:text-slate-200">
                                <ShieldCheck className="w-4 h-4 text-amber-600" />
                                Task status
                            </div>
                            <label className="mt-2 block text-xs font-medium uppercase tracking-[0.18em] text-ink-500 dark:text-slate-400">Task</label>
                            <select value={taskId} onChange={(event) => setTaskId(event.target.value)} className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-brand-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                <option value="">Select a task</option>
                                {tasks.map((task) => (
                                    <option key={task.id} value={task.id}>{task.title}</option>
                                ))}
                            </select>
                            <label className="mt-2 block text-xs font-medium uppercase tracking-[0.18em] text-ink-500 dark:text-slate-400">Status</label>
                            <select value={taskStatus} onChange={(event) => setTaskStatus(event.target.value as TaskStatus)} className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-brand-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                {taskStatuses.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            <button type="submit" disabled={busy === "task"} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70">
                                {busy === "task" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Update task
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
