#!/usr/bin/env node
import "dotenv/config";
const API_BASE = `http://localhost:${process.env.API_PORT ?? 4000}/api`;
const TIMEOUT = 5000;
async function fetchJson<T>(url: string): Promise<T | null> {
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as T;
    }
    catch (err) {
        console.error(`❌ ${url}:`, err instanceof Error ? err.message : err);
        return null;
    }
}
async function main() {
    console.log("\n🧪 Smart CRM API Verification\n");
    console.log(`Base URL: ${API_BASE}\n`);
    console.log("1️⃣  Health Check");
    const health = await fetchJson<any>(`http://localhost:${process.env.API_PORT ?? 4000}/healthz`);
    if (health) {
        console.log(`   ✅ API Server: RUNNING on port ${process.env.API_PORT ?? 4000}`);
        console.log(`   ✅ Database: ${health.database ? "CONNECTED" : "DISCONNECTED"}`);
    }
    else {
        console.log("   ❌ API Server: NOT RESPONDING");
        return;
    }
    console.log("\n2️⃣  Dashboard KPIs");
    const kpis = await fetchJson<any>(`${API_BASE}/dashboard/kpis`);
    if (kpis) {
        console.log(`   💰 Revenue (YTD): $${Number(kpis.revenue).toLocaleString()}`);
        console.log(`   📊 Total Leads: ${kpis.leads}`);
        console.log(`   📈 Conversion Rate: ${(kpis.conversionRate * 100).toFixed(1)}%`);
        console.log(`   ⚠️  At-Risk Customers: ${kpis.atRiskChurn}`);
        console.log(`   🎉 Won Deals (This Month): ${kpis.wonDealsThisMonth}`);
    }
    console.log("\n3️⃣  Customers");
    const customers = await fetchJson<any[]>(`${API_BASE}/customers`);
    if (customers && customers.length > 0) {
        console.log(`   ✅ Total Customers: ${customers.length}`);
        console.log(`   📋 Sample: ${customers[0].name} (${customers[0].company})`);
        const atRisk = customers.filter((c: any) => c.churn_score >= 0.4).length;
        console.log(`   ⚠️  High Churn Risk: ${atRisk} customers`);
    }
    console.log("\n4️⃣  Leads");
    const leads = await fetchJson<any[]>(`${API_BASE}/leads`);
    if (leads && leads.length > 0) {
        console.log(`   ✅ Total Leads: ${leads.length}`);
        const byStage = leads.reduce((acc: any, l: any) => {
            acc[l.stage] = (acc[l.stage] || 0) + 1;
            return acc;
        }, {});
        console.log(`   📊 Pipeline: ${Object.entries(byStage).map(([s, c]) => `${s}(${c})`).join(", ")}`);
    }
    console.log("\n5️⃣  Deals");
    const deals = await fetchJson<any[]>(`${API_BASE}/deals`);
    if (deals && deals.length > 0) {
        console.log(`   ✅ Total Deals: ${deals.length}`);
        const totalValue = deals.reduce((sum: number, d: any) => sum + (d.value || 0), 0);
        console.log(`   💵 Total Pipeline Value: $${totalValue.toLocaleString()}`);
        const wonDeals = deals.filter((d: any) => d.stage === "Closed Won");
        console.log(`   🎯 Won Deals: ${wonDeals.length}`);
    }
    console.log("\n6️⃣  Tasks");
    const tasks = await fetchJson<any[]>(`${API_BASE}/tasks`);
    if (tasks && tasks.length > 0) {
        console.log(`   ✅ Total Tasks: ${tasks.length}`);
        const byStatus = tasks.reduce((acc: any, t: any) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
        }, {});
        console.log(`   📋 Status: ${Object.entries(byStatus).map(([s, c]) => `${s}(${c})`).join(", ")}`);
    }
    console.log("\n7️⃣  Staff");
    const staff = await fetchJson<any[]>(`${API_BASE}/staff`);
    if (staff && staff.length > 0) {
        console.log(`   ✅ Team Members: ${staff.length}`);
        staff.forEach((s: any) => {
            console.log(`      • ${s.name} (${s.role})`);
        });
    }
    console.log("\n8️⃣  Recent Activity");
    const activity = await fetchJson<any[]>(`${API_BASE}/dashboard/activity`);
    if (activity && activity.length > 0) {
        console.log(`   ✅ Recent Interactions: ${activity.length}`);
        activity.slice(0, 3).forEach((a: any) => {
            console.log(`      • [${a.type}] ${a.title}`);
        });
    }
    console.log("\n9️⃣  At-Risk Customers");
    const atRisk = await fetchJson<any[]>(`${API_BASE}/dashboard/at-risk`);
    if (atRisk && atRisk.length > 0) {
        console.log(`   ✅ At-Risk Count: ${atRisk.length}`);
        atRisk.slice(0, 3).forEach((c: any) => {
            const riskLevel = c.churn_score >= 0.4 ? "🔴 HIGH" : "🟡 MEDIUM";
            console.log(`      • ${c.name} - Score: ${(c.churn_score * 100).toFixed(0)}% ${riskLevel}`);
        });
    }
    console.log("\n🔟 Monthly Revenue");
    const revenue = await fetchJson<any[]>(`${API_BASE}/dashboard/revenue`);
    if (revenue && revenue.length > 0) {
        console.log(`   ✅ Data Points: ${revenue.length} months`);
        const lastMonth = revenue[revenue.length - 1];
        console.log(`      • Latest Month (${lastMonth.month_label}): $${Number(lastMonth.won_value).toLocaleString()} won`);
    }
    console.log("\n✅ Verification Complete!\n");
    console.log("📌 Frontend: http://localhost:5173");
    console.log("📌 Backend API: http://localhost:4000");
    console.log("📌 MySQL: localhost:3306 (smart_crm database)\n");
}
main().catch(console.error);
