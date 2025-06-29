import { TaskExecutor } from './task-executor';
import { PeerDiscovery } from './peer-discovery';
import { SecurityManager } from './security-manager';
import { storage } from '../storage';
import { networkInterfaces } from 'os';
import type { Task, Node } from '@shared/schema';

export class OffloadSystem {
  private taskExecutor: TaskExecutor;
  private peerDiscovery: PeerDiscovery;
  private securityManager: SecurityManager;
  private isInitialized = false;

  constructor() {
    this.taskExecutor = new TaskExecutor();
    this.peerDiscovery = new PeerDiscovery();
    this.securityManager = new SecurityManager(process.env.SHARED_SECRET || 'my_shared_secret_123');
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Start peer discovery
      await this.peerDiscovery.start();
      
      // Register this node
      await this.registerThisNode();
      
      this.isInitialized = true;
      console.log('Offload system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize offload system:', error);
      throw error;
    }
  }

  private async registerThisNode(): Promise<void> {
    const nodeData = {
      name: process.env.NODE_NAME || `node-${Math.random().toString(36).substr(2, 9)}`,
      ip: this.getLocalIP(),
      port: 5000,
      status: 'online' as const,
      load: 0.0,
      capabilities: {
        maxConcurrentTasks: 4,
        supportedOperations: ['matrix_multiply', 'prime_calculation', 'data_processing']
      }
    };

    await storage.createNode(nodeData);
  }

  private getLocalIP(): string {
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
      const netList = nets[name];
      if (netList) {
        for (const net of netList) {
          if (net.family === 'IPv4' && !net.internal) {
            return net.address;
          }
        }
      }
    }
    return '127.0.0.1';
  }

  async submitTask(task: Task): Promise<void> {
    try {
      // Determine if task should be offloaded
      const shouldOffload = await this.shouldOffloadTask(task);
      
      if (shouldOffload) {
        const targetNode = await this.selectBestNode(task);
        if (targetNode) {
          await this.offloadTask(task, targetNode);
          return;
        }
      }

      // Execute locally if no suitable node found
      await this.executeTaskLocally(task);
    } catch (error) {
      console.error('Error submitting task:', error);
      await storage.updateTask(task.id, {
        status: 'failed',
        error: error.message
      });
    }
  }

  private async shouldOffloadTask(task: Task): Promise<boolean> {
    // Simple heuristic: offload if task complexity > 0.5 or current load > 0.7
    const currentLoad = await this.getCurrentSystemLoad();
    return task.complexity > 0.5 || currentLoad > 0.7;
  }

  private async getCurrentSystemLoad(): Promise<number> {
    // This would normally check actual system metrics
    // For now, return a simulated value
    return Math.random() * 0.8;
  }

  private async selectBestNode(task: Task): Promise<Node | null> {
    const availableNodes = await storage.getAllNodes();
    const onlineNodes = availableNodes.filter(node => 
      node.status === 'online' && node.load < 0.9
    );

    if (onlineNodes.length === 0) return null;

    // Select node with lowest load
    return onlineNodes.reduce((best, current) => 
      current.load < best.load ? current : best
    );
  }

  private async offloadTask(task: Task, targetNode: Node): Promise<void> {
    try {
      // Update task status
      await storage.updateTask(task.id, {
        status: 'processing',
        nodeId: targetNode.id
      });

      // Create secure payload
      const payload = this.securityManager.encryptPayload({
        taskId: task.id,
        functionName: task.name,
        args: [],
        kwargs: {}
      });

      // Send to target node
      const response = await fetch(`http://${targetNode.ip}:${targetNode.port}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to execute task on ${targetNode.name}`);
      }

      const result = await response.json();
      
      // Update task with result
      await storage.updateTask(task.id, {
        status: 'completed',
        result: result.result,
        completedAt: new Date()
      });

      // Log successful offload
      await storage.createSystemLog({
        level: 'info',
        message: `Task ${task.name} offloaded to ${targetNode.name} successfully`,
        source: 'offload-system.ts',
        nodeId: targetNode.id
      });

    } catch (error) {
      console.error('Error offloading task:', error);
      
      // Update task status as failed
      await storage.updateTask(task.id, {
        status: 'failed',
        error: error.message
      });

      // Log failure
      await storage.createSystemLog({
        level: 'error',
        message: `Failed to offload task ${task.name}: ${error.message}`,
        source: 'offload-system.ts',
        nodeId: targetNode.id
      });
    }
  }

  private async executeTaskLocally(task: Task): Promise<void> {
    try {
      await storage.updateTask(task.id, { status: 'processing' });
      
      const result = await this.taskExecutor.execute(task.name, [], {});
      
      await storage.updateTask(task.id, {
        status: 'completed',
        result,
        completedAt: new Date()
      });
    } catch (error) {
      await storage.updateTask(task.id, {
        status: 'failed',
        error: error.message
      });
    }
  }

  async executeTask(functionName: string, args: any[], kwargs: any): Promise<any> {
    return this.taskExecutor.execute(functionName, args, kwargs);
  }
}
