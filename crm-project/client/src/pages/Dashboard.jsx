import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api/axios";

const StatCard = ({ label, value }) => (
  <div className="bg-white border rounded-lg p-4 shadow-sm">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-semibold mt-1">{value}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"));
  }, []);

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!stats) return <p className="p-6 text-gray-500">Loading dashboard...</p>;

  const chartData = [
    { name: "Total Leads", value: stats.totalLeads },
    { name: "Qualified", value: stats.qualifiedLeads },
    { name: "Open Opps", value: stats.openOpportunities },
    { name: "Won", value: stats.wonDeals },
    { name: "Lost", value: stats.lostDeals },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total leads" value={stats.totalLeads} />
        <StatCard label="Qualified leads" value={stats.qualifiedLeads} />
        <StatCard label="Open opportunities" value={stats.openOpportunities} />
        <StatCard label="Pipeline value" value={`$${stats.pipelineValue.toLocaleString()}`} />
        <StatCard label="Won deals" value={stats.wonDeals} />
        <StatCard label="Lost deals" value={stats.lostDeals} />
        <StatCard label="Follow-ups due" value={stats.followUpsDue} />
        <StatCard label="Conversion rate" value={`${stats.conversionRate}%`} />
      </div>
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-4">Overview</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
