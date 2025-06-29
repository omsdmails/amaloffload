import { 
  nodes, 
  tasks, 
  systemMetrics, 
  systemLogs,
  broadcastMessages,
  type Node, 
  type Task, 
  type SystemMetrics, 
  type SystemLog,
  type BroadcastMessage,
  type InsertNode, 
  type InsertTask, 
  type InsertSystemMetrics, 
  type InsertSystemLog,
  type InsertBroadcastMessage
} from "@shared/schema";

export interface IStorage {
  // Nodes
  createNode(node: InsertNode): Promise<Node>;
  getNode(id: number): Promise<Node | undefined>;
  getAllNodes(): Promise<Node[]>;
  updateNode(id: number, updates: Partial<Node>): Promise<Node | undefined>;
  deleteNode(id: number): Promise<boolean>;
  
  // Tasks
  createTask(task: InsertTask): Promise<Task>;
  getTask(id: number): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  getTasksByStatus(status: string): Promise<Task[]>;
  updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined>;
  
  // System Metrics
  createSystemMetrics(metrics: InsertSystemMetrics): Promise<SystemMetrics>;
  getLatestMetrics(nodeId?: number): Promise<SystemMetrics[]>;
  
  // System Logs
  createSystemLog(log: InsertSystemLog): Promise<SystemLog>;
  getRecentLogs(limit?: number): Promise<SystemLog[]>;
  
  // Broadcast Messages
  createBroadcastMessage(message: InsertBroadcastMessage): Promise<BroadcastMessage>;
  getAllBroadcastMessages(): Promise<BroadcastMessage[]>;
  updateBroadcastMessage(id: number, updates: Partial<BroadcastMessage>): Promise<BroadcastMessage | undefined>;
}

export class MemStorage implements IStorage {
  private nodes: Map<number, Node> = new Map();
  private tasks: Map<number, Task> = new Map();
  private systemMetrics: Map<number, SystemMetrics> = new Map();
  private systemLogs: Map<number, SystemLog> = new Map();
  
  private currentNodeId = 1;
  private currentTaskId = 1;
  private currentMetricsId = 1;
  private currentLogId = 1;

  constructor() {
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample nodes
    const sampleNodes = [
      { name: "node-001", ip: "192.168.1.10", port: 5000, status: "online", load: 0.24 },
      { name: "node-002", ip: "192.168.1.15", port: 5000, status: "online", load: 0.67 },
      { name: "node-003", ip: "89.111.171.92", port: 5000, status: "warning", load: 0.89 },
      { name: "node-004", ip: "192.168.1.25", port: 5000, status: "online", load: 0.12 },
    ];

    sampleNodes.forEach(node => {
      const newNode: Node = {
        id: this.currentNodeId++,
        ...node,
        lastSeen: new Date(),
        capabilities: {}
      };
      this.nodes.set(newNode.id, newNode);
    });

    // Create sample tasks
    const sampleTasks = [
      { name: "matrix_multiply", status: "completed", nodeId: 1, complexity: 0.8, duration: 2.3 },
      { name: "prime_calculation", status: "processing", nodeId: 2, complexity: 0.6, duration: null },
      { name: "data_processing", status: "pending", nodeId: null, complexity: 0.4, duration: null },
      { name: "image_processing", status: "failed", nodeId: 3, complexity: 0.9, duration: 1.2, error: "Memory allocation failed" },
    ];

    sampleTasks.forEach(task => {
      const newTask: Task = {
        id: this.currentTaskId++,
        ...task,
        result: task.status === "completed" ? { success: true } : null,
        createdAt: new Date(),
        completedAt: task.status === "completed" ? new Date() : null
      };
      this.tasks.set(newTask.id, newTask);
    });

    // Create sample logs
    const sampleLogs = [
      { level: "info", message: "Task offloaded to node-001 successfully", source: "distributed_executor.py:94", nodeId: 1 },
      { level: "info", message: "New peer discovered: 192.168.1.25", source: "peer_discovery.py:28", nodeId: null },
      { level: "warning", message: "High CPU usage detected (89%)", source: "processor_manager.py:42", nodeId: 3 },
      { level: "error", message: "Task execution failed on node-003", source: "rpc_server.py:67", nodeId: 3 },
    ];

    sampleLogs.forEach(log => {
      const newLog: SystemLog = {
        id: this.currentLogId++,
        ...log,
        timestamp: new Date()
      };
      this.systemLogs.set(newLog.id, newLog);
    });
  }

  // Node operations
  async createNode(node: InsertNode): Promise<Node> {
    const newNode: Node = {
      id: this.currentNodeId++,
      ...node,
      lastSeen: new Date(),
      capabilities: node.capabilities || {}
    };
    this.nodes.set(newNode.id, newNode);
    return newNode;
  }

