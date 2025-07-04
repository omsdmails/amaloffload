import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const nodes = pgTable("nodes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ip: text("ip").notNull(),
  port: integer("port").notNull().default(5000),
  status: text("status").notNull().default("online"), // online, offline, warning
  load: real("load").notNull().default(0), // 0.0 to 1.0
  lastSeen: timestamp("last_seen").defaultNow(),
  capabilities: jsonb("capabilities").default({}),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  nodeId: integer("node_id").references(() => nodes.id),
  complexity: real("complexity").notNull().default(1),
  duration: real("duration"), // in seconds
  result: jsonb("result"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const systemMetrics = pgTable("system_metrics", {
  id: serial("id").primaryKey(),
  nodeId: integer("node_id").references(() => nodes.id),
  cpuUsage: real("cpu_usage").notNull(),
  memoryUsage: real("memory_usage").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  level: text("level").notNull(), // info, warning, error
  message: text("message").notNull(),
  source: text("source").notNull(),
  nodeId: integer("node_id").references(() => nodes.id),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const broadcastMessages = pgTable("broadcast_messages", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  senderNode: text("sender_node").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  delivered: boolean("delivered").default(false),
  recipients: jsonb("recipients").default([]),
});

export const suggestions = pgTable("suggestions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // feature, bug, improvement
  priority: text("priority").default("medium").notNull(), // low, medium, high
  status: text("status").default("pending").notNull(), // pending, reviewing, approved, rejected, implemented
  submittedBy: text("submitted_by").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
  votes: integer("votes").default(0).notNull(),
  implementation: text("implementation"),
  adminResponse: text("admin_response"),
});

export const insertNodeSchema = createInsertSchema(nodes).omit({
  id: true,
  lastSeen: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertSystemMetricsSchema = createInsertSchema(systemMetrics).omit({
  id: true,
  timestamp: true,
});

export const insertSystemLogSchema = createInsertSchema(systemLogs).omit({
  id: true,
  timestamp: true,
});

export const insertBroadcastMessageSchema = createInsertSchema(broadcastMessages).omit({
  id: true,
  timestamp: true,
  delivered: true,
});

export const insertSuggestionSchema = createInsertSchema(suggestions).omit({
  id: true,
  submittedAt: true,
  votes: true,
});

export type Node = typeof nodes.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type SystemMetrics = typeof systemMetrics.$inferSelect;
export type SystemLog = typeof systemLogs.$inferSelect;
export type BroadcastMessage = typeof broadcastMessages.$inferSelect;
export type Suggestion = typeof suggestions.$inferSelect;

export type InsertNode = z.infer<typeof insertNodeSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertSystemMetrics = z.infer<typeof insertSystemMetricsSchema>;
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;
export type InsertBroadcastMessage = z.infer<typeof insertBroadcastMessageSchema>;
export type InsertSuggestion = z.infer<typeof insertSuggestionSchema>;
