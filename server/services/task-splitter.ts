import { createHash } from 'crypto';

interface TaskDependency {
  taskId: string;
  task: {
    name: string;
    args: any[];
    kwargs?: any;
    complexity?: number;
  };
  dependencies: string[];
}

interface TaskCluster {
  clusterId: string;
  tasks: TaskDependency[];
  level: number;
}

export class TaskSplitter {
  private dependencyGraph: Map<string, TaskDependency> = new Map();
  private adjacencyList: Map<string, string[]> = new Map();

  constructor() {
    this.clear();
  }

  clear(): void {
    this.dependencyGraph.clear();
    this.adjacencyList.clear();
  }

  addTask(taskId: string, task: TaskDependency['task'], dependencies: string[] = []): void {
    const taskDep: TaskDependency = {
      taskId,
      task,
      dependencies
    };

    this.dependencyGraph.set(taskId, taskDep);
    
    // Initialize adjacency list for this task
    if (!this.adjacencyList.has(taskId)) {
      this.adjacencyList.set(taskId, []);
    }

    // Add edges from dependencies to this task
    for (const dep of dependencies) {
      if (!this.adjacencyList.has(dep)) {
        this.adjacencyList.set(dep, []);
      }
      this.adjacencyList.get(dep)!.push(taskId);
    }
  }

  splitTasks(): Map<string, TaskCluster> {
    const clusters = new Map<string, TaskCluster>();
    const visited = new Set<string>();
    const levels = this.calculateLevels();

    // Group tasks by their execution level
    const levelGroups = new Map<number, string[]>();
    for (const [taskId, level] of levels.entries()) {
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)!.push(taskId);
    }

    // Create clusters for each level
    for (const [level, taskIds] of levelGroups.entries()) {
      const clusterId = this.generateClusterId(taskIds, level);
      const tasks = taskIds.map(taskId => this.dependencyGraph.get(taskId)!);
      
      clusters.set(clusterId, {
        clusterId,
        tasks,
        level
      });
    }

    return clusters;
  }

  private calculateLevels(): Map<string, number> {
    const levels = new Map<string, number>();
    const visited = new Set<string>();
    
    // Perform topological sort to determine execution levels
    const calculateLevel = (taskId: string): number => {
      if (levels.has(taskId)) {
        return levels.get(taskId)!;
      }

      if (visited.has(taskId)) {
        throw new Error(`Circular dependency detected involving task: ${taskId}`);
      }

      visited.add(taskId);
      
      const task = this.dependencyGraph.get(taskId);
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      let maxDepLevel = -1;
      for (const depId of task.dependencies) {
        const depLevel = calculateLevel(depId);
        maxDepLevel = Math.max(maxDepLevel, depLevel);
      }

      const level = maxDepLevel + 1;
      levels.set(taskId, level);
      visited.delete(taskId);
      
      return level;
    };

    // Calculate levels for all tasks
    for (const taskId of this.dependencyGraph.keys()) {
      if (!levels.has(taskId)) {
        calculateLevel(taskId);
      }
    }

    return levels;
  }

  private generateClusterId(taskIds: string[], level: number): string {
    // Create a deterministic cluster ID based on task dependencies
    const sortedTaskIds = taskIds.sort();
    const dependencySignature = sortedTaskIds.map(taskId => {
      const task = this.dependencyGraph.get(taskId)!;
      return task.dependencies.sort().join(',');
    }).join('|');

    const hash = createHash('md5')
      .update(dependencySignature)
      .digest('hex')
      .substring(0, 8);

    return `L${level}-${hash}`;
  }

  getExecutionOrder(): string[][] {
    const levels = this.calculateLevels();
    const levelGroups = new Map<number, string[]>();

    for (const [taskId, level] of levels.entries()) {
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)!.push(taskId);
    }

    // Sort levels and return execution order
    const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);
    return sortedLevels.map(level => levelGroups.get(level)!);
  }

  canExecuteInParallel(): Map<number, string[]> {
    const levels = this.calculateLevels();
    const parallelGroups = new Map<number, string[]>();

    for (const [taskId, level] of levels.entries()) {
      if (!parallelGroups.has(level)) {
        parallelGroups.set(level, []);
      }
      parallelGroups.get(level)!.push(taskId);
    }

    return parallelGroups;
  }

  validateDependencies(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for undefined dependencies
    for (const [taskId, task] of this.dependencyGraph.entries()) {
      for (const depId of task.dependencies) {
        if (!this.dependencyGraph.has(depId)) {
          errors.push(`Task '${taskId}' depends on undefined task '${depId}'`);
        }
      }
    }

    // Check for circular dependencies
    try {
      this.calculateLevels();
    } catch (error) {
      if (error instanceof Error) {
        errors.push(error.message);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  getTaskInfo(taskId: string): TaskDependency | undefined {
    return this.dependencyGraph.get(taskId);
  }

  getAllTasks(): TaskDependency[] {
    return Array.from(this.dependencyGraph.values());
  }

  getTaskStats(): {
    totalTasks: number;
    levels: number;
    maxParallelism: number;
    averageComplexity: number;
  } {
    const levels = this.calculateLevels();
    const parallelGroups = this.canExecuteInParallel();
    
    let totalComplexity = 0;
    let taskCount = 0;

    for (const task of this.dependencyGraph.values()) {
      totalComplexity += task.task.complexity || 0;
      taskCount++;
    }

    const maxParallelism = Math.max(...Array.from(parallelGroups.values()).map(group => group.length));
    const averageComplexity = taskCount > 0 ? totalComplexity / taskCount : 0;

    return {
      totalTasks: taskCount,
      levels: parallelGroups.size,
      maxParallelism,
      averageComplexity
    };
  }
}