import { 
  Server, 
  Activity, 
  BarChart3, 
  Shield, 
  Settings, 
  Network 
} from "lucide-react";
import { Link, useLocation } from "wouter";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Activity, count: null },
    { href: "/nodes", label: "Nodes", icon: Server, count: "4" },
    { href: "/tasks", label: "Tasks", icon: BarChart3, count: "12" },
    { href: "/analytics", label: "Analytics", icon: BarChart3, count: null },
    { href: "/security", label: "Security", icon: Shield, count: null },
    { href: "/settings", label: "Settings", icon: Settings, count: null },
  ];

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Network className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">DTS</h1>
            <p className="text-xs text-gray-400">Distributed Task System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.count && (
                    <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                      item.label === "Nodes" 
                        ? "bg-green-600 text-white" 
                        : "bg-yellow-500 text-gray-900"
                    }`}>
                      {item.count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-gray-300">System Online</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Uptime: <span>2d 14h 32m</span>
        </div>
      </div>
    </div>
  );
}
