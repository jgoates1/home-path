import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";

type LoginActivityUser = {
  id: number;
  username: string;
  lastLogin: string;
};

const AdminInsightsPage = () => {
  const [users, setUsers] = useState<LoginActivityUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.getAdminLoginActivity();
        setUsers(response.users ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin insights");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const metrics = useMemo(() => {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const totalUsers = users.length;
    let weeklySignIns = 0;
    let monthlySignIns = 0;

    for (const user of users) {
      const lastLoginTime = new Date(user.lastLogin).getTime();
      if (Number.isNaN(lastLoginTime)) continue;

      if (lastLoginTime >= oneWeekAgo) weeklySignIns += 1;
      if (lastLoginTime >= oneMonthAgo) monthlySignIns += 1;
    }

    const formatPercent = (value: number) => {
      if (totalUsers <= 0) return "0.0%";
      return `${((value / totalUsers) * 100).toFixed(1)}%`;
    };

    return {
      totalUsers,
      weeklySignIns,
      monthlySignIns,
      weeklyActivePercent: formatPercent(weeklySignIns),
      monthlyActivePercent: formatPercent(monthlySignIns),
    };
  }, [users]);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8">Loading admin insights...</div>;
  }

  if (error) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-destructive">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Insights</h1>
      </div>

      <div className="rounded-lg border border-border p-5 bg-card">
        <h2 className="text-lg font-semibold mb-1">Objective</h2>
        <p className="text-sm text-muted-foreground">
          Become the trusted advisor through the duration of the homebuying journey
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border p-5 bg-card">
          <h2 className="text-lg font-semibold">Weekly Active %</h2>
          <p className="text-4xl font-bold mt-3">{metrics.weeklyActivePercent}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {metrics.weeklySignIns} / {metrics.totalUsers} users
          </p>
        </div>
        <div className="rounded-lg border border-border p-5 bg-card">
          <h2 className="text-lg font-semibold">30-Day Active %</h2>
          <p className="text-4xl font-bold mt-3">{metrics.monthlyActivePercent}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {metrics.monthlySignIns} / {metrics.totalUsers} users
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border p-5 bg-card">
        <h2 className="text-lg font-semibold mb-2">OKRs</h2>
        <ul className="space-y-2 text-sm">
          <li>Increase weekly signed-in users by 15% this quarter.</li>
          <li>Increase monthly returning users by 20% by end of quarter.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminInsightsPage;
