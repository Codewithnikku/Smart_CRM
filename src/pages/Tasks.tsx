import { useMemo } from "react";
import { Plus, CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import { useCRMStore } from "@/store/crmStore";
import type { Task, TaskStatus, TaskPriority } from "@/types";
import { cn } from "@/lib/utils";
const columns: {
    key: TaskStatus;
    label: string;
    accent: string;
    dotBg: string;
}[] = [
    { key: "todo", label: "To Do", accent: "text-brand-600", dotBg: "bg-brand-400" },
    { key: "in_progress", label: "In Progress", accent: "text-accent-600", dotBg: "bg-accent-400" },
    { key: "done", label: "Done", accent: "text-ink-500", dotBg: "bg-ink-300" },
];
const priorityStyles: Record<TaskPriority, string> = {
    high: "bg-red-500",
    medium: "bg-yellow-400",
    low: "bg-blue-400",
};
function getInitials(name: string): string {
    return name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}
function formatDate(due: string): string {
    const d = new Date(due + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function isOverdue(due: string, status: TaskStatus): boolean {
    if (status === "done")
        return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(due + "T00:00:00");
    return d < today;
}
function isDueToday(due: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(due + "T00:00:00");
    return d.getTime() === today.getTime();
}
function TaskCard({ task, index }: {
    task: Task;
    index: number;
}) {
    const getStaffById = useCRMStore((s) => s.getStaffById);
    const toggleTaskStatus = useCRMStore((s) => s.toggleTaskStatus);
    const staff = getStaffById(task.assignee);
    const overdue = isOverdue(task.dueDate, task.status);
    const today = isDueToday(task.dueDate);
    const checked = task.status === "done";
    return (<div className={cn("group relative bg-white rounded-2xl p-4 shadow-soft border border-ink-100 dark:border-slate-700 dark:bg-slate-900", "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300", checked && "opacity-70")} style={{ animation: `stagger 0.5s ease-out ${index * 60}ms both` }}>
      <div className="flex items-start gap-3">
        <button onClick={() => toggleTaskStatus(task.id)} className="mt-0.5 shrink-0 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2" aria-label="Toggle task status">
          {checked ? (<CheckCircle2 className="w-5 h-5 text-accent-500 fill-accent-50"/>) : (<Circle className="w-5 h-5 text-ink-300 group-hover:text-brand-400 transition-colors"/>)}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span className={cn("mt-1.5 w-2 h-2 rounded-full shrink-0 shadow-sm", priorityStyles[task.priority])} aria-label={`${task.priority} priority`}/>
            <h3 className={cn("font-semibold text-sm text-ink-900 leading-snug", checked && "line-through text-ink-400")}>
              {task.title}
            </h3>
          </div>

          <p className={cn("mt-1.5 text-xs text-ink-500 line-clamp-2 leading-relaxed", checked && "line-through")}>
            {task.description}
          </p>

          <div className="mt-3.5 flex items-center justify-between gap-2 flex-wrap">
            <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border", overdue &&
            "bg-red-50 text-red-700 border-red-200 animate-pulse", !overdue && today && "bg-yellow-50 text-yellow-700 border-yellow-200", !overdue && !today && "bg-ink-50 text-ink-600 border-ink-100")}>
              {overdue && <AlertTriangle className="w-3 h-3"/>}
              {formatDate(task.dueDate)}
              {overdue && " · Overdue"}
              {!overdue && today && " · Today"}
            </span>

            {staff && (<div className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-semibold text-white shadow-sm ring-2 ring-white" style={{ backgroundColor: staff.avatarColor }} title={staff.name}>
                {getInitials(staff.name)}
              </div>)}
          </div>
        </div>
      </div>
    </div>);
}
function Column({ col, tasks, }: {
    col: (typeof columns)[number];
    tasks: Task[];
}) {
    return (<div className="flex flex-col min-w-0">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <span className={cn("w-2 h-2 rounded-full", col.dotBg)}/>
          <h2 className={cn("font-display text-lg tracking-tight", col.accent)}>
            {col.label}
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-white border border-ink-100 text-xs font-medium text-ink-500 shadow-sm">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-h-[200px] rounded-2xl bg-ink-50/60 border border-ink-100 p-3 dark:border-slate-700 dark:bg-slate-800/60">
        {tasks.length === 0 ? (<div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 text-ink-400">
            <div className="w-12 h-12 rounded-2xl bg-white border border-ink-100 flex items-center justify-center mb-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <CheckCircle2 className="w-6 h-6 opacity-40"/>
            </div>
            <p className="text-sm font-medium">No tasks</p>
            <p className="text-xs mt-0.5">Drag cards here to update status</p>
          </div>) : (tasks.map((t, i) => <TaskCard key={t.id} task={t} index={i}/>))}
      </div>
    </div>);
}
export default function Tasks() {
    const tasks = useCRMStore((s) => s.tasks);
    const grouped = useMemo(() => {
        return {
            todo: tasks.filter((t) => t.status === "todo"),
            in_progress: tasks.filter((t) => t.status === "in_progress"),
            done: tasks.filter((t) => t.status === "done"),
        };
    }, [tasks]);
    const counts = useMemo(() => {
        const open = grouped.todo.length;
        const inProgress = grouped.in_progress.length;
        const done = grouped.done.length;
        return { open, inProgress, done, total: open + inProgress + done };
    }, [grouped]);
    return (<div className="flex flex-col gap-6 h-full">
      <div className="animate-fade-in flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-brand-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand-400"/>
            <div>
              <p className="text-[11px] font-medium text-ink-500 uppercase tracking-wider">
                Open
              </p>
              <p className="text-xl font-display text-brand-700 leading-none">
                {counts.open}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-accent-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-accent-400"/>
            <div>
              <p className="text-[11px] font-medium text-ink-500 uppercase tracking-wider">
                In Progress
              </p>
              <p className="text-xl font-display text-accent-700 leading-none">
                {counts.inProgress}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-ink-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-ink-300"/>
            <div>
              <p className="text-[11px] font-medium text-ink-500 uppercase tracking-wider">
                Done
              </p>
              <p className="text-xl font-display text-ink-600 leading-none">
                {counts.done}
              </p>
            </div>
          </div>
        </div>

        <button type="button" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-600 text-white font-semibold text-sm shadow-soft hover:bg-brand-700 hover:shadow-md active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2">
          <Plus className="w-4 h-4"/>
          New Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
        {columns.map((col) => (<Column key={col.key} col={col} tasks={grouped[col.key]}/>))}
      </div>
    </div>);
}
