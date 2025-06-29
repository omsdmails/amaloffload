import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Node } from "@shared/schema";

interface NodesTableProps {
  nodes: Node[];
}

export function NodesTable({ nodes }: NodesTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getLoadColor = (load: number) => {
    if (load > 0.8) return 'text-red-400';
    if (load > 0.6) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-lg font-semibold">Connected Nodes</CardTitle>
        <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {nodes.map((node) => (
            <div key={node.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(node.status)}`} />
                <div>
                  <div className="font-medium">{node.name}</div>
                  <div className="text-sm text-gray-400">{node.ip}:{node.port}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getLoadColor(node.load)}`}>
                  {Math.round(node.load * 100)}%
                </div>
                <div className="text-xs text-gray-400">Load</div>
              </div>
            </div>
          ))}
          
          {nodes.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No nodes connected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
