import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Loader2, XCircle } from "lucide-react";
import type { Task } from "@shared/schema";

interface TaskActivityProps {
  tasks: Task[];
  className?: string;
}

export function TaskActivity({ tasks, className }: TaskActivityProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-white" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-white animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-900" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-white" />;
      default:
        return <Clock className="w-4 h-4 text-gray-900" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'processing':
        return 'bg-blue-600';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'processing':
        return 'text-blue-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDuration = (duration: number | null) => {
    if (!duration) return '-';
    return `${duration.toFixed(1)}s`;
  };

  return (
    <Card className={`bg-gray-800 border-gray-700 ${className || ''}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusColor(task.status)}`}>
                  {getStatusIcon(task.status)}
                </div>
                <div>
                  <div className="font-medium">{task.name}</div>
                  <div className="text-sm text-gray-400">
                    {task.nodeId ? `node-${task.nodeId.toString().padStart(3, '0')}` : 'Queue'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getStatusTextColor(task.status)}`}>
                  {getStatusText(task.status)}
                </div>
                <div className="text-xs text-gray-400">
                  {formatDuration(task.duration)}
                </div>
              </div>
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No recent tasks
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