  async getNode(id: number): Promise<Node | undefined> {
    return this.nodes.get(id);
  }

  async getAllNodes(): Promise<Node[]> {
    return Array.from(this.nodes.values());
  }

  async updateNode(id: number, updates: Partial<Node>): Promise<Node | undefined> {
    const node = this.nodes.get(id);
    if (!node) return undefined;
    
    const updatedNode = { ...node, ...updates };
    this.nodes.set(id, updatedNode);
    return updatedNode;
  }

  async deleteNode(id: number): Promise<boolean> {
    return this.nodes.delete(id);
  }

  // Task operations
  async createTask(task: InsertTask): Promise<Task> {
    const newTask: Task = {
      id: this.currentTaskId++,
      ...task,
      createdAt: new Date(),
      completedAt: null
    };
    this.tasks.set(newTask.id, newTask);
    return newTask;
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.status === status);
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updates };
    if (updates.status === "completed" && !updatedTask.completedAt) {
      updatedTask.completedAt = new Date();
    }
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  // System Metrics operations
  async createSystemMetrics(metrics: InsertSystemMetrics): Promise<SystemMetrics> {
    const newMetrics: SystemMetrics = {
      id: this.currentMetricsId++,
      ...metrics,
      timestamp: new Date()
    };
    this.systemMetrics.set(newMetrics.id, newMetrics);
    return newMetrics;
  }

  async getLatestMetrics(nodeId?: number): Promise<SystemMetrics[]> {
    const allMetrics = Array.from(this.systemMetrics.values());
    if (nodeId) {
      return allMetrics.filter(m => m.nodeId === nodeId);
    }
    return allMetrics;
  }

  // System Logs operations
  async createSystemLog(log: InsertSystemLog): Promise<SystemLog> {
    const newLog: SystemLog = {
      id: this.currentLogId++,
      ...log,
      timestamp: new Date()
    };
    this.systemLogs.set(newLog.id, newLog);
    return newLog;
  }

  async getRecentLogs(limit = 50): Promise<SystemLog[]> {
    return Array.from(this.systemLogs.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

import { db } from "./db";
import { eq } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getNode(id: number): Promise<Node | undefined> {
    const [node] = await db.select().from(nodes).where(eq(nodes.id, id));
    return node || undefined;
  }

  async getAllNodes(): Promise<Node[]> {
    return await db.select().from(nodes);
  }

  async createNode(node: InsertNode): Promise<Node> {
    const [newNode] = await db
      .insert(nodes)
      .values(node)
      .returning();
    return newNode;
  }

  async updateNode(id: number, updates: Partial<Node>): Promise<Node | undefined> {
    const [updatedNode] = await db
      .update(nodes)
      .set(updates)
      .where(eq(nodes.id, id))
      .returning();
    return updatedNode || undefined;
  }

  async deleteNode(id: number): Promise<boolean> {
    const result = await db.delete(nodes).where(eq(nodes.id, id));
    return result.rowCount > 0;
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.status, status));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values(task)
      .returning();
    return newTask;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask || undefined;
  }

  async createSystemMetrics(metrics: InsertSystemMetrics): Promise<SystemMetrics> {
    const [newMetrics] = await db
      .insert(systemMetrics)
      .values(metrics)
      .returning();
    return newMetrics;
  }

  async getLatestMetrics(nodeId?: number): Promise<SystemMetrics[]> {
    let query = db.select().from(systemMetrics);
    
    if (nodeId) {
      query = query.where(eq(systemMetrics.nodeId, nodeId));
    }
    
    return await query.orderBy(systemMetrics.timestamp).limit(50);
  }

  async createSystemLog(log: InsertSystemLog): Promise<SystemLog> {
    const [newLog] = await db
      .insert(systemLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getRecentLogs(limit = 50): Promise<SystemLog[]> {
    return await db
      .select()
      .from(systemLogs)
      .orderBy(systemLogs.timestamp)
      .limit(limit);
  }

  async createBroadcastMessage(message: InsertBroadcastMessage): Promise<BroadcastMessage> {
    const [newMessage] = await db
      .insert(broadcastMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getAllBroadcastMessages(): Promise<BroadcastMessage[]> {
    return await db
      .select()
      .from(broadcastMessages)
      .orderBy(broadcastMessages.timestamp);
  }

  async updateBroadcastMessage(id: number, updates: Partial<BroadcastMessage>): Promise<BroadcastMessage | undefined> {
    const [updatedMessage] = await db
      .update(broadcastMessages)
      .set(updates)
      .where(eq(broadcastMessages.id, id))
      .returning();
    return updatedMessage || undefined;
  }
}

export const storage = new DatabaseStorage();
