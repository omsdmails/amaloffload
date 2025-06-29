import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TaskExecutorProps {
  className?: string;
}

const availableTasks = [
  { name: 'matrix_multiply', label: 'Matrix Multiplication', complexity: 'High', args: ['size'] },
  { name: 'prime_calculation', label: 'Prime Number Calculation', complexity: 'Medium', args: ['limit'] },
  { name: 'data_processing', label: 'Data Processing', complexity: 'Medium', args: ['dataSize'] },
  { name: 'image_processing', label: 'Image Processing', complexity: 'High', args: ['iterations'] },
];

export function TaskExecutor({ className }: TaskExecutorProps) {
  const [selectedTask, setSelectedTask] = useState('');
  const [taskArgs, setTaskArgs] = useState<{ [key: string]: string }>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const executeTaskMutation = useMutation({
    mutationFn: async ({ functionName, args }: { functionName: string; args: any[] }) => {
      const response = await fetch('/api/execute-smart', {
        method: 'POST',
        body: JSON.stringify({ functionName, args }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Task Completed Successfully",
        description: `Task finished in ${data.duration || 'N/A'}ms with smart offloading`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/system/overview"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Task Execution Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTask) {
      toast({
        title: "No Task Selected",
        description: "Please select a task to execute",
        variant: "destructive",
      });
      return;
    }

    const task = availableTasks.find(t => t.name === selectedTask);
    if (!task) return;

    // Convert string arguments to appropriate types
    const args = task.args.map(argName => {
      const value = taskArgs[argName];
      return value ? (isNaN(Number(value)) ? value : Number(value)) : 100;
    });

    executeTaskMutation.mutate({ functionName: selectedTask, args });
  };

  const handleArgChange = (argName: string, value: string) => {
    setTaskArgs(prev => ({ ...prev, [argName]: value }));
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'High': return 'bg-red-600';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const selectedTaskData = availableTasks.find(t => t.name === selectedTask);

  return (
    <Card className={`bg-gray-800 border-gray-700 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Zap className="w-5 h-5 mr-2 text-blue-400" />
          Smart Task Executor
        </CardTitle>
        <Badge variant="outline" className="text-blue-400 border-blue-400">
          AI-Powered Offloading
        </Badge>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-select">Task Type</Label>
            <Select value={selectedTask} onValueChange={setSelectedTask}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Select a computational task..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {availableTasks.map((task) => (
                  <SelectItem key={task.name} value={task.name}>
                    <div className="flex items-center justify-between w-full">
                      <span>{task.label}</span>
                      <Badge 
                        className={`ml-2 text-white ${getComplexityColor(task.complexity)}`}
                        variant="secondary"
                      >
                        {task.complexity}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTaskData && (
            <div className="space-y-3 p-4 bg-gray-700 rounded-lg">
              <h4 className="font-medium text-sm text-gray-300">Task Parameters</h4>
              {selectedTaskData.args.map((argName) => (
                <div key={argName} className="space-y-1">
                  <Label htmlFor={argName} className="text-sm capitalize">
                    {argName.replace(/([A-Z])/g, ' $1')}
                  </Label>
                  <Input
                    id={argName}
                    type="number"
                    placeholder={`Enter ${argName}...`}
                    value={taskArgs[argName] || ''}
                    onChange={(e) => handleArgChange(argName, e.target.value)}
                    className="bg-gray-600 border-gray-500"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-400">
              {selectedTaskData && (
                <span>
                  System will automatically decide between local execution and distributed offloading
                </span>
              )}
            </div>
            <Button 
              type="submit" 
              disabled={!selectedTask || executeTaskMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {executeTaskMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Execute Task
                </>
              )}
            </Button>
          </div>
        </form>

        {executeTaskMutation.isPending && (
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center text-sm text-blue-400">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Smart interceptor analyzing system load and deciding execution strategy...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}