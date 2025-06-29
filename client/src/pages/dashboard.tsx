import { useSystemData } from "@/hooks/use-system-data";
import { useWebSocket } from "@/hooks/use-websocket";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/topbar";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { NodesTable } from "@/components/dashboard/nodes-table";
import { TaskActivity } from "@/components/dashboard/task-activity";
import { SecurityPanel } from "@/components/dashboard/security-panel";
import { SystemLogs } from "@/components/dashboard/system-logs";
import { TaskExecutor } from "@/components/dashboard/task-executor";

export default function Dashboard() {
  const { data: systemData, isLoading } = useSystemData();
  const { isConnected } = useWebSocket();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="text-white">Loading system data...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          isConnected={isConnected}
          systemData={systemData}
        />
        
        <main className="flex-1 overflow-auto p-6">
          <MetricsGrid metrics={systemData?.stats} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            <TaskExecutor className="lg:col-span-1 xl:col-span-1" />
            <NodesTable nodes={systemData?.nodes || []} className="lg:col-span-1 xl:col-span-2" />
            <TaskActivity tasks={systemData?.tasks || []} className="lg:col-span-2 xl:col-span-3" />
          </div>
          
          <SecurityPanel />
          
          <SystemLogs logs={systemData?.logs || []} />
        </main>
      </div>
    </div>
  );
}
