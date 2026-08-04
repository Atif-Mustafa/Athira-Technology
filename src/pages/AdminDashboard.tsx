import { useState } from "react";
import { motion } from "motion/react";
import { Lock, LayoutDashboard, Users, Activity, Settings, LogOut } from "lucide-react";

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock authentication for demonstration
    if (password === "admin") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid credentials. Hint: use 'admin'");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-950/40 border border-slate-800 p-8 rounded-2xl w-full max-w-md"
        >
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Access Token / Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30"
                placeholder="Enter password"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-colors"
            >
              Authenticate
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      
      {/* Sidebar */}
      <div className="w-full md:w-64 space-y-2">
        <div className="p-4 mb-4 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-gray-700 to-gray-500 rounded-full"></div>
          <div>
            <p className="text-white font-medium text-sm">System Admin</p>
            <p className="text-slate-400 text-xs">Auth Level: 1</p>
          </div>
        </div>
        
        {[
          { icon: <LayoutDashboard className="w-4 h-4" />, label: "Overview", active: true },
          { icon: <Users className="w-4 h-4" />, label: "Agent Instances" },
          { icon: <Activity className="w-4 h-4" />, label: "System Logs" },
          { icon: <Settings className="w-4 h-4" />, label: "Settings" },
        ].map((item, i) => (
          <button
            key={i}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
              item.active 
                ? "bg-blue-600 text-white font-semibold" 
                : "text-slate-400 hover:text-white hover:bg-slate-900/50"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
        
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-colors mt-8"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">System Overview</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Active Agent Runs", value: "24", change: "+3 today" },
            { label: "Lines of Code Generated", value: "128,492", change: "+12,400 this week" },
            { label: "Successful Deployments", value: "14", change: "100% success rate" },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl">
              <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-green-400 text-xs font-medium">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Agent Activity</h3>
          <div className="space-y-4">
            {[
              { agent: "DevAgent-Alpha", task: "Refactored user authentication flow", time: "10 mins ago", status: "Completed" },
              { agent: "TestAgent-04", task: "Running regression suite on PR #892", time: "25 mins ago", status: "In Progress" },
              { agent: "DeployAgent-Prod", task: "Pushed v2.4.1 to production cluster", time: "2 hours ago", status: "Completed" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-white/5">
                <div>
                  <p className="text-white text-sm font-medium">{activity.task}</p>
                  <p className="text-slate-500 text-xs mt-1">{activity.agent} • {activity.time}</p>
                </div>
                <div>
                  <span className={`px-2.5 py-1 text-xs rounded-full ${
                    activity.status === 'Completed' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
