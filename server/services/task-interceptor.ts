import { storage } from '../storage';
import { SystemMonitor } from '../utils/system-monitor';

export class TaskInterceptor {
  private systemMonitor: SystemMonitor;

  constructor() {
    this.systemMonitor = new SystemMonitor();
  }

  /**
   * Decorator function that automatically decides whether to offload a task
   * based on current system load and task complexity
   */
  offloadIfNeeded(func: Function) {
    return async (...args: any[]) => {
      const shouldOffload = await this.shouldOffload(func, args);
      
      if (shouldOffload) {
        return await this.executeRemotely(func.name, args);
      }
      
      return await func(...args);
    };
  }

  /**
   * Determines if a task should be offloaded based on system metrics
   * and task characteristics
   */
  private async shouldOffload(func: Function, args: any[]): Promise<boolean> {
    const metrics = this.systemMonitor.getCurrentMetrics();
    const taskComplexity = this.estimateTaskComplexity(func.name, args);
    
    // Get available nodes
    const nodes = await storage.getAllNodes();
    const availableNodes = nodes.filter(node => 
      node.status === 'online' && node.load < 0.8
    );

    // Decision criteria:
    // 1. High CPU usage (> 70%)
    // 2. High memory usage (> 75%) 
    // 3. High task complexity (> 0.6)
    // 4. Available nodes to offload to
    const highCpuLoad = metrics.cpu > 0.7;
    const highMemoryLoad = metrics.memory > 0.75;
    const complexTask = taskComplexity > 0.6;
    const hasAvailableNodes = availableNodes.length > 0;

    return hasAvailableNodes && (highCpuLoad || highMemoryLoad || complexTask);
  }

  /**
   * Estimates task complexity based on function name and parameters
   */
  private estimateTaskComplexity(functionName: string, args: any[]): number {
    const complexityMap: { [key: string]: number } = {
      'matrix_multiply': 0.8,
      'prime_calculation': 0.7,
      'data_processing': 0.6,
      'image_processing': 0.9,
      'machine_learning': 0.95,
      'data_analysis': 0.5,
      'file_processing': 0.4,
      'simple_calculation': 0.1
    };

    let baseComplexity = complexityMap[functionName] || 0.3;

    // Adjust complexity based on arguments
    if (args.length > 0) {
      const firstArg = args[0];
      if (typeof firstArg === 'number') {
        // Scale complexity based on input size
        if (firstArg > 1000) baseComplexity += 0.2;
        if (firstArg > 10000) baseComplexity += 0.3;
      }
    }

    return Math.min(baseComplexity, 1.0);
  }

  /**
   * Executes a function remotely on the best available node
   */
  private async executeRemotely(functionName: string, args: any[]): Promise<any> {
    try {
      const nodes = await storage.getAllNodes();
      const availableNodes = nodes.filter(node => 
        node.status === 'online' && node.load < 0.8
      );

      if (availableNodes.length === 0) {
        throw new Error('No available nodes for remote execution');
      }

      // Select the node with the lowest load
      const targetNode = availableNodes.reduce((best, current) => 
        current.load < best.load ? current : best
      );

      // Create task record
      const task = await storage.createTask({
        name: functionName,
        status: 'processing',
        nodeId: targetNode.id,
        complexity: this.estimateTaskComplexity(functionName, args),
        result: null,
        error: null,
        duration: null
      });

      // Send request to target node
      const response = await fetch(`http://${targetNode.ip}:${targetNode.port}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: task.id,
          functionName,
          args,
          kwargs: {}
        })
      });

      if (!response.ok) {
        throw new Error(`Remote execution failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Update task status
      await storage.updateTask(task.id, {
        status: 'completed',
        result: result.result,
        duration: Date.now() - task.createdAt!.getTime(),
        completedAt: new Date()
      });

      // Log successful offload
      await storage.createSystemLog({
        level: 'info',
        message: `Task ${functionName} offloaded to ${targetNode.name} successfully`,
        source: 'task-interceptor.ts',
        nodeId: targetNode.id
      });

      return result.result;

    } catch (error) {
      console.error('Remote execution failed:', error);
      
      // Log failure
      await storage.createSystemLog({
        level: 'error',
        message: `Failed to offload task ${functionName}: ${error.message}`,
        source: 'task-interceptor.ts',
        nodeId: null
      });

      throw error;
    }
  }

  /**
   * Creates a decorator function for automatic task offloading
   */
  static createOffloadDecorator(interceptor: TaskInterceptor) {
    return function offload(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      
      descriptor.value = async function (...args: any[]) {
        const shouldOffload = await interceptor.shouldOffload(originalMethod, args);
        
        if (shouldOffload) {
          return await interceptor.executeRemotely(propertyKey, args);
        }
        
        return await originalMethod.apply(this, args);
      };
      
      return descriptor;
    };
  }
}