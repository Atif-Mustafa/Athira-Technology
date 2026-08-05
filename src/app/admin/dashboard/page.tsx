import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";

export default function AdminDashboardPage() {
  const stats = [
    { label: "Active Agent Runs", value: "24", change: "+3 today", positive: true },
    { label: "Lines of Code Generated", value: "128,492", change: "+12,400 this week", positive: true },
    { label: "Successful Deployments", value: "14", change: "100% success rate", positive: true },
  ];

  const activities = [
    { agent: "DevAgent-Alpha", task: "Refactored user authentication flow", time: "10 mins ago", status: "Completed" },
    { agent: "TestAgent-04", task: "Running regression suite on PR #892", time: "25 mins ago", status: "In Progress" },
    { agent: "DeployAgent-Prod", task: "Pushed v2.4.1 to production cluster", time: "2 hours ago", status: "Completed" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-8">System Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </CardHeader>
            <CardContent>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className={stat.positive ? "text-emerald-400 text-xs font-medium" : "text-amber-400 text-xs font-medium"}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Agent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-white/5">
                <div>
                  <p className="text-white text-sm font-medium">{activity.task}</p>
                  <p className="text-slate-500 text-xs mt-1">{activity.agent} • {activity.time}</p>
                </div>
                <div>
                  <Badge variant={activity.status === 'Completed' ? 'success' : 'warning'}>
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
