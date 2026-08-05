import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";

export default function AdminDashboardPage() {
  const stats = [
    { label: "Agent Runs", value: "—", detail: "No live data connected" },
    { label: "Generated Code", value: "—", detail: "No live data connected" },
    { label: "Deployments", value: "—", detail: "No live data connected" },
  ];

  const activities = [
    { agent: "Example Agent", task: "Example planning activity", time: "Static placeholder", status: "Demo" },
    { agent: "Example Agent", task: "Example testing activity", time: "Static placeholder", status: "Demo" },
    { agent: "Example Agent", task: "Example deployment activity", time: "Static placeholder", status: "Demo" },
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
              <p className="text-slate-500 text-xs font-medium">{stat.detail}</p>
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
                  <Badge variant="outline">
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
