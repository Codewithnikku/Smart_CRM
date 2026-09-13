import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/api/client";
import { useCRMStore } from "@/store/crmStore";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("aarav@smartcrm.io");
    const [password, setPassword] = useState("smartcrm123");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const setCurrentUser = useCRMStore((s) => s.setCurrentUser);
    const hydrate = useCRMStore((s) => s.hydrateFromApi);

    const accentText = useMemo(() => {
        return email.trim().toLowerCase().includes("admin") ? "Admin workspace" : "Team workspace";
    }, [email]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const user = await api.login(email, password);
            setCurrentUser(user);
            await hydrate();
            navigate("/");
        }
        catch {
            setError("Invalid email or password. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,52,134,0.12),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(14,131,136,0.14),_transparent_35%)] px-6 py-12 dark:bg-slate-950">
            <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-ink-200/70 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80">
                <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="bg-gradient-to-br from-brand-600 to-accent-500 p-8 text-white sm:p-10">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-white/20 p-3">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Smart CRM</p>
                                <h1 className="text-3xl font-semibold">Welcome back</h1>
                            </div>
                        </div>
                        <p className="mt-6 max-w-md text-sm leading-7 text-white/85">
                            Sign in to view your personal CRM workspace, monitor your deals, and review your team performance.
                        </p>
                        <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm">
                            <p className="font-semibold">{accentText}</p>
                            <p className="mt-1 text-white/80">Use the database-backed user account created in MySQL to sign in.</p>
                        </div>
                    </div>

                    <div className="p-8 sm:p-10">
                        <h2 className="text-2xl font-semibold text-ink-900 dark:text-slate-100">Sign in</h2>
                        <p className="mt-2 text-sm text-ink-500 dark:text-slate-400">Use your CRM email and password to continue.</p>

                        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-ink-700 dark:text-slate-300">Email</span>
                                <div className="flex items-center rounded-2xl border border-ink-200 bg-white px-3 py-3 shadow-sm focus-within:border-brand-400 dark:border-slate-700 dark:bg-slate-800">
                                    <Mail className="mr-2 h-4 w-4 text-ink-400" />
                                    <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="w-full bg-transparent text-sm outline-none dark:text-slate-100" placeholder="name@company.com" />
                                </div>
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-ink-700 dark:text-slate-300">Password</span>
                                <div className="flex items-center rounded-2xl border border-ink-200 bg-white px-3 py-3 shadow-sm focus-within:border-brand-400 dark:border-slate-700 dark:bg-slate-800">
                                    <Lock className="mr-2 h-4 w-4 text-ink-400" />
                                    <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="w-full bg-transparent text-sm outline-none dark:text-slate-100" placeholder="••••••••" />
                                </div>
                            </label>

                            {error && (
                                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                                {loading ? "Signing in..." : "Sign in"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
