import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Download } from "lucide-react";
import type { SystemLog } from "@shared/schema";

interface SystemLogsProps {
  logs: SystemLog[];
}

export function SystemLogs({ logs }: SystemLogsProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-lg font-semibold">System Logs</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Filter className="w-4 h-4 mr-1" />
            Filter
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getLevelColor(log.level)}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{log.message}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {formatTimestamp(log.timestamp)}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">{log.source}</div>
              </div>
            </div>
          ))}
          
          {logs.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No system logs available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
