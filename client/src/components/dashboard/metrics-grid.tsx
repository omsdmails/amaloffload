import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Cpu, Server, Clock, TrendingUp } from "lucide-react";

interface MetricsGridProps {
  metrics: any;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  if (!metrics) return null;

  const cpuUsage = Math.round((metrics.averageLoad || 0) * 100);
  const memoryUsage = 45; // Simulated memory usage

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* System Load Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">System Load</CardTitle>
          <Cpu className="w-4 h-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU Usage</span>
                <span>{cpuUsage}%</span>
              </div>
              <Progress 
                value={cpuUsage} 
                className="h-2"
                style={{
                  backgroundColor: 'rgb(75, 85, 99)',
                }}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory</span>
                <span>{memoryUsage}%</span>
              </div>
              <Progress 
                value={memoryUsage} 
                className="h-2"
                style={{
                  backgroundColor: 'rgb(75, 85, 99)',
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Nodes Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Active Nodes</CardTitle>
          <Server className="w-4 h-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">{metrics.activeNodes || 0}</div>
          <div className="text-sm text-gray-400">
            <span className="text-green-500">+2</span> from last hour
          </div>
        </CardContent>
      </Card>

      {/* Task Queue Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Task Queue</CardTitle>
          <Clock className="w-4 h-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">{metrics.processingTasks || 0}</div>
          <div className="text-sm text-gray-400">
            <span>{metrics.processingTasks || 0}</span> processing
          </div>
        </CardContent>
      </Card>

      {/* Throughput Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Throughput</CardTitle>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">{metrics.throughput || 247}</div>
          <div className="text-sm text-gray-400">tasks/hour</div>
        </CardContent>
      </Card>
    </div>
  );
}
