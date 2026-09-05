export interface Customer {
    id: string;
    name: string;
    email: string;
    company: string;
    phone: string;
    createdAt: string;
    churnScore: number;
    industry: string;
    location: string;
    avatarColor: string;
}
export type LeadStage = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
export interface Lead {
    id: string;
    customerId: string;
    name: string;
    company: string;
    stage: LeadStage;
    value: number;
    leadScore: number;
    assignedTo: string;
    lastUpdated: string;
    notes: string;
}
export interface Deal {
    id: string;
    customerId: string;
    name: string;
    stage: string;
    value: number;
    winProbability: number;
    expectedClose: string;
    assignedTo: string;
}
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    assignee: string;
    relatedTo: string;
    createdAt: string;
}
export interface Staff {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarColor: string;
}
export interface ActivityItem {
    id: string;
    type: "note" | "call" | "meeting" | "email" | "task";
    customerId?: string;
    title: string;
    description: string;
    timestamp: string;
    userId: string;
}
